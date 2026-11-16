"""
FastAPI Server for NEXUS
Exposes WebSocket streaming endpoint (/ws/transliterate)
and the 3-step Email Verification + Google Auth Endpoints.
"""

import json
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.transliteration import transliterate_stream, transliterate
from src.auth import (
    start_email_signup,
    verify_email_code,
    complete_signup_username,
    login_with_google_strict,
    login_with_credentials,
    validate_token,
)

app = FastAPI(
    title="NEXUS Transliteration API",
    description="English-to-Kannada Phonetic Transliteration Engine with 3-Step Email Auth",
    version="2.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Transliteration Models -----------------
class TransliterateRequest(BaseModel):
    text: str

# ----------------- Auth Models -----------------
class StartSignupRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class CompleteSignupRequest(BaseModel):
    email: str
    username: str
    password: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    email: str

class CredentialLoginRequest(BaseModel):
    identifier: str
    password: str

# ----------------- General Endpoints -----------------
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "NEXUS Transliteration Engine", "version": "2.2.0"}

@app.post("/api/transliterate")
def api_transliterate(payload: TransliterateRequest):
    return transliterate(payload.text)

# ----------------- Auth Endpoints (3-Step Flow) -----------------
@app.post("/api/auth/start-signup")
def api_start_signup(payload: StartSignupRequest):
    """Step 1: User enters email / Google signup email -> code dispatched to mail."""
    success, msg, data = start_email_signup(email=payload.email)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/verify-code")
def api_verify_code(payload: VerifyCodeRequest):
    """Step 2: User enters the 6-digit code received on their email."""
    success, msg, data = verify_email_code(email=payload.email, code=payload.code)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/complete-signup")
def api_complete_signup(payload: CompleteSignupRequest):
    """Step 3: Once verified, user chooses their unique username only."""
    success, msg, data = complete_signup_username(
        email=payload.email,
        username=payload.username,
        password=payload.password,
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/google-login")
def api_google_login(payload: GoogleLoginRequest):
    """Google Log In: ONLY works if the email has already been registered!"""
    success, msg, data = login_with_google_strict(email=payload.email)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/login")
def api_credential_login(payload: CredentialLoginRequest):
    """Standard Login with Username/Email + Password."""
    success, msg, data = login_with_credentials(identifier=payload.identifier, password=payload.password)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.get("/api/auth/me")
def api_me(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header.")
    token = authorization.replace("Bearer ", "").strip()
    user = validate_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in.")
    return {"user": user}

# ----------------- WebSocket Streaming -----------------
@app.websocket("/ws/transliterate")
async def websocket_transliterate(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data_raw = await websocket.receive_text()
            data = json.loads(data_raw)
            text = data.get("text", "")

            # Stream pipeline events to client
            for event in transliterate_stream(text):
                await websocket.send_text(json.dumps(event))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        await websocket.close()
