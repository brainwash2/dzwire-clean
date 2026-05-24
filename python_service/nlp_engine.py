import os
import httpx
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline

app = FastAPI(title="DzWire AI Situational Awareness Engine", version="1.0.0")

API_KEY_NAME = "Authorization"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

# Load Zero-Shot Classification Pipeline using Bart-Large-MNLI
# This evaluates text against dynamic threat vectors without requiring customized training data.
print("[AI CORE] Loading Bart-Large-MNLI model into memory...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=-1) # -1 for CPU, 0 for GPU
print("[AI CORE] Model loaded successfully.")

# Defined Geopolitical & Threat Vectors
THREAT_LABELS = ["geopolitical conflict", "military activity", "energy infrastructure security", "macroeconomic instability"]

class IngestSignalPayload(BaseModel):
    id: str
    text_content: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

def verify_token(api_key: str = Depends(api_key_header)):
    token = api_key.replace("Bearer ", "").strip()
    if token != os.getenv("INTERNAL_INGESTION_SECRET"):
        raise HTTPException(status_code=403, detail="Forbidden: Invalid credentials")
    return token

@app.post("/api/v1/ai/classify", response_model=dict)
async def classify_osint_signal(payload: IngestSignalPayload, token: str = Depends(verify_token)):
    try:
        # 1. Run zero-shot classification on incoming OSINT text
        classification = classifier(
            payload.text_content,
            candidate_labels=THREAT_LABELS,
            multi_label=False
        )
        
        primary_label = classification["labels"][0]
        confidence_score = classification["scores"][0]
        
        # 2. Map label strings to database-compliant threat categories
        category_map = {
            "geopolitical conflict": "geopolitical",
            "military activity": "military",
            "energy infrastructure security": "energy",
            "macroeconomic instability": "macroeconomic"
        }
        
        threat_category = category_map.get(primary_label, "geopolitical")
        
        # 3. Generate a 2-sentence bulleted summary dynamically using extraction rules
        sentences = payload.text_content.split(".")
        brief = " • ".join([s.strip() for s in sentences[:2] if len(s) > 10])
        
        # 4. Return structured threat intelligence
        return {
            "signal_id": payload.id,
            "threat_category": threat_category,
            "risk_score": float(confidence_score),
            "focal_point_weight": float(confidence_score * 1.5) if confidence_score > 0.8 else 0.0,
            "ai_bullet_brief": f"• {brief}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
