from datetime import datetime, timezone
from app.database import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    is_suspended = db.Column(db.Boolean, default=False)
    remember_token = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    scans = db.relationship("Scan", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    notifications = db.relationship("Notification", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    activity_logs = db.relationship("ActivityLog", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_email=True):
        data = {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "is_suspended": self.is_suspended,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_email:
            data["email"] = self.email
        return data


class Target(db.Model):
    __tablename__ = "targets"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(512), nullable=False)
    domain = db.Column(db.String(256), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    scans = db.relationship("Scan", backref="target", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "domain": self.domain,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Scan(db.Model):
    __tablename__ = "scans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    target_id = db.Column(db.Integer, db.ForeignKey("targets.id"), nullable=False)
    status = db.Column(db.String(30), default="pending")
    progress = db.Column(db.Integer, default=0)
    risk_score = db.Column(db.Float, default=0.0)
    overall_severity = db.Column(db.String(20), default="info")
    scan_type = db.Column(db.String(50), default="full")
    logs = db.Column(db.Text, default="")
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    vulnerabilities = db.relationship("Vulnerability", backref="scan", lazy="dynamic", cascade="all, delete-orphan")
    recommendations = db.relationship("Recommendation", backref="scan", lazy="dynamic", cascade="all, delete-orphan")
    reports = db.relationship("Report", backref="scan", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_details=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "target_id": self.target_id,
            "status": self.status,
            "progress": self.progress,
            "risk_score": self.risk_score,
            "overall_severity": self.overall_severity,
            "scan_type": self.scan_type,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if self.target:
            data["target"] = self.target.to_dict()
        if include_details:
            data["vulnerabilities"] = [v.to_dict() for v in self.vulnerabilities]
            data["recommendations"] = [r.to_dict() for r in self.recommendations]
            data["logs"] = self.logs
        return data


class Vulnerability(db.Model):
    __tablename__ = "vulnerabilities"

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey("scans.id"), nullable=False)
    name = db.Column(db.String(256), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    severity = db.Column(db.String(20), nullable=False)
    cvss_score = db.Column(db.Float, default=0.0)
    cvss_vector = db.Column(db.String(128), nullable=True)
    description = db.Column(db.Text, nullable=True)
    evidence = db.Column(db.Text, nullable=True)
    solution = db.Column(db.Text, nullable=True)
    reference = db.Column(db.Text, nullable=True)
    source = db.Column(db.String(50), default="zap")
    cwe_id = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "name": self.name,
            "category": self.category,
            "severity": self.severity,
            "cvss_score": self.cvss_score,
            "cvss_vector": self.cvss_vector,
            "description": self.description,
            "evidence": self.evidence,
            "solution": self.solution,
            "reference": self.reference,
            "source": self.source,
            "cwe_id": self.cwe_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Recommendation(db.Model):
    __tablename__ = "recommendations"

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey("scans.id"), nullable=False)
    vulnerability_id = db.Column(db.Integer, db.ForeignKey("vulnerabilities.id"), nullable=True)
    title = db.Column(db.String(256), nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    impact = db.Column(db.Text, nullable=True)
    fix_steps = db.Column(db.Text, nullable=True)
    best_practices = db.Column(db.Text, nullable=True)
    preventive_measures = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), default="medium")
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "vulnerability_id": self.vulnerability_id,
            "title": self.title,
            "explanation": self.explanation,
            "impact": self.impact,
            "fix_steps": self.fix_steps,
            "best_practices": self.best_practices,
            "preventive_measures": self.preventive_measures,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey("scans.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    format = db.Column(db.String(10), nullable=False)
    file_path = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "user_id": self.user_id,
            "format": self.format,
            "file_path": self.file_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(256), nullable=False)
    message = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(50), default="info")
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(256), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class EmailVerificationToken(db.Model):
    __tablename__ = "email_verification_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(256), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class OTPToken(db.Model):
    """6-digit OTP for password-reset verification sent to registered email."""
    __tablename__ = "otp_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    # Short-lived reset session token issued after OTP is verified
    session_token = db.Column(db.String(256), nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)
