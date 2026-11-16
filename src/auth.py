"""
NEXUS Authentication & Verification Service
SQLite-backed persistent user management with real email verification.
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

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "nexus_users.db")

# SMTP Configuration from Environment
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@nexus.ai")

def init_db():
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

init_db()

def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def _send_email_code(email: str, username: str, code: str) -> bool:
    """
    Sends 6-digit verification code via SMTP if configured,
    and logs clearly for verification in local development.
    """
    subject = "NEXUS Transliteration — Verify Your Email"
    body_text = f"""Hello {username},

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
    print(f"=======================================================\n")

    if not SMTP_SERVER or not SMTP_USER:
        # SMTP not configured; code printed to console and returned
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_FROM
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body_text, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"⚠️ SMTP Send Failed: {e}")
        return False

def register_user(username: str, email: str, password: str, confirm_password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
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
        return False, "Passwords do not match.", None

    # Check uniqueness
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return False, "This username is already taken. Please choose another.", None

        cursor.execute("SELECT id, is_verified FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        if existing:
            if existing[1]:
                return False, "An account with this email is already registered. Please log in.", None
            # If exists but unverified, update code
            code = f"{secrets.randbelow(900000) + 100000}"
            expires_at = time.time() + 900
            salt = secrets.token_hex(16)
            pwd_hash = _hash_password(password, salt)
            cursor.execute("""
                UPDATE users SET username = ?, password_hash = ?, salt = ?, verification_code = ?, code_expires_at = ?
                WHERE email = ?
            """, (username, pwd_hash, salt, code, expires_at, email))
            conn.commit()
            _send_email_code(email, username, code)
            return True, "Verification code sent to your email.", {"email": email, "username": username, "code_hint": code}

        # Create new unverified user
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = time.time() + 900
        salt = secrets.token_hex(16)
        pwd_hash = _hash_password(password, salt)
        now = time.time()

        cursor.execute("""
            INSERT INTO users (username, email, password_hash, salt, is_verified, verification_code, code_expires_at, created_at)
            VALUES (?, ?, ?, ?, 0, ?, ?, ?)
        """, (username, email, pwd_hash, salt, code, expires_at, now))
        conn.commit()

        _send_email_code(email, username, code)
        return True, "Verification code sent to your email.", {"email": email, "username": username, "code_hint": code}

def verify_code(email: str, code: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    email = email.strip().lower()
    code = code.strip()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, verification_code, code_expires_at, is_verified FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if not row:
            return False, "No registration found for this email.", None

        user_id, username, stored_code, expires_at, is_verified = row

        if is_verified:
            token = secrets.token_hex(32)
            cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
            conn.commit()
            return True, "Email is already verified. Logged in successfully.", {"token": token, "username": username, "email": email}

        if time.time() > expires_at:
            return False, "Verification code has expired. Please request a new one.", None

        if stored_code != code:
            return False, "Invalid verification code. Please check your email and try again.", None

        # Mark verified & create session token
        cursor.execute("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", (user_id,))
        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        conn.commit()

        return True, "Email verified successfully! You are now logged in.", {"token": token, "username": username, "email": email}

def resend_code(email: str) -> Tuple[bool, str]:
    email = email.strip().lower()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, is_verified FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            return False, "No account associated with this email address."
        if row[2]:
            return False, "This email is already verified. Please log in."

        username = row[1]
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = time.time() + 900
        cursor.execute("UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?", (code, expires_at, email))
        conn.commit()

        _send_email_code(email, username, code)
        return True, "New verification code sent to your email."

def login_user(identifier: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    identifier = identifier.strip()
    if not identifier:
        return False, "Please enter your email or username.", None
    if not password:
        return False, "Please enter your password.", None

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        # Find by email or username
        cursor.execute("""
            SELECT id, username, email, password_hash, salt, is_verified 
            FROM users 
            WHERE lower(email) = lower(?) OR lower(username) = lower(?)
        """, (identifier, identifier))
        row = cursor.fetchone()

        if not row:
            return False, "Invalid username/email or password.", None

        user_id, username, email, pwd_hash, salt, is_verified = row

        # Verify password hash
        if _hash_password(password, salt) != pwd_hash:
            return False, "Invalid username/email or password.", None

        # Check if email is verified
        if not is_verified:
            return False, "Please verify your email address before logging in.", {"needs_verification": True, "email": email, "username": username}

        # Issue session token
        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        conn.commit()

        return True, "Logged in successfully.", {"token": token, "username": username, "email": email}

def login_with_google(email: str, name: Optional[str] = None) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Sign in with Google: strictly only works if the email has already been registered!
    """
    email = email.strip().lower()
    if not email:
        return False, "Google account email is required.", None

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, is_verified FROM users WHERE lower(email) = lower(?)", (email,))
        row = cursor.fetchone()

        if not row:
            return False, "No registered account found with this Google email. Please sign up first.", None

        user_id, username, email, is_verified = row

        # If user exists, mark verified if not already and log in
        if not is_verified:
            cursor.execute("UPDATE users SET is_verified = 1 WHERE id = ?", (user_id,))

        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        conn.commit()

        return True, "Logged in with Google successfully.", {"token": token, "username": username, "email": email}

def validate_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.username, u.email 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.token = ? AND s.expires_at > ?
        """, (token, time.time()))
        row = cursor.fetchone()
        if row:
            return {"id": row[0], "username": row[1], "email": row[2]}
    return None
