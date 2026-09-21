from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.database import db
from app.models import Notification, User
from app.services.activity_service import get_user_activity, log_user_activity
from app.utils.decorators import active_user_required

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/", methods=["GET"])
@jwt_required()
@active_user_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return jsonify({"user": user.to_dict()})


@profile_bp.route("/", methods=["PUT"])
@jwt_required()
@active_user_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    if "username" in data:
        new_username = data["username"].strip()
        existing = User.query.filter_by(username=new_username).first()
        if existing and existing.id != user.id:
            return jsonify({"error": "Username already taken"}), 409
        user.username = new_username

    if "email" in data:
        new_email = data["email"].strip().lower()
        existing = User.query.filter_by(email=new_email).first()
        if existing and existing.id != user.id:
            return jsonify({"error": "Email already in use"}), 409
        user.email = new_email

    db.session.commit()
    log_user_activity(
        user_id=user_id,
        activity="Updated Profile",
        module="Profile",
        description="User updated their profile information",
    )
    return jsonify({"message": "Profile updated", "user": user.to_dict()})


# ── Activity History ──────────────────────────────────────────────────────────

@profile_bp.route("/activity", methods=["GET"])
@jwt_required()
@active_user_required()
def get_activity():
    """
    Return the latest 15 activity log entries for the authenticated user.

    Response shape:
    {
        "activity": [
            {
                "id": 1,
                "activity": "Login",
                "module": "Auth",
                "description": "User johndoe logged in",
                "created_at": "2026-09-21T09:00:00"
            },
            ...
        ],
        "total": 15
    }
    """
    user_id = int(get_jwt_identity())
    logs = get_user_activity(user_id, limit=15)
    return jsonify({
        "activity": [log.to_dict() for log in logs],
        "total": len(logs),
    })


# ── Notifications ─────────────────────────────────────────────────────────────

@profile_bp.route("/notifications", methods=["GET"])
@jwt_required()
@active_user_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread,
    })


@profile_bp.route("/notifications/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
@active_user_required()
def mark_notification_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"})


@profile_bp.route("/notifications/read-all", methods=["PUT"])
@jwt_required()
@active_user_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"})
