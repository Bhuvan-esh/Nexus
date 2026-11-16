"""
NEXUS Authentication & Verification Service
SQLite-backed persistent user management with real email verification and Google 3-step onboarding.
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
                username TEXT UNIQUE,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                salt TEXT,
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

def _send_email_code(email: str, code: str, username: Optional[str] = None) -> bool:
    """
    Sends 6-digit verification code via SMTP if configured,
    and logs clearly for verification in local development.
    """
    greeting = f"Hello {username}," if username else "Hello,"
    body_text = f"""{greeting}

Welcome to NEXUS! To verify your email and activate your account, please use your 6-digit verification code:

    {code}

This code expires in 15 minutes.

If you did not request this verification, please disregard this email.

— The NEXUS Team
"""

    print(f"\n=======================================================")
    print(f"📧 [NEXUS EMAIL VERIFICATION]")
    print(f"To: {email}")
    print(f"Verification Code: >>> {code} <<<")
    print(f"Expires in 15 minutes")
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

# ----------------- 3-STEP SIGN UP FLOW -----------------

def start_email_signup(email: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Step 1 of Sign Up: User enters their email (or Google email).
    Sends a 6-digit verification code to the mail.
    """
    email = email.strip().lower()
    if not email or "@" not in email or "." not in email:
        return False, "Please enter a valid email address.", None

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, is_verified FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if row and row[2]:
            return False, f"An account with email '{email}' is already registered. Please log in directly.", None

        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = time.time() + 900
        salt = secrets.token_hex(16)
        now = time.time()

        if row:
            # Update pending unverified record
            cursor.execute("""
                UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?
            """, (code, expires_at, email))
        else:
            # Insert pending record
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, salt, is_verified, verification_code, code_expires_at, created_at)
                VALUES (NULL, ?, '', ?, 0, ?, ?, ?)
            """, (email, salt, code, expires_at, now))
        conn.commit()

    _send_email_code(email, code)
    return True, f"Verification code sent to {email}.", {"email": email, "code_hint": code}

def verify_email_code(email: str, code: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Step 2 of Sign Up: User enters the verification code from their email.
    """
    email = email.strip().lower()
    code = code.strip()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, verification_code, code_expires_at, is_verified FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if not row:
            return False, "No registration in progress for this email. Please enter your email first.", None

        user_id, username, stored_code, expires_at, is_verified = row

        if time.time() > expires_at:
            return False, "Verification code has expired. Please request a new code.", None

        if stored_code != code:
            return False, "Invalid verification code. Please check your email and try again.", None

        # Code is correct! Mark code as consumed
        cursor.execute("UPDATE users SET verification_code = NULL WHERE id = ?", (user_id,))
        conn.commit()

        # Needs username if username is not yet set
        needs_username = (username is None or username.strip() == "")
        return True, "Email verified successfully!", {
            "email": email,
            "needs_username": needs_username,
            "username": username or "",
        }

def complete_signup_username(email: str, username: str, password: Optional[str] = None) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Step 3 of Sign Up: After verification code is confirmed, user provides their chosen unique username.
    """
    email = email.strip().lower()
    username = username.strip()

    if not username:
        return False, "Username is required.", None
    if len(username) < 3:
        return False, "Username must be at least 3 characters long.", None
    if not username.replace("_", "").isalnum():
        return False, "Username may only contain letters, numbers, and underscores.", None

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        # Verify username is unique
        cursor.execute("SELECT id FROM users WHERE lower(username) = lower(?) AND email != ?", (username, email))
        if cursor.fetchone():
            return False, f"The username '{username}' is already taken. Please choose another.", None

        cursor.execute("SELECT id, salt FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            return False, "Registration session not found. Please start sign up again.", None

        user_id, salt = row
        pwd_hash = _hash_password(password or "google_auth_default", salt)

        # Mark user fully verified and set unique username
        cursor.execute("""
            UPDATE users SET username = ?, password_hash = ?, is_verified = 1 WHERE id = ?
        """, (username, pwd_hash, user_id))

        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        conn.commit()

        return True, f"Welcome to NEXUS, {username}!", {"token": token, "username": username, "email": email}

# ----------------- LOGIN FLOW -----------------

def login_with_google_strict(email: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Google Log In: ONLY works if the email has already been registered!
    """
    email = email.strip().lower()
    if not email:
        return False, "Google account email is required.", None

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, is_verified 
            FROM users 
            WHERE lower(email) = lower(?)
        """, (email,))
        row = cursor.fetchone()

        if not row:
            return False, f"No registered account found for '{email}'. Please sign up with Google first.", None

        user_id, username, email_val, is_verified = row

        if not is_verified or not username:
            return False, "Account registration is incomplete. Please complete email verification and username setup.", None

        # Successful Google login
        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        conn.commit()

        return True, f"Welcome back, {username}!", {"token": token, "username": username, "email": email_val}

def login_with_credentials(identifier: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Standard login with Username or Email + Password.
    """
    identifier = identifier.strip()
    if not identifier:
        return False, "Please enter your email or username.", None
    if not password:
        return False, "Please enter your password.", None

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, password_hash, salt, is_verified 
            FROM users 
            WHERE lower(email) = lower(?) OR lower(username) = lower(?)
        """, (identifier, identifier))
        row = cursor.fetchone()

        if not row:
            return False, "Invalid username/email or password.", None

        user_id, username, email, pwd_hash, salt, is_verified = row

        if _hash_password(password, salt) != pwd_hash:
            return False, "Invalid username/email or password.", None

        if not is_verified or not username:
            return False, "Email has not been verified yet. Please complete verification.", {"needs_verification": True, "email": email}

        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (token, user_id, time.time(), time.time() + 86400 * 7))
        conn.commit()

        return True, f"Welcome back, {username}!", {"token": token, "username": username, "email": email}

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
