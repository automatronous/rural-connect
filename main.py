import re
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


APP_ROOT = Path(__file__).resolve().parent


def canonical_symptom_name(value: str) -> str:
    compact = re.sub(r"\s+", "_", value.strip())
    return re.sub(r"_+", "_", compact)


def normalized_symptom_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", canonical_symptom_name(value).lower())


class PredictRequest(BaseModel):
    symptoms: list[str] = Field(default_factory=list)
    patient_id: str | None = None
    doctor_id: str | None = None


@lru_cache
def load_model_bundle() -> dict[str, Any]:
    model = joblib.load(APP_ROOT / "disease_predictor.pkl")
    encoder = joblib.load(APP_ROOT / "disease_encoder.pkl")

    raw_feature_names = [str(name) for name in getattr(model, "feature_names_in_", [])]
    if not raw_feature_names:
        raise RuntimeError("Model feature names are unavailable.")

    symptom_names = sorted({canonical_symptom_name(name) for name in raw_feature_names})
    symptom_tokens = {normalized_symptom_token(name): name for name in symptom_names}
    feature_tokens = [normalized_symptom_token(name) for name in raw_feature_names]
    diseases = [str(label) for label in encoder.classes_.tolist()]

    return {
        "model": model,
        "encoder": encoder,
        "feature_names": raw_feature_names,
        "feature_tokens": feature_tokens,
        "symptoms": symptom_names,
        "symptom_tokens": symptom_tokens,
        "diseases": diseases,
    }


app = FastAPI(title="RuralConnect FastAPI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    bundle = load_model_bundle()
    return {
        "message": "RuralConnect FastAPI Backend",
        "diseases_supported": len(bundle["diseases"]),
        "symptoms_supported": len(bundle["symptoms"]),
    }


@app.get("/health")
async def health():
    try:
        bundle = load_model_bundle()
        return {
            "status": "ok",
            "model_loaded": True,
            "diseases_supported": len(bundle["diseases"]),
            "symptoms_supported": len(bundle["symptoms"]),
        }
    except Exception as exc:  # pragma: no cover
        return {"status": "error", "model_loaded": False, "detail": str(exc)}


@app.get("/symptoms")
async def symptoms():
    bundle = load_model_bundle()
    return {"symptoms": bundle["symptoms"]}


@app.get("/diseases")
async def diseases():
    bundle = load_model_bundle()
    return {"diseases": bundle["diseases"]}


@app.post("/predict")
async def predict(data: PredictRequest):
    bundle = load_model_bundle()
    model = bundle["model"]
    encoder = bundle["encoder"]

    submitted_symptoms = [canonical_symptom_name(symptom) for symptom in data.symptoms if symptom]
    submitted_tokens = {normalized_symptom_token(symptom) for symptom in submitted_symptoms}

    if not submitted_tokens:
      raise HTTPException(status_code=400, detail="At least one symptom is required.")

    vector = np.array(
        [1 if token in submitted_tokens else 0 for token in bundle["feature_tokens"]],
        dtype=np.int8,
    )
    frame = pd.DataFrame([vector], columns=bundle["feature_names"])

    probabilities = model.predict_proba(frame)[0]
    best_index = int(np.argmax(probabilities))
    predicted_disease = str(encoder.classes_[best_index])
    predicted_confidence = round(float(probabilities[best_index]) * 100, 1)

    top_indices = np.argsort(probabilities)[::-1][:3]
    top3 = [
        {
            "disease": str(encoder.classes_[index]),
            "confidence": round(float(probabilities[index]) * 100, 1),
        }
        for index in top_indices
    ]

    supported_tokens = bundle["symptom_tokens"]
    symptoms_used = sorted(
        {
            supported_tokens[token]
            for token in submitted_tokens
            if token in supported_tokens
        }
    )
    symptoms_ignored = sorted(
        {
            symptom
            for symptom in submitted_symptoms
            if normalized_symptom_token(symptom) not in supported_tokens
        }
    )

    return {
        "disease": predicted_disease,
        "confidence": predicted_confidence,
        "top3": top3,
        "symptoms_used": symptoms_used,
        "symptoms_ignored": symptoms_ignored,
    }
