from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from app.database import db
from app.models import ActivityLog, Scan, User, Vulnerability
from app.utils.decorators import active_user_required, admin_required, log_activity

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required()
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = User.query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    users = []
    for u in pagination.items:
        user_data = u.to_dict()
        user_data["scan_count"] = Scan.query.filter_by(user_id=u.id).count()
        users.append(user_data)

    return jsonify({
        "users": users,
        "total": pagination.total,
        "pages": pagination.pages,
    })


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required()
def delete_user(user_id):
    admin_id = int(get_jwt_identity())
    if user_id == admin_id:
        return jsonify({"error": "Cannot delete your own account"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    log_activity(admin_id, "admin_delete_user", f"Deleted user {user.username}")
    return jsonify({"message": "User deleted"})


@admin_bp.route("/users/<int:user_id>/suspend", methods=["PUT"])
@jwt_required()
@admin_required()
def suspend_user(user_id):
    admin_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.is_suspended = not user.is_suspended
    db.session.commit()
    action = "suspended" if user.is_suspended else "unsuspended"
    log_activity(admin_id, f"admin_{action}_user", f"User {user.username} {action}")
    return jsonify({"message": f"User {action}", "user": user.to_dict()})


@admin_bp.route("/scans", methods=["GET"])
@jwt_required()
@admin_required()
def all_scans():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = Scan.query.order_by(Scan.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    scans = []
    for s in pagination.items:
        scan_data = s.to_dict()
        scan_data["username"] = s.user.username if s.user else "Unknown"
        scans.append(scan_data)

    return jsonify({"scans": scans, "total": pagination.total, "pages": pagination.pages})


@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
@admin_required()
def admin_analytics():
    total_users = User.query.count()
    total_scans = Scan.query.count()
    total_vulns = Vulnerability.query.count()

    severity_counts = {}
    for sev in ["critical", "high", "medium", "low", "info"]:
        severity_counts[sev] = Vulnerability.query.filter_by(severity=sev).count()

    avg_risk = Scan.query.filter_by(status="completed").with_entities(func.avg(Scan.risk_score)).scalar() or 0

    return jsonify({
        "total_users": total_users,
        "total_scans": total_scans,
        "total_vulnerabilities": total_vulns,
        "severity_counts": severity_counts,
        "avg_risk_score": round(float(avg_risk), 1),
    })


@admin_bp.route("/logs", methods=["GET"])
@jwt_required()
@admin_required()
def system_logs():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    pagination = ActivityLog.query.order_by(ActivityLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    logs = []
    for log in pagination.items:
        log_data = log.to_dict()
        if log.user:
            log_data["username"] = log.user.username
        logs.append(log_data)

    return jsonify({"logs": logs, "total": pagination.total, "pages": pagination.pages})
