import os

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.database import db
from app.models import Report, Scan
from app.reports.generator import ReportGenerator
from app.utils.decorators import active_user_required, log_activity

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/generate/<int:scan_id>", methods=["POST"])
@jwt_required()
@active_user_required()
def generate_report(scan_id):
    user_id = int(get_jwt_identity())
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    if scan.user_id != user_id:
        return jsonify({"error": "Access denied"}), 403
    if scan.status != "completed":
        return jsonify({"error": "Scan not completed yet"}), 400

    data = request.get_json() or {}
    fmt = data.get("format", "pdf").lower()

    generator = ReportGenerator()
    if fmt == "pdf":
        filepath, filename = generator.generate_pdf(scan)
    elif fmt == "csv":
        filepath, filename = generator.generate_csv(scan)
    elif fmt == "json":
        filepath, filename = generator.generate_json(scan)
    else:
        return jsonify({"error": "Invalid format. Use pdf, csv, or json."}), 400

    report = Report(scan_id=scan.id, user_id=user_id, format=fmt, file_path=filepath)
    db.session.add(report)
    db.session.commit()

    log_activity(user_id, "report_generated", f"{fmt.upper()} report for scan {scan_id}")

    return jsonify({"message": "Report generated", "report": report.to_dict()}), 201


@reports_bp.route("/download/<int:report_id>", methods=["GET"])
@jwt_required()
@active_user_required()
def download_report(report_id):
    user_id = int(get_jwt_identity())
    report = Report.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404
    if report.user_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    if not report.file_path or not os.path.exists(report.file_path):
        return jsonify({"error": "Report file not found"}), 404

    mimetype = {
        "pdf": "application/pdf",
        "csv": "text/csv",
        "json": "application/json",
    }.get(report.format, "application/octet-stream")

    return send_file(report.file_path, mimetype=mimetype, as_attachment=True)


@reports_bp.route("/scan/<int:scan_id>", methods=["GET"])
@jwt_required()
@active_user_required()
def list_scan_reports(scan_id):
    user_id = int(get_jwt_identity())
    scan = Scan.query.get(scan_id)
    if not scan or scan.user_id != user_id:
        return jsonify({"error": "Scan not found"}), 404

    reports = Report.query.filter_by(scan_id=scan_id).order_by(Report.created_at.desc()).all()
    return jsonify({"reports": [r.to_dict() for r in reports]})
