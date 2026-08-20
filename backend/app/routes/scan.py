from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import limiter
from app.models import Scan, User
from app.utils.decorators import active_user_required

scan_bp = Blueprint("scan", __name__)


@scan_bp.route("/start", methods=["POST"])
@jwt_required()
@active_user_required()
@limiter.limit("10 per hour")
def start_scan():
    from app.database import db
    from app.models import Target
    from app.services.scan_service import resolve_ip, start_scan_async
    from app.utils.decorators import log_activity
    from app.utils.validators import extract_domain_from_url, validate_domain, validate_ip, validate_url
    from flask import current_app

    data = request.get_json()
    url = data.get("url", "").strip()
    domain = data.get("domain", "").strip()
    ip_address = data.get("ip_address", "").strip()

    valid, result = validate_url(url)
    if not valid:
        return jsonify({"error": result}), 400

    if domain:
        valid, result = validate_domain(domain)
        if not valid:
            return jsonify({"error": result}), 400
    else:
        domain = extract_domain_from_url(url)

    if ip_address:
        valid, result = validate_ip(ip_address)
        if not valid:
            return jsonify({"error": result}), 400
    else:
        ip_address = resolve_ip(domain)

    user_id = int(get_jwt_identity())

    target = Target(url=url, domain=domain, ip_address=ip_address)
    db.session.add(target)
    db.session.flush()

    scan = Scan(user_id=user_id, target_id=target.id, status="pending", scan_type="full")
    db.session.add(scan)
    db.session.commit()

    log_activity(user_id, "scan_started", f"Scan started for {url}")
    start_scan_async(scan.id, current_app._get_current_object())

    return jsonify({"message": "Scan started", "scan": scan.to_dict()}), 201


@scan_bp.route("/<int:scan_id>/status", methods=["GET"])
@jwt_required()
@active_user_required()
def scan_status(scan_id):
    user_id = int(get_jwt_identity())
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    if scan.user_id != user_id:
        user = User.query.get(user_id)
        if user.role != "admin":
            return jsonify({"error": "Access denied"}), 403

    return jsonify({"scan": scan.to_dict(include_details=True)})


@scan_bp.route("/<int:scan_id>/logs", methods=["GET"])
@jwt_required()
@active_user_required()
def scan_logs(scan_id):
    user_id = int(get_jwt_identity())
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    if scan.user_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"logs": scan.logs or "", "progress": scan.progress, "status": scan.status})


@scan_bp.route("/active", methods=["GET"])
@jwt_required()
@active_user_required()
def active_scans():
    user_id = int(get_jwt_identity())
    scans = Scan.query.filter(
        Scan.user_id == user_id,
        Scan.status.in_(["pending", "running"]),
    ).all()
    return jsonify({"scans": [s.to_dict() for s in scans]})
