import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix

from config import get_config
from app.database import db

mail = Mail()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_class=None):
    app = Flask(__name__)
    app.config.from_object(config_class or get_config())
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)

    is_prod = os.environ.get("FLASK_ENV") == "production"

    if is_prod:
        origins = []
        cors_env = app.config.get("CORS_ORIGINS") or os.environ.get("CORS_ORIGINS", "")
        if cors_env:
            origins.extend([o.strip() for o in cors_env.split(",") if o.strip()])
        frontend_url = app.config.get("FRONTEND_URL")
        if frontend_url:
            origins.append(frontend_url)
        origins.extend([
            r"https://.*\.onrender\.com",
            r"https://.*\.vercel\.app",
        ])
        allowed_origins = list(dict.fromkeys(origins))
    else:
        allowed_origins = [
            app.config.get("FRONTEND_URL", "http://localhost:5173"),
            "http://localhost:5173",
            "http://localhost:3000",
            r"https://.*\.onrender\.com",
            r"https://.*\.vercel\.app",
        ]

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.scan import scan_bp
    from app.routes.reports import reports_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.profile import profile_bp
    from app.routes.history import history_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(scan_bp, url_prefix="/api/scan")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/")
    def index():
        return jsonify({
            "service": "VulnScan API",
            "status": "online",
            "version": "1.0.0",
            "health": "/api/health",
        })

    @app.route("/api/health")
    def health():
        return jsonify({"status": "healthy", "service": "VulnScan API"})

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization required"}), 401

    with app.app_context():
        try:
            db.create_all()
            from app.services.auth_service import ensure_admin_user
            ensure_admin_user()
        except Exception as e:
            app.logger.warning(f"Database initialization note: {e}")

    return app
