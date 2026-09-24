import bcrypt
from werkzeug.security import check_password_hash as _w_check_password_hash
from werkzeug.security import generate_password_hash as _w_generate_password_hash


def generate_password_hash(password: str) -> str:
    if not password:
        return ""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password_hash(password_hash: str, entered_password: str) -> bool:
    if not password_hash or not entered_password:
        return False

    h = str(password_hash).strip()
    p = str(entered_password)

    if not (h.startswith("$2") or h.startswith("scrypt:") or h.startswith("pbkdf2:")) and (
        p.startswith("$2") or p.startswith("scrypt:") or p.startswith("pbkdf2:")
    ):
        h, p = p, h

    if h.startswith("$2a$") or h.startswith("$2b$") or h.startswith("$2y$"):
        try:
            return bcrypt.checkpw(p.encode("utf-8"), h.encode("utf-8"))
        except Exception:
            return False

    try:
        return _w_check_password_hash(h, p)
    except Exception:
        return False


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def check_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)
