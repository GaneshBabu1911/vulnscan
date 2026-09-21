import os
from datetime import timedelta

from dotenv import load_dotenv

# Load .env from the backend directory (two levels up from this file)
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(_env_path)


def _build_database_uri():
    """
    Assemble PyMySQL URI from env vars.
    In development mode, checks if MySQL is reachable on host:port.
    If MySQL is not reachable, falls back to SQLite with a clear notice
    so the backend can still start for local testing.
    """
    import socket
    import urllib.parse

    host = os.environ.get("DB_HOST", "localhost")
    port = int(os.environ.get("DB_PORT", "3306"))
    name = os.environ.get("DB_NAME", "vulscan_db")
    user = os.environ.get("DB_USER", "root")
    password = os.environ.get("DB_PASSWORD", "")
    escaped_password = urllib.parse.quote_plus(password)
    mysql_uri = f"mysql+pymysql://{user}:{escaped_password}@{host}:{port}/{name}?charset=utf8mb4"

    # Quick socket check (1 second timeout)
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            print(f"[DB] MySQL detected on {host}:{port} -> using MySQL ({name})")
            return mysql_uri
    except Exception:
        pass

    # If MySQL not reachable and running in dev, fall back to SQLite
    if os.environ.get("FLASK_ENV", "development") != "production":
        print(f"[DB] MySQL not reachable on {host}:{port} -> using SQLite fallback for local dev")
        print("[DB] Start XAMPP MySQL and run 'python setup_mysql.py' to use MySQL")
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(backend_dir, "instance", "vulnscan.db")
        return f"sqlite:///{db_path}"

    return mysql_uri



class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,      # recycle connections before MySQL wait_timeout (default 8h)
        "pool_pre_ping": True,    # check connection liveness before use
        "pool_size": 10,
        "max_overflow": 20,
    }

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_COOKIE_SECURE = os.environ.get("FLASK_ENV") == "production"
    JWT_COOKIE_CSRF_PROTECT = False

    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@vulnscan.io")

    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    ZAP_API_URL = os.environ.get("ZAP_API_URL", "http://localhost:8080")
    ZAP_API_KEY = os.environ.get("ZAP_API_KEY", "")

    AI_PROVIDER = os.environ.get("AI_PROVIDER", "local")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")

    RATELIMIT_DEFAULT = "200 per hour"
    RATELIMIT_STORAGE_URI = os.environ.get("REDIS_URL", "memory://")


def _get_database_uri():
    """
    Get and normalize database URI for production and development.
    Handles cloud provider URLs (e.g. Render / Railway / Aiven) by ensuring
    the correct driver prefix (e.g., mysql:// -> mysql+pymysql://).
    """
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        if db_url.startswith("mysql://"):
            return db_url.replace("mysql://", "mysql+pymysql://", 1)
        if db_url.startswith("postgres://"):
            return db_url.replace("postgres://", "postgresql://", 1)
        return db_url
    return _build_database_uri()


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _get_database_uri()


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _get_database_uri()
    JWT_COOKIE_SECURE = True


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    return config_map.get(env, DevelopmentConfig)
