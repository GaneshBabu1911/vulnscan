import secrets
from datetime import datetime, timezone
from functools import wraps

from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.database import db
from app.models import ActivityLog, User


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "admin":
                return {"error": "Admin access required"}, 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


def active_user_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active or user.is_suspended:
                return {"error": "Account is inactive or suspended"}, 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


def generate_token(length=32):
    return secrets.token_urlsafe(length)


def log_activity(user_id, action, details=None):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=request.remote_addr if request else None,
    )
    db.session.add(log)
    db.session.commit()


def utcnow():
    return datetime.now(timezone.utc)
