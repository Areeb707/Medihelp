"""
routes/voice.py — Server-side ElevenLabs Text-to-Speech integration & Page Guidance
"""
import os
import requests
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

router = APIRouter(prefix="/voice", tags=["voice"])

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "JBFqnCBsd6RMkjVDRZzb"  # Default ElevenLabs Multilingual V2 voice (George)

PAGE_GUIDANCE = {
    "/patients/list": {
        "title": "Patients List",
        "en": "This page shows your patients list. You can create a new patient, select an active patient to view their memory hub, or delete patient memory.",
        "ta": "இந்தப் பக்கம் உங்கள் நோயாளிகளின் பட்டியலைக் காட்டுகிறது. நீங்கள் ஒரு புதிய நோயாளியை உருவாக்கலாம் அல்லது நோயாளியின் நினைவகத்தைப் பார்க்க தேர்வு செய்யலாம்."
    },
    "/patients": {
        "title": "Memory Hub",
        "en": "This page shows patient health connections, clinical history snapshots, and immediate risk alerts from stored documents.",
        "ta": "இந்தப் பக்கம் நோயாளியின் சுகாதாரத் தொடர்புகள், மருத்துவ வரலாற்று விவரங்கள் மற்றும் எச்சரிக்கைகளைக் காட்டுகிறது."
    },
    "/patients/upload": {
        "title": "Upload Documents",
        "en": "This page lets you add a patient's medical report. For the most reliable results, upload the medical report as a PDF file.",
        "ta": "நோயாளியின் மருத்துவ அறிக்கையைச் சேர்க்க இந்தப் பக்கம் உதவுகிறது. சிறந்த முடிவுகளுக்கு PDF கோப்பை பதிவேற்றவும்."
    },
    "/patients/timeline": {
        "title": "Health Timeline",
        "en": "This page shows the patient's longitudinal health history and document progression in chronological order.",
        "ta": "இந்தப் பக்கம் நோயாளியின் சுகாதார வரலாற்றை காலவரிசைப்படி காட்டுகிறது."
    },
    "/patients/chat": {
        "title": "AI Doctor Chat",
        "en": "You can ask questions based on the patient's recorded medical history. The assistant will answer using evidence from stored documents.",
        "ta": "நோயாளியின் பதிவுசெய்யப்பட்ட மருத்துவ வரலாற்றின் அடிப்படையில் நீங்கள் கேள்விகளைக் கேட்கலாம்."
    },
    "/patients/brief": {
        "title": "Pre-Visit Brief",
        "en": "This page generates a concise pre-visit clinical summary highlighting key diagnoses, medications, and potential risks before patient consultation.",
        "ta": "நோயாளியைச் சந்திப்பதற்கு முன் முக்கியமான மருத்துவச் சுருக்கம் மற்றும் முன்னெச்சரிக்கைகளை இந்தப் பக்கம் வழங்குகிறது."
    },
    "/patients/mindmap": {
        "title": "Patient Health Connections",
        "en": "This page displays Patient Health Connections derived from the Cognee Knowledge Graph, showing relationships between conditions, labs, and medications.",
        "ta": "இந்தப் பக்கம் நோயாளியின் நிலைகள், சோதனைகள் மற்றும் மருந்துகளுக்கு இடையேயான தொடர்புகளைக் காட்டுகிறது."
    },
    "/assisted": {
        "title": "Assisted Care Mode",
        "en": "Assisted Care mode provides a simplified, guided interface for health workers and caregivers to manage patients, upload reports, and hear voice explanations.",
        "ta": "உதவி பராமரிப்பு முறை சுகாதார பணியாளர்கள் மற்றும் பராமரிப்பாளர்களுக்கு எளிமையாக்கப்பட்ட வழிகாட்டுதலை வழங்குகிறது."
    }
}

@router.post("/tts")
async def text_to_speech(body: TTSRequest):
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Voice generation unavailable: ELEVENLABS_API_KEY is not configured on the server."
        )

    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Limit text length for safety
    if len(text) > 1500:
        text = text[:1500]

    voice_id = body.voice_id if body.voice_id and body.voice_id != "21m00Tcm4TlvDq8ikWAM" else "JBFqnCBsd6RMkjVDRZzb"
    voices_to_try = [voice_id, "JBFqnCBsd6RMkjVDRZzb", "pNInz6obpgDQGcFmaJgB"]

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    last_err = ""
    for vid in voices_to_try:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}"
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=15)
            if res.status_code == 200:
                return Response(content=res.content, media_type="audio/mpeg")
            else:
                last_err = res.text
                print(f"[ElevenLabs TTS Warning] Voice {vid} returned status {res.status_code}: {res.text[:150]}")
        except requests.RequestException as e:
            last_err = str(e)
            print(f"[ElevenLabs TTS Exception] Voice {vid}: {e}")

    raise HTTPException(
        status_code=502,
        detail=f"Voice synthesis failed: {last_err[:200]}"
    )

class PageGuideRequest(BaseModel):
    path: str

@router.post("/explain-page")
async def explain_page(body: PageGuideRequest):
    normalized_path = body.path.rstrip("/")
    if not normalized_path:
        normalized_path = "/patients"
    
    guidance = PAGE_GUIDANCE.get(normalized_path)
    if not guidance:
        # Fallback for dynamic patient routes
        if normalized_path.startswith("/patients"):
            guidance = PAGE_GUIDANCE["/patients"]
        else:
            guidance = {
                "title": "MediHelp AI",
                "en": "MediHelp AI provides accessible, reliable patient memory and clinical decision support.",
                "ta": "MediHelp AI அணுகக்கூடிய, நம்பகமான நோயாளி நினைவகம் மற்றும் மருத்துவ ஆதரவை வழங்குகிறது."
            }
    return guidance
