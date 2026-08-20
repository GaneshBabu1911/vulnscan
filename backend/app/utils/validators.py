import re
from urllib.parse import urlparse


URL_PATTERN = re.compile(
    r"^https?://"
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"
    r"localhost|"
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
    r"(?::\d+)?"
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)

DOMAIN_PATTERN = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)

IP_PATTERN = re.compile(
    r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}"
    r"(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
)


def validate_url(url):
    if not url:
        return False, "URL is required"
    if not URL_PATTERN.match(url):
        return False, "Invalid URL format. Must start with http:// or https://"
    parsed = urlparse(url)
    if not parsed.netloc:
        return False, "Invalid URL: missing domain"
    return True, url


def validate_domain(domain):
    if not domain:
        return False, "Domain is required"
    if not DOMAIN_PATTERN.match(domain):
        return False, "Invalid domain format"
    return True, domain


def validate_ip(ip):
    if not ip:
        return True, None
    if not IP_PATTERN.match(ip):
        return False, "Invalid IP address format"
    return True, ip


def validate_email(email):
    pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    if not pattern.match(email):
        return False, "Invalid email format"
    return True, email


def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, password


def validate_username(username):
    if len(username) < 3 or len(username) > 30:
        return False, "Username must be between 3 and 30 characters"
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, username


def extract_domain_from_url(url):
    parsed = urlparse(url)
    return parsed.netloc.split(":")[0] if parsed.netloc else None
