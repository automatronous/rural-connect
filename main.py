import pickle, numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# 4. Add CORS
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# 1. Load ML models on startup
try:
    with open('disease_predictor.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('disease_encoder.pkl', 'rb') as f:
        encoder = pickle.load(f)
except Exception as e:
    print(f"Error loading models: {e}")
    model = None
    encoder = None

SYMPTOMS = ['fever','cough','fatigue','difficulty_breathing',
'headache','body_aches','loss_of_taste','sore_throat',
'runny_nose','nausea','vomiting','diarrhea','rash',
'chest_pain','chills']

@app.get("/")
async def root():
    return {"message": "RuralConnect FastAPI Backend"}

# 2. POST /predict
@app.post("/predict")
async def predict_disease(data: dict):
    if model is None or encoder is None:
        raise HTTPException(status_code=500, detail="Models not loaded")
    symptoms = data.get('symptoms', [])
    input_vector = [1 if s in symptoms else 0 for s in SYMPTOMS]
    prediction = model.predict([input_vector])[0]
    confidence = float(max(model.predict_proba([input_vector])[0]))
    disease = encoder.inverse_transform([prediction])[0]
    return { "disease": disease, "confidence": round(confidence * 100, 1) }

# 3. GET /heatmap-data
@app.get("/heatmap-data")
async def get_heatmap_data():
    return { "data": [
      {"lat":28.6139,"lng":77.2090,"district":"Delhi","state":"Delhi","disease":"Dengue","weight":0.9},
      {"lat":19.0760,"lng":72.8777,"district":"Mumbai","state":"Maharashtra","disease":"Malaria","weight":0.8},
      {"lat":22.5726,"lng":88.3639,"district":"Kolkata","state":"West Bengal","disease":"TB","weight":0.7},
      {"lat":13.0827,"lng":80.2707,"district":"Chennai","state":"Tamil Nadu","disease":"Dengue","weight":0.6},
      {"lat":17.3850,"lng":78.4867,"district":"Hyderabad","state":"Telangana","disease":"Malaria","weight":0.7},
      {"lat":23.0225,"lng":72.5714,"district":"Ahmedabad","state":"Gujarat","disease":"COVID","weight":0.5},
      {"lat":26.8467,"lng":80.9462,"district":"Lucknow","state":"UP","disease":"TB","weight":0.8},
      {"lat":15.2993,"lng":74.1240,"district":"Goa","state":"Goa","disease":"Dengue","weight":0.4},
      {"lat":21.1458,"lng":79.0882,"district":"Nagpur","state":"Maharashtra","disease":"Malaria","weight":0.6},
      {"lat":25.5941,"lng":85.1376,"district":"Patna","state":"Bihar","disease":"TB","weight":0.9}
    ]}

