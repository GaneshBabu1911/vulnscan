"""SSL/TLS Certificate Checker."""

import socket
import ssl
from datetime import datetime, timezone


class SSLChecker:
    WEAK_CIPHERS = [
        "RC4", "DES", "3DES", "MD5", "NULL", "EXPORT", "anon",
    ]

    def check(self, hostname, port=443, progress_callback=None):
        if progress_callback:
            progress_callback(f"Checking SSL/TLS for {hostname}...")

        result = {
            "hostname": hostname,
            "valid": False,
            "issuer": None,
            "subject": None,
            "expiry": None,
            "days_until_expiry": None,
            "protocol": None,
            "tls_version": None,
            "cipher": None,
            "weak_cipher": False,
            "vulnerabilities": [],
        }

        try:
            context = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    result["valid"] = True
                    result["protocol"] = ssock.version()
                    result["tls_version"] = ssock.version()
                    result["cipher"] = ssock.cipher()

                    if cert:
                        issuer = dict(x[0] for x in cert.get("issuer", []))
                        subject = dict(x[0] for x in cert.get("subject", []))
                        result["issuer"] = issuer.get("organizationName", "Unknown")
                        result["subject"] = subject.get("commonName", hostname)

                        not_after = cert.get("notAfter")
                        if not_after:
                            expiry = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                            expiry = expiry.replace(tzinfo=timezone.utc)
                            result["expiry"] = expiry.isoformat()
                            days_left = (expiry - datetime.now(timezone.utc)).days
                            result["days_until_expiry"] = days_left

                            if days_left < 0:
                                result["vulnerabilities"].append({
                                    "name": "Expired SSL Certificate",
                                    "severity": "critical",
                                    "description": f"Certificate expired {abs(days_left)} days ago.",
                                    "evidence": f"Expiry: {not_after}",
                                    "source": "ssl",
                                })
                            elif days_left < 30:
                                result["vulnerabilities"].append({
                                    "name": "SSL Certificate Expiring Soon",
                                    "severity": "high",
                                    "description": f"Certificate expires in {days_left} days.",
                                    "evidence": f"Expiry: {not_after}",
                                    "source": "ssl",
                                })

                    cipher_name = ssock.cipher()[0] if ssock.cipher() else ""
                    for weak in self.WEAK_CIPHERS:
                        if weak in cipher_name.upper():
                            result["weak_cipher"] = True
                            result["vulnerabilities"].append({
                                "name": "Weak Cipher Suite Detected",
                                "severity": "high",
                                "description": f"Weak cipher in use: {cipher_name}",
                                "evidence": cipher_name,
                                "source": "ssl",
                            })
                            break

                    if ssock.version() in ("SSLv2", "SSLv3", "TLSv1", "TLSv1.1"):
                        result["vulnerabilities"].append({
                            "name": f"Outdated TLS Version: {ssock.version()}",
                            "severity": "high",
                            "description": "TLS 1.0/1.1 and SSL are deprecated and insecure.",
                            "evidence": ssock.version(),
                            "source": "ssl",
                        })

        except ssl.SSLCertVerificationError as e:
            result["vulnerabilities"].append({
                "name": "SSL Certificate Verification Failed",
                "severity": "high",
                "description": str(e),
                "evidence": str(e),
                "source": "ssl",
            })
        except ConnectionRefusedError:
            if progress_callback:
                progress_callback(f"No SSL service on port {port}")
        except Exception as e:
            result["vulnerabilities"].append({
                "name": "SSL Check Error",
                "severity": "info",
                "description": str(e),
                "evidence": str(e),
                "source": "ssl",
            })

        if progress_callback:
            status = "valid" if result["valid"] else "issues found"
            progress_callback(f"SSL check complete: {status}")

        return result
