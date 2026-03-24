export interface PredictRequest {
  symptoms: string[];
  patient_id: string;
  doctor_id: string;
}

export interface Top3Prediction {
  disease: string;
  confidence: number;
}

export interface PredictResponse {
  disease: string;
  confidence: number;
  top3: Top3Prediction[];
  symptoms_used: string[];
  symptoms_ignored: string[];
}

export interface SymptomsResponse {
  symptoms: string[];
}

export interface DiseasesResponse {
  diseases: string[];
}

export interface HealthResponse {
  status: string;
}
