import secrets
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
            raw_id = get_jwt_identity()
            try:
                user_id = int(raw_id)
            except (TypeError, ValueError):
                return {"error": "Invalid user token"}, 401
            user = User.query.get(user_id)
            if not user or user.is_active is False or user.is_suspended:
                return {"error": "Account is inactive or suspended"}, 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


def generate_token(length=32):
    return secrets.token_urlsafe(length)
