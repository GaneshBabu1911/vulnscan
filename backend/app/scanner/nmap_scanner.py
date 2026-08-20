"""Nmap port and service scanner."""

import socket
from flask import current_app

COMMON_PORTS = [
    21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445,
    993, 995, 1723, 3306, 3389, 5900, 8080, 8443,
]

SERVICE_MAP = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
    80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 445: "SMB",
    3306: "MySQL", 3389: "RDP", 8080: "HTTP-Proxy", 8443: "HTTPS-Alt",
}


class NmapScanner:
    def scan(self, target, progress_callback=None):
        if progress_callback:
            progress_callback(f"Starting port scan on {target}...")

        try:
            import nmap
            nm = nmap.PortScanner()
            nm.scan(target, arguments="-sV -T4 --top-ports 100")
            return self._parse_nmap_results(nm, target, progress_callback)
        except ImportError:
            if progress_callback:
                progress_callback("python-nmap unavailable - using socket scan...")
            return self._socket_scan(target, progress_callback)
        except Exception as e:
            if progress_callback:
                progress_callback(f"Nmap scan failed: {e} - falling back to socket scan...")
            return self._socket_scan(target, progress_callback)

    def _parse_nmap_results(self, nm, target, progress_callback=None):
        results = {"host": target, "open_ports": [], "os": None, "vulnerabilities": []}

        if target not in nm.all_hosts():
            hosts = nm.all_hosts()
            if not hosts:
                return results
            target = hosts[0]

        if "osmatch" in nm[target] and nm[target]["osmatch"]:
            results["os"] = nm[target]["osmatch"][0].get("name", "Unknown")

        for proto in nm[target].all_protocols():
            ports = nm[target][proto].keys()
            for port in ports:
                port_info = nm[target][proto][port]
                if port_info["state"] == "open":
                    entry = {
                        "port": port,
                        "protocol": proto,
                        "service": port_info.get("name", "unknown"),
                        "version": port_info.get("version", ""),
                        "product": port_info.get("product", ""),
                    }
                    results["open_ports"].append(entry)
                    vuln = self._check_service_vulnerabilities(entry)
                    if vuln:
                        results["vulnerabilities"].extend(vuln)

        if progress_callback:
            progress_callback(f"Found {len(results['open_ports'])} open ports")

        return results

    def _socket_scan(self, target, progress_callback=None):
        results = {"host": target, "open_ports": [], "os": None, "vulnerabilities": []}
        resolved = target
        try:
            resolved = socket.gethostbyname(target)
        except socket.gaierror:
            if progress_callback:
                progress_callback(f"Could not resolve {target}")
            return results

        total = len(COMMON_PORTS)
        for i, port in enumerate(COMMON_PORTS):
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex((resolved, port))
                if result == 0:
                    entry = {
                        "port": port,
                        "protocol": "tcp",
                        "service": SERVICE_MAP.get(port, "unknown"),
                        "version": "",
                        "product": "",
                    }
                    results["open_ports"].append(entry)
                    vuln = self._check_service_vulnerabilities(entry)
                    if vuln:
                        results["vulnerabilities"].extend(vuln)
                sock.close()
            except Exception:
                pass
            if progress_callback and i % 5 == 0:
                progress_callback(f"Port scan progress: {int((i / total) * 100)}%")

        if progress_callback:
            progress_callback(f"Socket scan complete: {len(results['open_ports'])} open ports")

        return results

    def _check_service_vulnerabilities(self, port_info):
        vulns = []
        port = port_info["port"]
        service = port_info.get("service", "")

        risky_ports = {
            21: ("FTP Service Exposed", "medium", "FTP transmits credentials in plaintext. Consider SFTP."),
            23: ("Telnet Service Exposed", "high", "Telnet is unencrypted. Disable and use SSH."),
            445: ("SMB Service Exposed", "high", "SMB can be exploited for remote code execution."),
            3389: ("RDP Service Exposed", "high", "RDP exposed to internet increases brute-force risk."),
            3306: ("MySQL Database Exposed", "critical", "Database should not be publicly accessible."),
        }

        if port in risky_ports:
            name, severity, desc = risky_ports[port]
            vulns.append({
                "name": name,
                "severity": severity,
                "description": desc,
                "evidence": f"Port {port}/{port_info.get('protocol', 'tcp')} - {service}",
                "source": "nmap",
            })

        return vulns
