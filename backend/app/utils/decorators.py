import secrets
from datetime import datetime, timezone
from functools import wraps

from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.models import User


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
    """
    Backward-compatible wrapper around log_user_activity().

    Existing callers that pass (user_id, action, details) continue to work.
    The action string is used as both the activity label and mapped to a module.
    """
    from app.services.activity_service import log_user_activity

    # Derive a friendly module name from the action string
    module_map = {
        "login": "Auth",
        "logout": "Auth",
        "register": "Auth",
        "change_password": "Auth",
        "scan_started": "Scanner",
        "scan_completed": "Scanner",
        "scan_deleted": "History",
        "report_generated": "Reports",
        "profile_updated": "Profile",
        "admin_delete_user": "Admin",
        "admin_suspended_user": "Admin",
        "admin_unsuspended_user": "Admin",
        "viewed_analytics": "Dashboard",
    }
    module = module_map.get(action, "System")

    # Convert snake_case action to Title Case for display
    activity_label = action.replace("_", " ").title()

    log_user_activity(
        user_id=user_id,
        activity=activity_label,
        module=module,
        description=details or "",
    )


def utcnow():
    return datetime.now(timezone.utc)
