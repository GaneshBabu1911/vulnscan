from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models import Scan, Vulnerability
from app.utils.decorators import active_user_required

history_bp = Blueprint("history", __name__)


@history_bp.route("/", methods=["GET"])
@jwt_required()
@active_user_required()
def scan_history():
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status")

    query = Scan.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(Scan.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "scans": [s.to_dict() for s in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
    })


@history_bp.route("/<int:scan_id>", methods=["GET"])
@jwt_required()
@active_user_required()
def scan_detail(scan_id):
    user_id = int(get_jwt_identity())
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    if scan.user_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    vulns = Vulnerability.query.filter_by(scan_id=scan_id).all()
    data = scan.to_dict(include_details=True)
    data["vulnerability_count"] = len(vulns)

    return jsonify({"scan": data})


@history_bp.route("/<int:scan_id>", methods=["DELETE"])
@jwt_required()
@active_user_required()
def delete_scan(scan_id):
    from app.database import db
    from app.utils.decorators import log_activity

    user_id = int(get_jwt_identity())
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    if scan.user_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    db.session.delete(scan)
    db.session.commit()
    log_activity(user_id, "scan_deleted", f"Deleted scan {scan_id}")
    return jsonify({"message": "Scan deleted"})
