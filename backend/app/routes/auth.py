from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required

from app import limiter
from app.database import db
from app.models import User
from app.services.auth_service import (
    authenticate_user,
    create_and_send_otp,
    create_password_reset_token,
    register_user,
    reset_password,
    reset_password_with_session,
    send_password_reset_email,
    send_verification_email,
    verify_email_token,
    verify_otp_and_issue_session,
)
from app.utils.decorators import log_activity
from app.utils.security import hash_password
from app.utils.validators import validate_email, validate_password, validate_username

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    valid, msg = validate_username(username)
    if not valid:
        return jsonify({"error": msg}), 400
    valid, msg = validate_email(email)
    if not valid:
        return jsonify({"error": msg}), 400
    valid, msg = validate_password(password)
    if not valid:
        return jsonify({"error": msg}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    user, token = register_user(username, email, password)
    send_verification_email(user, token)
    log_activity(user.id, "register", f"User {username} registered")

    return jsonify({"message": "Registration successful. Please verify your email.", "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20 per hour")
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    remember = data.get("remember_me", False)

    user, error = authenticate_user(email, password)
    if error:
        return jsonify({"error": error}), 401

    expires = __import__("datetime").timedelta(days=30) if remember else None
    additional_claims = {"role": user.role, "username": user.username}

    access_token = create_access_token(
        identity=str(user.id), additional_claims=additional_claims, expires_delta=expires
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    log_activity(user.id, "login", f"User {user.username} logged in")

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    })


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    additional_claims = {"role": user.role, "username": user.username}
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
    return jsonify({"access_token": access_token})


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    log_activity(int(user_id), "logout", "User logged out")
    return jsonify({"message": "Logged out successfully"})


# ── Legacy link-based reset (kept for backwards compatibility) ────────────────

@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("5 per hour")
def forgot_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    user = User.query.filter_by(email=email).first()
    if user:
        token = create_password_reset_token(user.id)
        send_password_reset_email(user, token)
    return jsonify({"message": "If the email exists, a reset link has been sent."})


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("10 per hour")
def reset_password_route():
    data = request.get_json()
    password = data.get("password", "")

    valid, msg = validate_password(password)
    if not valid:
        return jsonify({"error": msg}), 400

    # Support both legacy URL-token and new OTP session-token
    session_token = data.get("session_token", "")
    legacy_token = data.get("token", "")

    if session_token:
        success, error = reset_password_with_session(session_token, password)
    elif legacy_token:
        success, error = reset_password(legacy_token, password)
    else:
        return jsonify({"error": "No reset token provided"}), 400

    if not success:
        return jsonify({"error": error}), 400
    return jsonify({"message": "Password reset successful"})


# ── OTP-based password reset ──────────────────────────────────────────────────

@auth_bp.route("/send-otp", methods=["POST"])
@limiter.limit("5 per hour")
def send_otp():
    """
    Step 1: User enters their email.
    Generates a 6-digit OTP and emails it to the registered address.
    Always returns a generic success message to prevent email enumeration.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    valid, msg = validate_email(email)
    if not valid:
        return jsonify({"error": msg}), 400

    ok, error = create_and_send_otp(email)
    if not ok:
        return jsonify({"error": error}), 500

    return jsonify({"message": "If the email is registered, a 6-digit OTP has been sent."})


@auth_bp.route("/verify-otp", methods=["POST"])
@limiter.limit("10 per hour")
def verify_otp():
    """
    Step 2: User submits the 6-digit OTP received in email.
    On success, returns a short-lived session_token to be used in Step 3.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    session_token, error = verify_otp_and_issue_session(email, otp)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "OTP verified successfully",
        "session_token": session_token,
    })


# ── Email Verification ────────────────────────────────────────────────────────

@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json()
    token = data.get("token", "")
    success, result = verify_email_token(token)
    if not success:
        return jsonify({"error": result}), 400
    return jsonify({"message": "Email verified successfully", "user": result.to_dict()})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()})


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    data = request.get_json()
    current = data.get("current_password", "")
    new_pass = data.get("new_password", "")

    from app.utils.security import check_password

    if not check_password(current, user.password_hash):
        return jsonify({"error": "Current password is incorrect"}), 401

    valid, msg = validate_password(new_pass)
    if not valid:
        return jsonify({"error": msg}), 400

    user.password_hash = hash_password(new_pass)
    db.session.commit()
    log_activity(user.id, "change_password", "Password changed")
    return jsonify({"message": "Password updated successfully"})
