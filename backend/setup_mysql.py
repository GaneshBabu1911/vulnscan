"""
VulnScan MySQL Setup Script
============================
Run this script ONCE to:
  1. Create the vulscan_db database on MySQL
  2. Create all tables via SQLAlchemy ORM
  3. Ensure the default admin user exists
  4. Verify all tables in MySQL

Usage:
    python setup_mysql.py
"""

import os
import sys

# Ensure backend package can be imported
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
    step("Step 1: Create MySQL database")
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
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        conn.commit()
        conn.close()
        print(f"  [OK] Database '{DB_NAME}' created/verified on {DB_HOST}:{DB_PORT}")
    except Exception as e:
        print(f"  [ERROR] Cannot connect to MySQL: {e}")
        print("\nPlease check your DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in backend/.env")
        sys.exit(1)


def create_tables_and_admin():
    step("Step 2: Create all database tables & initial admin account")
    from app import create_app
    from app.database import db
    from app.services.auth_service import ensure_admin_user

    app = create_app()
    with app.app_context():
        db.create_all()
        ensure_admin_user()
        print("  [OK] All tables created and admin user initialized.")


def verify_tables():
    step("Step 3: Verify tables in MySQL database")
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES;")
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
            print(f"  [OK] Table '{t}' exists")
        else:
            print(f"  [MISSING] Table '{t}'")

    print(f"\nTotal tables in `{DB_NAME}`: {len(tables)}")


if __name__ == "__main__":
    print("\nVulnScan - MySQL Setup")
    create_database()
    create_tables_and_admin()
    verify_tables()
    print("\n[SUCCESS] MySQL setup completed! Start the app with: python run.py\n")
