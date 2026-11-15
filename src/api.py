"""
FastAPI Server for NEXUS
Exposes WebSocket streaming endpoint (/ws/transliterate)
and REST endpoints (/api/transliterate, /api/health)
"""

import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.transliteration import transliterate_stream, transliterate

app = FastAPI(
    title="NEXUS Transliteration API",
    description="English-to-Kannada Phonetic Transliteration Engine",
    version="2.0.0",
)

# Enable CORS for Expo / React Native Web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransliterateRequest(BaseModel):
    text: str

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "NEXUS Transliteration Engine", "version": "2.0.0"}

@app.post("/api/transliterate")
def api_transliterate(payload: TransliterateRequest):
    return transliterate(payload.text)

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
