"""Report generation - PDF, CSV, JSON."""

import csv
import io
import json
import os
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models import Scan, Vulnerability


class ReportGenerator:
    REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "output")

    def __init__(self):
        os.makedirs(self.REPORTS_DIR, exist_ok=True)

    def generate_pdf(self, scan):
        filename = f"report_scan_{scan.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.REPORTS_DIR, filename)

        doc = SimpleDocTemplate(filepath, pagesize=A4, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=22, textColor=colors.HexColor("#00ff41"))
        heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=14, textColor=colors.HexColor("#0080ff"))
        body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14, alignment=TA_JUSTIFY)
        center_style = ParagraphStyle("Center", parent=styles["Normal"], alignment=TA_CENTER, fontSize=10)

        elements = []

        elements.append(Paragraph("VulnScan Security Assessment Report", title_style))
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", center_style))
        elements.append(Spacer(1, 0.5 * inch))

        elements.append(Paragraph("Executive Summary", heading_style))
        elements.append(Spacer(1, 0.1 * inch))
        target_url = scan.target.url if scan.target else "N/A"
        vulns = Vulnerability.query.filter_by(scan_id=scan.id).all()
        critical = sum(1 for v in vulns if v.severity == "critical")
        high = sum(1 for v in vulns if v.severity == "high")
        summary = (
            f"This report presents the findings of an automated vulnerability assessment "
            f"conducted on <b>{target_url}</b>. The overall risk score is "
            f"<b>{scan.risk_score}/10</b> ({scan.overall_severity.upper()}). "
            f"A total of {len(vulns)} vulnerabilities were identified: "
            f"{critical} critical, {high} high severity."
        )
        elements.append(Paragraph(summary, body_style))
        elements.append(Spacer(1, 0.3 * inch))

        elements.append(Paragraph("Scan Information", heading_style))
        elements.append(Spacer(1, 0.1 * inch))
        scan_data = [
            ["Target URL", target_url],
            ["Scan Type", scan.scan_type],
            ["Status", scan.status],
            ["Risk Score", f"{scan.risk_score}/10"],
            ["Overall Severity", scan.overall_severity.upper()],
            ["Started", scan.started_at.strftime("%Y-%m-%d %H:%M") if scan.started_at else "N/A"],
            ["Completed", scan.completed_at.strftime("%Y-%m-%d %H:%M") if scan.completed_at else "N/A"],
        ]
        scan_table = Table(scan_data, colWidths=[2 * inch, 4 * inch])
        scan_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(scan_table)
        elements.append(Spacer(1, 0.3 * inch))

        elements.append(Paragraph("Detected Vulnerabilities", heading_style))
        elements.append(Spacer(1, 0.1 * inch))

        severity_colors = {
            "critical": colors.HexColor("#ff0040"),
            "high": colors.HexColor("#ff6600"),
            "medium": colors.HexColor("#ffcc00"),
            "low": colors.HexColor("#00ccff"),
            "info": colors.HexColor("#888888"),
        }

        for vuln in vulns:
            sev_color = severity_colors.get(vuln.severity, colors.grey)
            elements.append(Paragraph(
                f"<b>{vuln.name}</b> - <font color='{sev_color.hexval()}'>{vuln.severity.upper()}</font> "
                f"(CVSS: {vuln.cvss_score})",
                body_style,
            ))
            if vuln.description:
                elements.append(Paragraph(vuln.description[:500], body_style))
            if vuln.solution:
                elements.append(Paragraph(f"<b>Solution:</b> {vuln.solution[:300]}", body_style))
            elements.append(Spacer(1, 0.15 * inch))

        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph("Recommendations", heading_style))
        elements.append(Spacer(1, 0.1 * inch))

        for rec in scan.recommendations:
            elements.append(Paragraph(f"<b>{rec.title}</b>", body_style))
            if rec.fix_steps:
                elements.append(Paragraph(rec.fix_steps[:500], body_style))
            elements.append(Spacer(1, 0.1 * inch))

        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph("Conclusion", heading_style))
        elements.append(Spacer(1, 0.1 * inch))
        conclusion = (
            f"The security assessment of {target_url} identified {len(vulns)} vulnerabilities "
            f"with an overall risk score of {scan.risk_score}/10. "
            "Immediate action is recommended for all critical and high severity findings. "
            "Regular scanning and remediation should be incorporated into the security program."
        )
        elements.append(Paragraph(conclusion, body_style))

        doc.build(elements)
        return filepath, filename

    def generate_csv(self, scan):
        filename = f"report_scan_{scan.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(self.REPORTS_DIR, filename)

        vulns = Vulnerability.query.filter_by(scan_id=scan.id).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Name", "Severity", "CVSS Score", "Category", "Description",
            "Evidence", "Solution", "Reference", "Source", "CWE",
        ])
        for v in vulns:
            writer.writerow([
                v.name, v.severity, v.cvss_score, v.category,
                v.description, v.evidence, v.solution, v.reference, v.source, v.cwe_id,
            ])

        with open(filepath, "w", newline="", encoding="utf-8") as f:
            f.write(output.getvalue())

        return filepath, filename

    def generate_json(self, scan):
        filename = f"report_scan_{scan.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(self.REPORTS_DIR, filename)

        data = {
            "report_type": "VulnScan Security Assessment",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "scan": scan.to_dict(include_details=True),
        }

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

        return filepath, filename
