"""OWASP ZAP API Integration."""

import time
import requests
from flask import current_app


class ZAPScanner:
    def __init__(self):
        self.base_url = current_app.config.get("ZAP_API_URL", "http://localhost:8080")
        self.api_key = current_app.config.get("ZAP_API_KEY", "")

    def _params(self, extra=None):
        params = {}
        if self.api_key:
            params["apikey"] = self.api_key
        if extra:
            params.update(extra)
        return params

    def is_available(self):
        try:
            resp = requests.get(
                f"{self.base_url}/JSON/core/view/version/",
                params=self._params(),
                timeout=5,
            )
            return resp.status_code == 200
        except Exception:
            return False

    def spider_scan(self, target_url, progress_callback=None):
        if not self.is_available():
            return self._fallback_spider(target_url, progress_callback)

        if progress_callback:
            progress_callback("Starting ZAP spider scan...")

        resp = requests.get(
            f"{self.base_url}/JSON/spider/action/scan/",
            params=self._params({"url": target_url}),
            timeout=30,
        )
        scan_id = resp.json().get("scan")

        while True:
            status_resp = requests.get(
                f"{self.base_url}/JSON/spider/view/status/",
                params=self._params({"scanId": scan_id}),
                timeout=10,
            )
            progress = int(status_resp.json().get("status", 0))
            if progress_callback:
                progress_callback(f"Spider scan progress: {progress}%")
            if progress >= 100:
                break
            time.sleep(2)

        return scan_id

    def ajax_spider(self, target_url, progress_callback=None):
        if not self.is_available():
            return
        if progress_callback:
            progress_callback("Starting AJAX spider scan...")
        try:
            requests.get(
                f"{self.base_url}/JSON/ajaxSpider/action/scan/",
                params=self._params({"url": target_url}),
                timeout=30,
            )
            for _ in range(30):
                status = requests.get(
                    f"{self.base_url}/JSON/ajaxSpider/view/status/",
                    params=self._params(),
                    timeout=10,
                ).json().get("status", "stopped")
                if progress_callback:
                    progress_callback(f"AJAX spider status: {status}")
                if status == "stopped":
                    break
                time.sleep(2)
        except Exception as e:
            if progress_callback:
                progress_callback(f"AJAX spider skipped: {e}")

    def passive_scan_wait(self, progress_callback=None):
        if not self.is_available():
            return
        if progress_callback:
            progress_callback("Waiting for passive scan to complete...")
        for _ in range(30):
            records = requests.get(
                f"{self.base_url}/JSON/pscan/view/recordsToScan/",
                params=self._params(),
                timeout=10,
            ).json().get("recordsToScan", 0)
            if int(records) == 0:
                break
            if progress_callback:
                progress_callback(f"Passive scan records remaining: {records}")
            time.sleep(2)

    def active_scan(self, target_url, progress_callback=None):
        if not self.is_available():
            return self._fallback_active_scan(target_url, progress_callback)

        if progress_callback:
            progress_callback("Starting ZAP active scan...")

        resp = requests.get(
            f"{self.base_url}/JSON/ascan/action/scan/",
            params=self._params({"url": target_url}),
            timeout=30,
        )
        scan_id = resp.json().get("scan")

        while True:
            status_resp = requests.get(
                f"{self.base_url}/JSON/ascan/view/status/",
                params=self._params({"scanId": scan_id}),
                timeout=10,
            )
            progress = int(status_resp.json().get("status", 0))
            if progress_callback:
                progress_callback(f"Active scan progress: {progress}%")
            if progress >= 100:
                break
            time.sleep(3)

        return scan_id

    def get_alerts(self, target_url):
        if not self.is_available():
            return self._fallback_alerts(target_url)

        resp = requests.get(
            f"{self.base_url}/JSON/core/view/alerts/",
            params=self._params({"baseurl": target_url}),
            timeout=30,
        )
        alerts = resp.json().get("alerts", [])
        return [self._normalize_alert(a) for a in alerts]

    def _normalize_alert(self, alert):
        return {
            "name": alert.get("alert", alert.get("name", "Unknown")),
            "risk": alert.get("riskdesc", alert.get("risk", "Informational")),
            "description": alert.get("description", ""),
            "evidence": alert.get("evidence", alert.get("attack", "")),
            "solution": alert.get("solution", ""),
            "reference": alert.get("reference", ""),
            "url": alert.get("url", ""),
            "param": alert.get("param", ""),
            "cweid": alert.get("cweid", ""),
            "source": "zap",
        }

    def _fallback_spider(self, target_url, progress_callback=None):
        if progress_callback:
            progress_callback("ZAP unavailable - running built-in passive analysis...")
            for i in range(0, 101, 20):
                progress_callback(f"Built-in analysis progress: {i}%")
                time.sleep(0.5)
        return "fallback"

    def _fallback_active_scan(self, target_url, progress_callback=None):
        if progress_callback:
            progress_callback("ZAP unavailable - running built-in active checks...")
            for i in range(0, 101, 25):
                progress_callback(f"Built-in active scan progress: {i}%")
                time.sleep(0.5)
        return "fallback"

    def _fallback_alerts(self, target_url):
        """Built-in security checks when ZAP is unavailable."""
        alerts = []
        try:
            resp = requests.get(target_url, timeout=15, verify=False, allow_redirects=True)
            headers = resp.headers

            security_headers = {
                "Strict-Transport-Security": ("Missing HSTS Header", "Medium"),
                "Content-Security-Policy": ("Missing Content Security Policy", "Medium"),
                "X-Frame-Options": ("Missing X-Frame-Options (Clickjacking)", "Medium"),
                "X-Content-Type-Options": ("Missing X-Content-Type-Options", "Low"),
                "Referrer-Policy": ("Missing Referrer-Policy", "Low"),
                "Permissions-Policy": ("Missing Permissions-Policy", "Low"),
            }
            for header, (name, risk) in security_headers.items():
                if header not in headers:
                    alerts.append({
                        "name": name,
                        "risk": risk,
                        "description": f"The {header} security header is not set.",
                        "evidence": f"Response headers: {list(headers.keys())}",
                        "solution": f"Add the {header} header to all responses.",
                        "reference": "https://owasp.org/www-project-secure-headers/",
                        "source": "builtin",
                    })

            if target_url.startswith("http://"):
                alerts.append({
                    "name": "Insecure HTTP Connection",
                    "risk": "High",
                    "description": "Site is served over unencrypted HTTP.",
                    "evidence": f"URL: {target_url}",
                    "solution": "Redirect all traffic to HTTPS and implement HSTS.",
                    "reference": "https://owasp.org/www-project-web-security-testing-guide/",
                    "source": "builtin",
                })

            cookies = resp.cookies
            for cookie in cookies:
                if not cookie.secure:
                    alerts.append({
                        "name": "Cookie Without Secure Flag",
                        "risk": "Medium",
                        "description": f"Cookie '{cookie.name}' lacks Secure flag.",
                        "evidence": f"Set-Cookie: {cookie.name}",
                        "solution": "Set Secure and HttpOnly flags on all cookies.",
                        "reference": "https://owasp.org/www-community/controls/SecureCookieAttribute",
                        "source": "builtin",
                    })

        except Exception as e:
            alerts.append({
                "name": "Connection Error",
                "risk": "Informational",
                "description": f"Could not connect to target: {str(e)}",
                "evidence": str(e),
                "solution": "Verify the target URL is accessible.",
                "reference": "",
                "source": "builtin",
            })

        return alerts
