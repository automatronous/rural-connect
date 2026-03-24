"""
main.py — Robix Medical Platform FastAPI Backend
Disease predictor: RandomForestClassifier (41 diseases, 131 symptoms)
Encoder: LabelEncoder

Place disease_predictor.pkl and disease_encoder.pkl in the same folder as this file.
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="Robix Disease Predictor API", version="1.0.0")

# ── CORS (allow your frontend origin) ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Replace * with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load models once at startup ────────────────────────────
try:
    predictor = joblib.load("disease_predictor.pkl")
    encoder   = joblib.load("disease_encoder.pkl")
    FEATURE_NAMES = list(predictor.feature_names_in_)   # 394 features (with duplicates)
    DISEASE_CLASSES = list(encoder.classes_)             # 41 disease names
    print(f"✅ Models loaded. Features: {len(FEATURE_NAMES)}, Diseases: {len(DISEASE_CLASSES)}")
except Exception as e:
    print(f"❌ Model load error: {e}")
    predictor = None
    encoder   = None
    FEATURE_NAMES = []
    DISEASE_CLASSES = []

# ── All 131 unique valid symptoms (for frontend checkbox list) ──
VALID_SYMPTOMS = [
    'abdominal_pain','abnormal_menstruation','acidity','acute_liver_failure',
    'altered_sensorium','anxiety','back_pain','belly_pain','blackheads',
    'bladder_discomfort','blister','blood_in_sputum','bloody_stool',
    'blurred_and_distorted_vision','breathlessness','brittle_nails','bruising',
    'burning_micturition','chest_pain','chills','cold_hands_and_feets','coma',
    'congestion','constipation','continuous_feel_of_urine','continuous_sneezing',
    'cough','cramps','dark_urine','dehydration','depression','diarrhoea',
    'dischromic _patches','distention_of_abdomen','dizziness',
    'drying_and_tingling_lips','enlarged_thyroid','excessive_hunger',
    'extra_marital_contacts','family_history','fast_heart_rate','fatigue',
    'fluid_overload','foul_smell_of urine','headache','high_fever',
    'hip_joint_pain','history_of_alcohol_consumption','increased_appetite',
    'indigestion','inflammatory_nails','internal_itching','irregular_sugar_level',
    'irritability','irritation_in_anus','itching','joint_pain','knee_pain',
    'lack_of_concentration','lethargy','loss_of_appetite','loss_of_balance',
    'loss_of_smell','malaise','mild_fever','mood_swings','movement_stiffness',
    'mucoid_sputum','muscle_pain','muscle_wasting','muscle_weakness','nausea',
    'neck_pain','nodal_skin_eruptions','obesity','pain_behind_the_eyes',
    'pain_during_bowel_movements','pain_in_anal_region','painful_walking',
    'palpitations','passage_of_gases','patches_in_throat','phlegm','polyuria',
    'prominent_veins_on_calf','puffy_face_and_eyes','pus_filled_pimples',
    'receiving_blood_transfusion','receiving_unsterile_injections',
    'red_sore_around_nose','red_spots_over_body','redness_of_eyes','restlessness',
    'runny_nose','rusty_sputum','scurring','shivering','silver_like_dusting',
    'sinus_pressure','skin_peeling','skin_rash','slurred_speech',
    'small_dents_in_nails','spinning_movements','spotting_ urination',
    'stiff_neck','stomach_bleeding','stomach_pain','sunken_eyes','sweating',
    'swelled_lymph_nodes','swelling_joints','swelling_of_stomach',
    'swollen_blood_vessels','swollen_extremeties','swollen_legs',
    'throat_irritation','toxic_look_(typhos)','ulcers_on_tongue','unsteadiness',
    'visual_disturbances','vomiting','watering_from_eyes','weakness_in_limbs',
    'weakness_of_one_body_side','weight_gain','weight_loss','yellow_crust_ooze',
    'yellow_urine','yellowing_of_eyes','yellowish_skin'
]

# ── Request / Response schemas ──────────────────────────────
class PredictRequest(BaseModel):
    symptoms: List[str]          # list of symptom strings the patient has
    patient_id: Optional[str] = None
    doctor_id:  Optional[str] = None

class PredictResponse(BaseModel):
    disease:     str
    confidence:  float           # 0.0 – 1.0
    top3:        List[dict]      # top 3 predictions with confidence
    symptoms_used: List[str]     # which symptoms were recognized
    symptoms_ignored: List[str]  # which symptoms were not in model

# ── Endpoints ───────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": predictor is not None,
        "diseases_supported": len(DISEASE_CLASSES),
        "symptoms_supported": len(VALID_SYMPTOMS)
    }

@app.get("/symptoms")
def get_symptoms():
    """Returns all 131 valid symptom names for the frontend checkbox UI."""
    return {"symptoms": VALID_SYMPTOMS}

@app.get("/diseases")
def get_diseases():
    """Returns all 41 disease names the model can predict."""
    return {"diseases": DISEASE_CLASSES}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if predictor is None or encoder is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Normalize incoming symptoms
    incoming = [s.strip().lower().replace(" ","_") for s in req.symptoms]
    valid_set = set(VALID_SYMPTOMS)

    recognized = [s for s in incoming if s in valid_set]
    ignored    = [s for s in incoming if s not in valid_set]

    if not recognized:
        raise HTTPException(
            status_code=400,
            detail=f"No valid symptoms provided. Ignored: {ignored}"
        )

    # Build input vector — 394 features, set 1 wherever the feature name
    # (stripped) matches a provided symptom
    input_vec = pd.DataFrame(
        [[1 if f.strip() in recognized else 0 for f in FEATURE_NAMES]],
        columns=FEATURE_NAMES
    )

    pred   = predictor.predict(input_vec)
    proba  = predictor.predict_proba(input_vec)[0]

    # Primary result
    disease_name = encoder.inverse_transform(pred)[0]
    confidence   = float(np.max(proba))

    # Top 3
    top3_idx = np.argsort(proba)[::-1][:3]
    top3 = [
        {
            "disease":    encoder.inverse_transform([predictor.classes_[i]])[0],
            "confidence": round(float(proba[i]) * 100, 1)
        }
        for i in top3_idx
    ]

    return PredictResponse(
        disease=disease_name,
        confidence=round(confidence, 4),
        top3=top3,
        symptoms_used=recognized,
        symptoms_ignored=ignored
    )
