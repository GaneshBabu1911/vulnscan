import os
import random
import string
from datetime import datetime, timedelta, timezone
from flask import current_app
from flask_mail import Message

from app.database import db
from app.models import EmailVerificationToken, OTPToken, PasswordResetToken, User
from app.utils.decorators import generate_token
from app.utils.security import check_password_hash, generate_password_hash, hash_password, check_password


def _now_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def ensure_admin_user():
    try:
        admin = User.query.filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@vulnscan.io",
                password_hash=generate_password_hash(os.environ.get("ADMIN_PASSWORD", "Admin@123456")),
                role="admin",
                is_verified=True,
                is_active=True,
                is_suspended=False,
            )
            db.session.add(admin)
            db.session.commit()
    except Exception:
        db.session.rollback()


def register_user(username, email, password):
    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        role="user",
        is_active=True,
        is_verified=False,
        is_suspended=False,
    )
    db.session.add(user)
    db.session.commit()

    token = EmailVerificationToken(
        user_id=user.id,
        token=generate_token(48),
        expires_at=_now_naive() + timedelta(hours=24),
    )
    db.session.add(token)
    db.session.commit()
    return user, token.token


def authenticate_user(email, password):
    if not email or not password:
        return None, "Invalid Email or Password"
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return None, "Invalid Email or Password"
    if user.is_suspended:
        return None, "Account is suspended"
    if user.is_active is False:
        return None, "Account is deactivated"
    return user, None


def create_password_reset_token(user_id):
    token = PasswordResetToken(
        user_id=user_id,
        token=generate_token(48),
        expires_at=_now_naive() + timedelta(hours=1),
    )
    db.session.add(token)
    db.session.commit()
    return token.token


def reset_password(token_str, new_password):
    token = PasswordResetToken.query.filter_by(token=token_str, used=False).first()
    if not token or token.expires_at < _now_naive():
        return False, "Invalid or expired reset token"
    user = User.query.get(token.user_id)
    if not user:
        return False, "User not found"
    user.password_hash = generate_password_hash(new_password)
    token.used = True
    db.session.commit()
    return True, None


def verify_email_token(token_str):
    token = EmailVerificationToken.query.filter_by(token=token_str, used=False).first()
    if not token or token.expires_at < _now_naive():
        return False, "Invalid or expired verification token"
    user = User.query.get(token.user_id)
    if not user:
        return False, "User not found"
    user.is_verified = True
    token.used = True
    db.session.commit()
    return True, user


def _generate_otp(length=6):
    return "".join(random.choices(string.digits, k=length))


def create_and_send_otp(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return True, None

    OTPToken.query.filter_by(user_id=user.id, used=False).update({"used": True})
    db.session.flush()

    otp = _generate_otp()
    otp_record = OTPToken(
        user_id=user.id,
        otp=otp,
        expires_at=_now_naive() + timedelta(minutes=10),
    )
    db.session.add(otp_record)
    db.session.commit()

    sent = send_otp_email(user, otp)
    if not sent:
        return False, "Email delivery failed. Please try again."
    return True, None


def verify_otp_and_issue_session(email, otp_input):
    user = User.query.filter_by(email=email).first()
    if not user:
        return None, "Invalid OTP"

    otp_record = (
        OTPToken.query
        .filter_by(user_id=user.id, used=False, verified=False)
        .order_by(OTPToken.created_at.desc())
        .first()
    )

    if not otp_record or otp_record.expires_at < _now_naive():
        return None, "OTP has expired. Please request a new one."

    if otp_record.otp != otp_input.strip():
        return None, "Incorrect OTP. Please try again."

    session_token = generate_token(48)
    otp_record.verified = True
    otp_record.session_token = session_token
    otp_record.expires_at = _now_naive() + timedelta(minutes=15)
    db.session.commit()
    return session_token, None


def reset_password_with_session(session_token, new_password):
    otp_record = OTPToken.query.filter_by(
        session_token=session_token, verified=True, used=False
    ).first()

    if not otp_record or otp_record.expires_at < _now_naive():
        return False, "Session expired. Please restart the password reset flow."

    user = User.query.get(otp_record.user_id)
    if not user:
        return False, "User not found"

    user.password_hash = generate_password_hash(new_password)
    otp_record.used = True
    db.session.commit()
    return True, None


def send_email(subject, recipients, body, html=None):
    try:
        msg = Message(subject, recipients=recipients, body=body, html=html)
        from app import mail
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.warning(f"Email send failed: {e}")
        return False


def send_verification_email(user, token):
    url = f"{current_app.config['FRONTEND_URL']}/verify-email?token={token}"
    body = f"Verify your email: {url}"
    html = f"<p>Click <a href='{url}'>here</a> to verify your email.</p>"
    return send_email("Verify Your Email - VulnScan", [user.email], body, html)


def send_password_reset_email(user, token):
    url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}"
    body = f"Reset your password: {url}"
    html = f"<p>Click <a href='{url}'>here</a> to reset your password.</p>"
    return send_email("Password Reset - VulnScan", [user.email], body, html)


def send_otp_email(user, otp):
    subject = "Your VulnScan Password Reset OTP"
    body = (
        f"Hi {user.username},\n\n"
        f"Your one-time password (OTP) for resetting your VulnScan account password is:\n\n"
        f"  {otp}\n\n"
        f"This OTP is valid for 10 minutes. Do not share it with anyone.\n\n"
        f"— VulnScan Security Team"
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;
                background:#0a0a0f;color:#e0e0e0;padding:32px;border-radius:12px;
                border:1px solid #2a2a4a;">
      <h2 style="color:#00ff41;font-family:monospace;margin-bottom:8px;">VulnScan</h2>
      <p style="color:#888;font-size:13px;margin-bottom:24px;">Password Reset OTP</p>
      <p>Hi <strong>{user.username}</strong>,</p>
      <p>Use the following one-time password to reset your account:</p>
      <div style="background:#12121a;border:1px solid #00ff41;border-radius:8px;
                  padding:24px;text-align:center;margin:24px 0;">
        <span style="font-size:40px;font-family:monospace;letter-spacing:14px;
                     color:#00ff41;font-weight:bold;">{otp}</span>
      </div>
      <p style="color:#888;font-size:13px;">
        This OTP expires in <strong style="color:#e0e0e0;">10 minutes</strong>.<br>
        Do not share this code with anyone.
      </p>
    </div>
    """
    return send_email(subject, [user.email], body, html)


def send_scan_complete_email(user, scan):
    subject = f"Scan Complete - {scan.target.url if scan.target else 'Target'}"
    body = f"Your scan has completed with risk score: {scan.risk_score}"
    return send_email(subject, [user.email], body)


def send_critical_alert_email(user, scan, count):
    subject = f"CRITICAL: {count} vulnerabilities found"
    body = f"Scan on {scan.target.url} found {count} critical vulnerabilities."
    return send_email(subject, [user.email], body)
