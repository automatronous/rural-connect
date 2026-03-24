export type UserRole = 'patient' | 'doctor';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age: number | null;
  blood_group: string | null;
  allergies: string | null;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  record_type: string;
  upload_date: string;
  notes: string | null;
  created_at: string;
  uploader?: Profile;
  patient?: Profile;
}

export interface Visit {
  id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  notes: string | null;
  diagnosis_notes: string | null;
  created_at: string;
  doctor?: Profile;
  patient?: Profile;
}

export interface Prediction {
  id: string;
  patient_id: string;
  doctor_id: string;
  symptoms_input: string[];
  predicted_disease: string;
  confidence: number;
  top3: Top3Item[];
  model_version: string;
  created_at: string;
  doctor?: Profile;
  patient?: Profile;
}

export interface Top3Item {
  disease: string;
  confidence: number;
}

export interface DiseaseReport {
  id: string;
  disease_name: string;
  region_name: string;
  lat: number;
  lng: number;
  case_count: number;
  report_date: string;
  reported_by: string | null;
  created_at: string;
}
