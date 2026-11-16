"""
NEXUS Authentication & Verification Service
PostgreSQL (Supabase) backed persistent user management with SQLite fallback.
"""

import os
import sqlite3
import hashlib
import secrets
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "nexus_users.db")
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

IS_POSTGRES = bool(DATABASE_URL and ("postgres://" in DATABASE_URL or "postgresql://" in DATABASE_URL))

if IS_POSTGRES:
    import psycopg2
    from psycopg2 import IntegrityError as DBIntegrityError
else:
    from sqlite3 import IntegrityError as DBIntegrityError

SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@nexus.ai")

class DBContext:
    def __init__(self):
        if IS_POSTGRES:
            self.conn = psycopg2.connect(DATABASE_URL)
        else:
            self.conn = sqlite3.connect(DB_PATH)
        self.cursor_obj = self.conn.cursor()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        self.cursor_obj.close()
        self.conn.close()

    def execute(self, sql: str, params: tuple = ()):
        if IS_POSTGRES:
            sql_pg = sql.replace("?", "%s")
            self.cursor_obj.execute(sql_pg, params)
        else:
            self.cursor_obj.execute(sql, params)
        return self.cursor_obj

    def fetchone(self):
        return self.cursor_obj.fetchone()

    def fetchall(self):
        return self.cursor_obj.fetchall()

    def commit(self):
        self.conn.commit()

def init_db():
    if IS_POSTGRES:
        with DBContext() as db:
            db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    salt VARCHAR(100) NOT NULL,
                    is_verified INTEGER DEFAULT 0,
                    verification_code VARCHAR(20),
                    code_expires_at DOUBLE PRECISION,
                    created_at DOUBLE PRECISION
                );
            """)
            db.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    token VARCHAR(255) PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    created_at DOUBLE PRECISION,
                    expires_at DOUBLE PRECISION
                );
            """)
            db.commit()
            print(" Connected to Supabase PostgreSQL: initialized users & sessions tables.")
    else:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    is_verified INTEGER DEFAULT 0,
                    verification_code TEXT,
                    code_expires_at REAL,
                    created_at REAL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER,
                    created_at REAL,
                    expires_at REAL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            conn.commit()
            print(" Initialized local SQLite users & sessions tables.")

init_db()

