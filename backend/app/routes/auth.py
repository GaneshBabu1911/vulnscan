from datetime import timedelta
from flask import Blueprint, current_app, jsonify, request
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
from app.services.activity_service import log_user_activity
from app.utils.security import check_password_hash, generate_password_hash
from app.utils.validators import validate_email, validate_password, validate_username

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("20 per minute")
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
    try:
        send_verification_email(user, token)
    except Exception:
        pass
    try:
        log_user_activity(
            user_id=user.id,
            activity="Registered",
            module="Auth",
            description=f"New account created for {username}",
        )
    except Exception:
        pass

    return jsonify({"message": "Registration successful. Please verify your email.", "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("60 per minute")
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        remember = data.get("remember_me", False)

        current_app.logger.info(f"[AUTH DEPLOYMENT] Login request received for email: {email}")

        if not email or not password:
            current_app.logger.warning("[AUTH DEPLOYMENT] Missing email or password in request")
            return jsonify({"error": "Invalid credentials"}), 401

        user = User.query.filter_by(email=email).first()
        if not user:
            current_app.logger.warning(f"[AUTH DEPLOYMENT] User not found: {email}")
            return jsonify({"error": "Invalid credentials"}), 401

        current_app.logger.info(f"[AUTH DEPLOYMENT] User found: id={user.id}, username={user.username}")

        is_pw_valid = check_password_hash(user.password_hash, password)
        current_app.logger.info(f"[AUTH DEPLOYMENT] Password verification result: {is_pw_valid}")

        if not is_pw_valid:
            return jsonify({"error": "Invalid credentials"}), 401

        if user.is_suspended:
            return jsonify({"error": "Account is suspended"}), 403

        if user.is_active is False:
            return jsonify({"error": "Account is deactivated"}), 403

        expires = timedelta(days=30) if remember else None
        additional_claims = {"role": user.role, "username": user.username}

        access_token = create_access_token(
            identity=str(user.id), additional_claims=additional_claims, expires_delta=expires
        )
        refresh_token = create_refresh_token(identity=str(user.id))

        current_app.logger.info(f"[AUTH DEPLOYMENT] JWT generated successfully for user_id={user.id}")

        try:
            log_user_activity(
                user_id=user.id,
                activity="Login",
                module="Auth",
                description=f"User {user.username} logged in",
            )
        except Exception:
            pass

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
        }), 200

    except Exception as e:
        current_app.logger.error(f"[AUTH DEPLOYMENT] Login server error: {e}")
        return jsonify({"error": "Server Error"}), 500


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
    log_user_activity(
        user_id=int(user_id),
        activity="Logout",
        module="Auth",
        description="User logged out",
    )
    return jsonify({"message": "Logged out successfully"})


@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("10 per hour")
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    user = User.query.filter_by(email=email).first()
    if user:
        token = create_password_reset_token(user.id)
        try:
            send_password_reset_email(user, token)
        except Exception:
            pass
    return jsonify({"message": "If the email exists, a reset link has been sent."})


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("10 per hour")
def reset_password_route():
    data = request.get_json() or {}
    password = data.get("password", "")

    valid, msg = validate_password(password)
    if not valid:
        return jsonify({"error": msg}), 400

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


@auth_bp.route("/send-otp", methods=["POST"])
@limiter.limit("10 per hour")
def send_otp():
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
@limiter.limit("20 per hour")
def verify_otp():
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


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json() or {}
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
    data = request.get_json() or {}
    current = data.get("current_password", "")
    new_pass = data.get("new_password", "")

    if not check_password_hash(user.password_hash, current):
        return jsonify({"error": "Current password is incorrect"}), 401

    valid, msg = validate_password(new_pass)
    if not valid:
        return jsonify({"error": msg}), 400

    user.password_hash = generate_password_hash(new_pass)
    db.session.commit()
    log_user_activity(
        user_id=user.id,
        activity="Changed Password",
        module="Auth",
        description="User changed their account password",
    )
    return jsonify({"message": "Password updated successfully"})
