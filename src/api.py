"""
FastAPI Server for NEXUS
Exposes WebSocket streaming endpoint (/ws/transliterate),
REST transliterate endpoints, and Authentication & Email Verification endpoints.
"""

import json
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from src.transliteration import transliterate_stream, transliterate
from src.auth import (
    register_user,
    verify_code,
    resend_code,
    login_user,
    login_with_google,
    validate_token,
)

app = FastAPI(
    title="NEXUS Transliteration API",
    description="English-to-Kannada Phonetic Transliteration Engine with Email Auth",
    version="2.1.0",
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
class SignUpRequest(BaseModel):
    username: str
    email: str
    password: str
    confirm_password: str

class VerifyRequest(BaseModel):
    email: str
    code: str

class ResendRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    identifier: str  # Email or Username
    password: str

class GoogleAuthRequest(BaseModel):
    email: str
    name: Optional[str] = None

# ----------------- General Endpoints -----------------
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "NEXUS Transliteration Engine", "version": "2.1.0"}

@app.post("/api/transliterate")
def api_transliterate(payload: TransliterateRequest):
    return transliterate(payload.text)

# ----------------- Authentication Endpoints -----------------
@app.post("/api/auth/signup")
def api_signup(payload: SignUpRequest):
    success, msg, data = register_user(
        username=payload.username,
        email=payload.email,
        password=payload.password,
        confirm_password=payload.confirm_password,
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/verify")
def api_verify(payload: VerifyRequest):
    success, msg, data = verify_code(email=payload.email, code=payload.code)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/resend")
def api_resend(payload: ResendRequest):
    success, msg = resend_code(email=payload.email)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg}

@app.post("/api/auth/login")
def api_login(payload: LoginRequest):
    success, msg, data = login_user(identifier=payload.identifier, password=payload.password)
    if not success:
        if data and data.get("needs_verification"):
            raise HTTPException(status_code=403, detail={"message": msg, "needs_verification": True, "email": data.get("email"), "username": data.get("username")})
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "data": data}

@app.post("/api/auth/google")
def api_google_login(payload: GoogleAuthRequest):
    success, msg, data = login_with_google(email=payload.email, name=payload.name)
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