def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def _send_email_code(email: str, username: str, code: str) -> bool:
    greeting = f"Hello {username}," if username else "Hello,"
    body_text = f"""{greeting}

Welcome to NEXUS! To complete your registration and break language barriers, please verify your email.

Your 6-digit verification code is:

    {code}

This code expires in 15 minutes.

If you did not request this, please ignore this email.

— The NEXUS Team
"""

    print(f"\n=======================================================")
    print(f"📧 [NEXUS EMAIL VERIFICATION]")
    print(f"To: {email} ({username})")
    print(f"Verification Code: >>> {code} <<<")
    print(f"Expires in 15 minutes")
    print(f"Database: {'Supabase PostgreSQL' if IS_POSTGRES else 'SQLite'}")
    print(f"=======================================================\n")

    if not SMTP_SERVER or not SMTP_USER:
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_FROM
        msg["To"] = email
        msg["Subject"] = "NEXUS Transliteration — Email Verification Code"
        msg.attach(MIMEText(body_text, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"⚠️ SMTP Send Failed: {e}")
        return False

# ----------------- SIGN UP (ALL 4 FIELDS UPFRONT) -----------------

def register_user(username: str, email: str, password: str, confirm_password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Sign Up asking upfront:
    1. Username
    2. Enter your mail
    3. Password
    4. Confirm password
    """
    username = username.strip()
    email = email.strip().lower()

    if not username:
        return False, "Username is required.", None
    if len(username) < 3:
        return False, "Username must be at least 3 characters long.", None
    if not username.replace("_", "").isalnum():
        return False, "Username may only contain letters, numbers, and underscores.", None

    if not email or "@" not in email or "." not in email:
        return False, "Please enter a valid email address.", None

    if len(password) < 6:
        return False, "Password must be at least 6 characters long.", None
    if password != confirm_password:
        return False, "Passwords do not match. Please verify both entries.", None

    with DBContext() as db:
        # 1. Check if verified account exists with this email
        db.execute("SELECT id FROM users WHERE lower(email) = lower(?) AND is_verified = 1", (email,))
        if db.fetchone():
            return False, f"An account with email '{email}' is already registered. Please log in.", None

        # 2. Check if verified account exists with this username
        db.execute("SELECT id FROM users WHERE lower(username) = lower(?) AND is_verified = 1", (username,))
        if db.fetchone():
            return False, f"The username '{username}' is already taken. Please choose another.", None

        # 3. Clean up any stale unverified attempts matching either this email OR this username
        db.execute("DELETE FROM users WHERE (lower(email) = lower(?) OR lower(username) = lower(?)) AND is_verified = 0", (email, username))
        db.commit()

        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = time.time() + 900
        salt = secrets.token_hex(16)
        pwd_hash = _hash_password(password, salt)
        now = time.time()

        try:
            db.execute("""
                INSERT INTO users (username, email, password_hash, salt, is_verified, verification_code, code_expires_at, created_at)
                VALUES (?, ?, ?, ?, 0, ?, ?, ?)
            """, (username, email, pwd_hash, salt, code, expires_at, now))
            db.commit()
        except DBIntegrityError:
            return False, "This username or email is currently reserved. Please choose another.", None

    _send_email_code(email, username, code)
    return True, f"Verification code sent to {email}.", {
        "email": email,
        "username": username,
        "code_hint": code,
        "smtp_configured": bool(SMTP_SERVER and SMTP_USER),
        "database": "supabase_postgres" if IS_POSTGRES else "sqlite",
    }

def verify_code(email: str, code: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Verifies the 6-digit code received on the user's email.
    """
    email = email.strip().lower()
    code = code.strip()

    with DBContext() as db:
        db.execute("""
            SELECT id, username, verification_code, code_expires_at, is_verified 
            FROM users 
            WHERE lower(email) = lower(?)
        """, (email,))
        row = db.fetchone()

        if not row:
            return False, "No registration in progress found for this email.", None

        user_id, username, stored_code, expires_at, is_verified = row

        if is_verified:
            token = secrets.token_hex(32)
            db.execute("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
            db.commit()
            return True, "Email verified successfully!", {"token": token, "username": username, "email": email}

        if time.time() > expires_at:
            return False, "Verification code has expired. Please request a new code.", None

        if stored_code != code:
            return False, "Invalid verification code. Please check your email and try again.", None

        # Correct code: mark verified & create session
        db.execute("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", (user_id,))
        token = secrets.token_hex(32)
        db.execute("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        db.commit()

        return True, "Email verified successfully! You are now logged in.", {
            "token": token,
            "username": username,
            "email": email,
        }

def resend_code(email: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    email = email.strip().lower()
    with DBContext() as db:
        db.execute("SELECT id, username, is_verified FROM users WHERE lower(email) = lower(?)", (email,))
        row = db.fetchone()
        if not row:
            return False, "No registration found for this email.", None
        if row[2]:
            return False, "This email is already verified. Please log in directly.", None

        username = row[1]
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = time.time() + 900
        db.execute("UPDATE users SET verification_code = ?, code_expires_at = ? WHERE id = ?", (code, expires_at, row[0]))
        db.commit()

    _send_email_code(email, username, code)
    return True, f"New verification code sent to {email}.", {
        "email": email,
        "code_hint": code,
        "smtp_configured": bool(SMTP_SERVER and SMTP_USER),
    }

# ----------------- LOG IN (CREDENTIALS & STRICT GOOGLE) -----------------

def login_with_credentials(identifier: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Log In:
    Enter your mail / Username
    Enter your password
    """
    identifier = identifier.strip()
    if not identifier:
        return False, "Please enter your email or username.", None
    if not password:
        return False, "Please enter your password.", None

    with DBContext() as db:
        db.execute("""
            SELECT id, username, email, password_hash, salt, is_verified 
            FROM users 
            WHERE lower(email) = lower(?) OR lower(username) = lower(?)
        """, (identifier, identifier))
        row = db.fetchone()

        if not row:
            return False, "Invalid username/email or password.", None

        user_id, username, email, pwd_hash, salt, is_verified = row

        if _hash_password(password, salt) != pwd_hash:
            return False, "Invalid username/email or password.", None

        if not is_verified:
            return False, "Email has not been verified yet. Please complete verification.", {"needs_verification": True, "email": email, "username": username}

        token = secrets.token_hex(32)
        db.execute("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        db.commit()

        return True, f"Welcome back, {username}!", {"token": token, "username": username, "email": email}

def login_with_google_strict(email: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Sign in with Google: ONLY works if the mail has already been registered!
    """
    email = email.strip().lower()
    if not email:
        return False, "Google account email is required.", None

    with DBContext() as db:
        db.execute("""
            SELECT id, username, email, is_verified 
            FROM users 
            WHERE lower(email) = lower(?)
        """, (email,))
        row = db.fetchone()

        if not row:
            return False, f"No registered account found for '{email}'. Please sign up first.", None

        user_id, username, email_val, is_verified = row

        if not is_verified:
            return False, "Account registration is incomplete. Please verify your email first.", None

        token = secrets.token_hex(32)
        db.execute("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        db.commit()

        return True, f"Welcome back, {username}!", {"token": token, "username": username, "email": email_val}

def validate_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    with DBContext() as db:
        db.execute("""
            SELECT u.id, u.username, u.email 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ? AND s.expires_at > ?
        """, (token, time.time()))
        row = db.fetchone()
        if row:
            return {"id": row[0], "username": row[1], "email": row[2]}
    return None
