import os
import urllib.parse
from datetime import timedelta

from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(_env_path)


def _build_database_uri():
    import socket

    host = os.environ.get("DB_HOST", "localhost")
    port = int(os.environ.get("DB_PORT", "3306"))
    name = os.environ.get("DB_NAME", "vulscan_db")
    user = os.environ.get("DB_USER", "root")
    password = os.environ.get("DB_PASSWORD", "")
    escaped_password = urllib.parse.quote_plus(password)
    mysql_uri = f"mysql+pymysql://{user}:{escaped_password}@{host}:{port}/{name}?charset=utf8mb4"

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            return mysql_uri
    except Exception:
        pass

    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(os.path.join(backend_dir, "instance"), exist_ok=True)
    db_path = os.path.join(backend_dir, "instance", "vulnscan.db")
    return f"sqlite:///{db_path}"


def _format_frontend_url():
    raw = os.environ.get("FRONTEND_URL", "http://localhost:5173").strip()
    if raw and not raw.startswith("http://") and not raw.startswith("https://"):
        if ".onrender.com" not in raw and "localhost" not in raw:
            return f"https://{raw}.onrender.com"
        return f"https://{raw}"
    return raw


def _get_database_uri():
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        if db_url.startswith("mysql://"):
            return db_url.replace("mysql://", "mysql+pymysql://", 1)
        if db_url.startswith("postgres://"):
            return db_url.replace("postgres://", "postgresql://", 1)
        return db_url
    return _build_database_uri()


def _get_engine_options(uri: str):
    if uri.startswith("sqlite"):
        return {
            "connect_args": {"timeout": 30, "check_same_thread": False},
        }
    return {
        "pool_recycle": 280,
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    }


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
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

    FRONTEND_URL = _format_frontend_url()
    ZAP_API_URL = os.environ.get("ZAP_API_URL", "http://localhost:8080")
    ZAP_API_KEY = os.environ.get("ZAP_API_KEY", "")

    AI_PROVIDER = os.environ.get("AI_PROVIDER", "local")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")

    RATELIMIT_DEFAULT = "200 per hour"
    RATELIMIT_STORAGE_URI = os.environ.get("REDIS_URL", "memory://")


_db_uri = _get_database_uri()


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _db_uri
    SQLALCHEMY_ENGINE_OPTIONS = _get_engine_options(_db_uri)


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _db_uri
    SQLALCHEMY_ENGINE_OPTIONS = _get_engine_options(_db_uri)
    JWT_COOKIE_SECURE = True


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    return config_map.get(env, DevelopmentConfig)
