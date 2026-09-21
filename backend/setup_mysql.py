"""
VulnScan MySQL Setup Script
============================
Run this script ONCE to:
  1. Create the vulscan_db database
  2. Run all Flask-Migrate migrations (create all tables)
  3. Create the default admin user

Usage:
    python setup_mysql.py

Requirements:
  - XAMPP MySQL (or any MySQL 8.x) must be running on localhost:3306
  - .env must have correct DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
"""

import os
import sys

# ── Ensure we can import the backend package ─────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

import pymysql

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", "3306"))
DB_NAME = os.environ.get("DB_NAME", "vulscan_db")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")


def step(msg):
    print(f"\n{'='*60}\n  {msg}\n{'='*60}")


def create_database():
    step("Step 1 – Create MySQL database")
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
        )
        with conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        conn.commit()
        conn.close()
        print(f"  ✓  Database '{DB_NAME}' ready on {DB_HOST}:{DB_PORT}")
    except Exception as e:
        print(f"  ✗  Cannot connect to MySQL: {e}")
        print(
            "\n  Make sure XAMPP MySQL is running (green in XAMPP Control Panel)\n"
            "  and that your .env DB_* variables are correct.\n"
        )
        sys.exit(1)


def run_migrations():
    step("Step 2 – Run Flask-Migrate (create / upgrade all tables)")
    # Flask-Migrate works through the CLI, so we invoke it via subprocess
    import subprocess

    flask_exe = os.path.join(BACKEND_DIR, ".venv", "Scripts", "flask.exe")
    if not os.path.exists(flask_exe):
        flask_exe = os.path.join(BACKEND_DIR, "venv", "Scripts", "flask.exe")
    if not os.path.exists(flask_exe):
        flask_exe = "flask"  # fall back to PATH

    env = os.environ.copy()
    env["FLASK_APP"] = "run.py"
    env["FLASK_ENV"] = "development"

    migrations_dir = os.path.join(BACKEND_DIR, "migrations")

    # Only run `flask db init` if the migrations folder doesn't exist yet
    if not os.path.exists(migrations_dir):
        print("  Running: flask db init")
        result = subprocess.run([flask_exe, "db", "init"], env=env, cwd=BACKEND_DIR)
        if result.returncode != 0:
            print("  ✗  flask db init failed")
            sys.exit(1)
        print("  ✓  migrations/ folder initialised")
    else:
        print("  ↳  migrations/ folder already exists – skipping flask db init")

    print("  Running: flask db migrate")
    result = subprocess.run(
        [flask_exe, "db", "migrate", "-m", "MySQL migration with enhanced ActivityLog"],
        env=env,
        cwd=BACKEND_DIR,
    )
    if result.returncode != 0:
        print("  ✗  flask db migrate failed (check output above)")
        sys.exit(1)

    print("  Running: flask db upgrade")
    result = subprocess.run([flask_exe, "db", "upgrade"], env=env, cwd=BACKEND_DIR)
    if result.returncode != 0:
        print("  ✗  flask db upgrade failed (check output above)")
        sys.exit(1)

    print("  ✓  All tables created / upgraded successfully")


def verify_tables():
    step("Step 3 – Verify tables exist in MySQL")
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = [row[0] for row in cursor.fetchall()]
    conn.close()

    expected = [
        "users", "targets", "scans", "vulnerabilities",
        "recommendations", "reports", "notifications",
        "activity_logs", "password_reset_tokens",
        "email_verification_tokens", "otp_tokens",
    ]
    for t in expected:
        if t in tables:
            print(f"  ✓  {t}")
        else:
            print(f"  ✗  MISSING: {t}")

    print(f"\n  Tables found: {len(tables)}")


if __name__ == "__main__":
    print("\nVulnScan – MySQL Setup")
    create_database()
    run_migrations()
    verify_tables()
    print("\n  ✅  Setup complete! You can now run: python run.py\n")

