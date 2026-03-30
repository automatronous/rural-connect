export type Role = 'doctor' | 'patient';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  age: number | null;
  blood_group: string | null;
  allergies: string | null;
  created_at: string;
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

export interface LocationPoint {
  id: string;
  user_id: string | null;
  lat: number;
  lng: number;
  intensity: number;
  created_at: string;
  user_role: Role;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  uploaded_by: string | null;
  file_url: string | null;
  file_name: string | null;
  record_type: string | null;
  notes: string | null;
  upload_date: string | null;
  created_at: string;
}

export interface MedicalRecordView extends MedicalRecord {
  downloadUrl: string | null;
  uploaderName: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  visit_date: string;
  notes: string | null;
  diagnosis_notes: string | null;
  created_at: string;
}

export interface VisitView extends Visit {
  doctorName: string;
}

export interface DifferentialDiagnosis {
  disease: string;
  confidence: number;
}

export interface Prediction {
  id: string;
  patient_id: string;
  doctor_id: string;
  symptoms_input: string[];
  predicted_disease: string;
  confidence: number;
  top3: DifferentialDiagnosis[] | null;
  model_version: string | null;
  created_at: string;
}

export interface PredictionView extends Prediction {
  doctorName: string;
  patientName: string;
}

export interface PredictionApiResponse {
  disease: string;
  confidence: number;
  top3: DifferentialDiagnosis[];
  symptoms_used: string[];
  symptoms_ignored: string[];
}

export interface UploadRecordInput {
  file: File;
  patientId: string;
  uploadedBy: string;
  recordType: string;
  notes: string;
}

export interface VisitInput {
  patientId: string;
  doctorId: string;
  visitDate: string;
  notes: string;
  diagnosisNotes: string;
}

export interface DiseaseReportInput {
  disease_name: string;
  region_name: string;
  lat: number;
  lng: number;
  case_count: number;
  report_date: string;
  reported_by: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  hint?: string;
}

export interface DoctorDashboardData {
  stats: DashboardStat[];
  recentPredictions: PredictionView[];
  recentPatients: Array<Profile & { lastVisitDate: string | null }>;
}

export interface PatientDashboardData {
  stats: DashboardStat[];
  recentRecords: MedicalRecordView[];
  recentVisits: VisitView[];
}

export interface PatientListRow extends Profile {
  lastVisitDate: string | null;
  lastPredictedDisease: string | null;
}
