"""HTTP Security Header Checker."""

import requests


class HeaderChecker:
    REQUIRED_HEADERS = {
        "Strict-Transport-Security": {
            "severity": "medium",
            "description": "HSTS prevents protocol downgrade attacks and cookie hijacking.",
            "recommendation": "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains",
        },
        "Content-Security-Policy": {
            "severity": "medium",
            "description": "CSP helps prevent XSS and data injection attacks.",
            "recommendation": "Add a restrictive Content-Security-Policy header.",
        },
        "X-Frame-Options": {
            "severity": "medium",
            "description": "Prevents clickjacking by controlling iframe embedding.",
            "recommendation": "Add: X-Frame-Options: DENY or SAMEORIGIN",
        },
        "X-Content-Type-Options": {
            "severity": "low",
            "description": "Prevents MIME-type sniffing attacks.",
            "recommendation": "Add: X-Content-Type-Options: nosniff",
        },
        "Referrer-Policy": {
            "severity": "low",
            "description": "Controls referrer information sent with requests.",
            "recommendation": "Add: Referrer-Policy: strict-origin-when-cross-origin",
        },
        "Permissions-Policy": {
            "severity": "low",
            "description": "Controls browser feature access (camera, microphone, etc.).",
            "recommendation": "Add appropriate Permissions-Policy directives.",
        },
    }

    def check(self, url, progress_callback=None):
        if progress_callback:
            progress_callback("Checking HTTP security headers...")

        result = {"url": url, "headers": {}, "missing": [], "vulnerabilities": []}

        try:
            resp = requests.get(url, timeout=15, verify=False, allow_redirects=True)
            for header in self.REQUIRED_HEADERS:
                value = resp.headers.get(header)
                result["headers"][header] = value
                if not value:
                    info = self.REQUIRED_HEADERS[header]
                    result["missing"].append(header)
                    result["vulnerabilities"].append({
                        "name": f"Missing {header}",
                        "severity": info["severity"],
                        "description": info["description"],
                        "evidence": f"Header not present in response from {url}",
                        "solution": info["recommendation"],
                        "reference": "https://owasp.org/www-project-secure-headers/",
                        "source": "headers",
                    })

            server = resp.headers.get("Server", "")
            if server:
                result["headers"]["Server"] = server
                result["vulnerabilities"].append({
                    "name": "Server Version Disclosure",
                    "severity": "low",
                    "description": f"Server header reveals: {server}",
                    "evidence": f"Server: {server}",
                    "solution": "Remove or obfuscate the Server header.",
                    "source": "headers",
                })

            x_powered = resp.headers.get("X-Powered-By", "")
            if x_powered:
                result["vulnerabilities"].append({
                    "name": "Technology Stack Disclosure",
                    "severity": "low",
                    "description": f"X-Powered-By reveals: {x_powered}",
                    "evidence": f"X-Powered-By: {x_powered}",
                    "solution": "Remove the X-Powered-By header.",
                    "source": "headers",
                })

        except Exception as e:
            result["vulnerabilities"].append({
                "name": "Header Check Failed",
                "severity": "info",
                "description": str(e),
                "evidence": str(e),
                "source": "headers",
            })

        if progress_callback:
            progress_callback(
                f"Header check complete: {len(result['missing'])} missing headers"
            )

        return result
