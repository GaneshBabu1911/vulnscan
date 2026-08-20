"""Scan orchestrator - coordinates all scanning modules."""

import socket
import threading
from datetime import datetime, timezone

from flask import current_app

from app.database import db
from app.models import Notification, Recommendation, Scan, Target, Vulnerability
from app.scanner.header_checker import HeaderChecker
from app.scanner.nmap_scanner import NmapScanner
from app.scanner.ssl_checker import SSLChecker
from app.scanner.zap_scanner import ZAPScanner
from app.services.ai_engine import AIRecommendationEngine
from app.services.auth_service import send_critical_alert_email, send_scan_complete_email
from app.services.risk_engine import calculate_overall_risk, score_vulnerability, score_zap_alert
from app.utils.validators import extract_domain_from_url


class ScanOrchestrator:
    def __init__(self, scan_id, app):
        self.scan_id = scan_id
        self.app = app
        self.logs = []

    def _log(self, message):
        timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        self.logs.append(entry)
        with self.app.app_context():
            scan = Scan.query.get(self.scan_id)
            if scan:
                scan.logs = "\n".join(self.logs)
                db.session.commit()

    def run(self):
        with self.app.app_context():
            scan = Scan.query.get(self.scan_id)
            if not scan:
                return

            scan.status = "running"
            scan.started_at = datetime.now(timezone.utc)
            scan.progress = 5
            db.session.commit()

            try:
                target = scan.target
                url = target.url
                domain = target.domain or extract_domain_from_url(url)

                all_vulns = []

                self._log(f"Starting vulnerability assessment for {url}")
                scan.progress = 10
                db.session.commit()

                # Phase 1: HTTP Security Headers
                self._log("Phase 1/5: HTTP Security Header Analysis")
                header_checker = HeaderChecker()
                header_result = header_checker.check(url, self._log)
                for v in header_result.get("vulnerabilities", []):
                    scored = score_vulnerability(v["name"], "headers", v.get("severity"))
                    v.update(scored)
                    all_vulns.append(v)
                scan.progress = 25
                db.session.commit()

                # Phase 2: SSL/TLS Check
                self._log("Phase 2/5: SSL/TLS Certificate Analysis")
                if domain and url.startswith("https"):
                    ssl_checker = SSLChecker()
                    ssl_result = ssl_checker.check(domain, progress_callback=self._log)
                    for v in ssl_result.get("vulnerabilities", []):
                        scored = score_vulnerability(v["name"], "ssl", v.get("severity"))
                        v.update(scored)
                        all_vulns.append(v)
                else:
                    self._log("Skipping SSL check (non-HTTPS target)")
                scan.progress = 40
                db.session.commit()

                # Phase 3: OWASP ZAP Scan
                self._log("Phase 3/5: OWASP ZAP Vulnerability Scan")
                zap = ZAPScanner()
                zap.spider_scan(url, self._log)
                zap.ajax_spider(url, self._log)
                zap.passive_scan_wait(self._log)
                zap.active_scan(url, self._log)
                zap_alerts = zap.get_alerts(url)
                for alert in zap_alerts:
                    scored = score_zap_alert(alert)
                    risk_str = alert.get("risk", "Informational")
                    if isinstance(risk_str, str) and "(" in risk_str:
                        risk_str = risk_str.split("(")[0].strip()
                    extra = score_vulnerability(alert["name"], "zap", risk_str)
                    alert.update(scored)
                    alert.update({k: v for k, v in extra.items() if k not in alert})
                    all_vulns.append(alert)
                scan.progress = 65
                db.session.commit()

                # Phase 4: Nmap Port Scan
                self._log("Phase 4/5: Network Port Scan (Nmap)")
                nmap = NmapScanner()
                scan_target = target.ip_address or domain
                if scan_target:
                    nmap_result = nmap.scan(scan_target, self._log)
                    for v in nmap_result.get("vulnerabilities", []):
                        scored = score_vulnerability(v["name"], "nmap", v.get("severity"))
                        v.update(scored)
                        all_vulns.append(v)
                    open_ports = len(nmap_result.get("open_ports", []))
                    self._log(f"Network scan found {open_ports} open ports")
                scan.progress = 85
                db.session.commit()

                # Phase 5: AI Recommendations
                self._log("Phase 5/5: Generating AI Recommendations")
                ai_engine = AIRecommendationEngine()
                recommendations = ai_engine.generate_recommendations(all_vulns)

                # Save vulnerabilities
                for v_data in all_vulns:
                    vuln = Vulnerability(
                        scan_id=scan.id,
                        name=v_data.get("name", "Unknown"),
                        category=v_data.get("category", "General"),
                        severity=v_data.get("severity", "info"),
                        cvss_score=v_data.get("cvss_score", 0.0),
                        cvss_vector=v_data.get("cvss_vector", ""),
                        description=v_data.get("description", ""),
                        evidence=v_data.get("evidence", ""),
                        solution=v_data.get("solution", ""),
                        reference=v_data.get("reference", ""),
                        source=v_data.get("source", "unknown"),
                        cwe_id=v_data.get("cwe_id", v_data.get("cweid", "")),
                    )
                    db.session.add(vuln)

                db.session.flush()

                for rec_data in recommendations:
                    rec = Recommendation(
                        scan_id=scan.id,
                        title=rec_data.get("title", "Recommendation"),
                        explanation=rec_data.get("explanation", ""),
                        impact=rec_data.get("impact", ""),
                        fix_steps=rec_data.get("fix_steps", ""),
                        best_practices=rec_data.get("best_practices", ""),
                        preventive_measures=rec_data.get("preventive_measures", ""),
                        priority=rec_data.get("priority", "medium"),
                    )
                    db.session.add(rec)

                risk_score, overall_severity = calculate_overall_risk(all_vulns)
                scan.risk_score = risk_score
                scan.overall_severity = overall_severity
                scan.status = "completed"
                scan.progress = 100
                scan.completed_at = datetime.now(timezone.utc)
                db.session.commit()

                self._log(f"Scan completed. Risk score: {risk_score}/10 ({overall_severity})")

                # Notifications
                user = scan.user
                notif = Notification(
                    user_id=user.id,
                    title="Scan Completed",
                    message=f"Scan of {url} completed with risk score {risk_score}",
                    type="scan_complete",
                )
                db.session.add(notif)

                critical_count = sum(1 for v in all_vulns if v.get("severity") == "critical")
                if critical_count > 0:
                    crit_notif = Notification(
                        user_id=user.id,
                        title=f"CRITICAL: {critical_count} vulnerabilities found",
                        message=f"Scan of {url} detected {critical_count} critical issues.",
                        type="critical_alert",
                    )
                    db.session.add(crit_notif)
                    send_critical_alert_email(user, scan, critical_count)

                db.session.commit()
                send_scan_complete_email(user, scan)

            except Exception as e:
                self._log(f"Scan failed: {str(e)}")
                scan.status = "failed"
                scan.logs = "\n".join(self.logs)
                db.session.commit()
                current_app.logger.error(f"Scan {self.scan_id} failed: {e}")


def start_scan_async(scan_id, app):
    orchestrator = ScanOrchestrator(scan_id, app)
    thread = threading.Thread(target=orchestrator.run, daemon=True)
    thread.start()
    return thread


def resolve_ip(domain):
    try:
        return socket.gethostbyname(domain)
    except socket.gaierror:
        return None
