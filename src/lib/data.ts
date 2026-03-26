import { supabase } from './supabase';
import type {
  DiseaseReport,
  DiseaseReportInput,
  DoctorDashboardData,
  MedicalRecord,
  MedicalRecordView,
  PatientDashboardData,
  PatientListRow,
  Prediction,
  PredictionView,
  Profile,
  UploadRecordInput,
  Visit,
  VisitInput,
  VisitView,
} from './types';
import { formatDate, normalizeConfidence, truncate, unique } from './utils';

async function fetchProfilesByIds(ids: string[]) {
  if (!ids.length) return new Map<string, Profile>();

  const { data, error } = await supabase.from('profiles').select('*').in('id', ids);
  if (error) {
    return new Map<string, Profile>();
  }

  return new Map((data as Profile[]).map((profile) => [profile.id, profile]));
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function fetchPublicDiseaseReports() {
  const { data, error } = await supabase
    .from('disease_reports')
    .select('*')
    .order('report_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DiseaseReport[]) ?? [];
}

export function subscribeToDiseaseReports(onInsert: (report: DiseaseReport) => void) {
  const channel = supabase
    .channel(`disease_reports_${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'disease_reports' },
      (payload) => {
        onInsert(payload.new as DiseaseReport);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function createDiseaseReport(input: DiseaseReportInput) {
  const { error } = await supabase.from('disease_reports').insert(input);
  if (error) throw error;
}

export async function fetchPatients() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as Profile[]) ?? [];
}

export async function fetchPatientListRows() {
  const [patientsResult, visitsResult, predictionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'patient').order('name', { ascending: true }),
    supabase.from('visits').select('patient_id, visit_date').order('visit_date', { ascending: false }),
    supabase
      .from('predictions')
      .select('patient_id, predicted_disease, created_at')
      .order('created_at', { ascending: false }),
  ]);

  if (patientsResult.error) throw patientsResult.error;
  if (visitsResult.error) throw visitsResult.error;
  if (predictionsResult.error) throw predictionsResult.error;

  const lastVisitByPatient = new Map<string, string>();
  for (const visit of (visitsResult.data as Array<Pick<Visit, 'patient_id' | 'visit_date'>>) ?? []) {
    if (!lastVisitByPatient.has(visit.patient_id)) {
      lastVisitByPatient.set(visit.patient_id, visit.visit_date);
    }
  }

  const lastPredictionByPatient = new Map<string, string>();
  for (const prediction of (predictionsResult.data as Array<Pick<Prediction, 'patient_id' | 'predicted_disease'>>) ?? []) {
    if (!lastPredictionByPatient.has(prediction.patient_id)) {
      lastPredictionByPatient.set(prediction.patient_id, prediction.predicted_disease);
    }
  }

  const rows = ((patientsResult.data as Profile[]) ?? []).map((patient) => ({
    ...patient,
    lastVisitDate: lastVisitByPatient.get(patient.id) ?? null,
    lastPredictedDisease: lastPredictionByPatient.get(patient.id) ?? null,
  }));

  const predictionOptions = unique(
    rows.map((row) => row.lastPredictedDisease).filter((value): value is string => Boolean(value)),
  ).sort((left, right) => left.localeCompare(right));

  return { rows, predictionOptions };
}

export async function fetchMedicalRecords(patientId: string, viewerId?: string) {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const records = (data as MedicalRecord[]) ?? [];
  const uploaderIds = unique(
    records.map((record) => record.uploaded_by).filter((value): value is string => Boolean(value)),
  );
  const uploaderMap = await fetchProfilesByIds(uploaderIds);

  return records.map((record) => {
    const { data: publicUrlData } = supabase.storage
      .from('medical-records')
      .getPublicUrl(record.file_url ?? '');

    const uploader = record.uploaded_by ? uploaderMap.get(record.uploaded_by) : null;
    let uploaderName = 'Unknown';

    if (record.uploaded_by && viewerId && record.uploaded_by === viewerId) {
      uploaderName = 'You';
    } else if (uploader?.name) {
      uploaderName = uploader.name;
    } else if (record.uploaded_by === patientId) {
      uploaderName = 'Patient';
    } else if (record.uploaded_by) {
      uploaderName = 'Doctor';
    }

    return {
      ...record,
      downloadUrl: record.file_url ? publicUrlData.publicUrl : null,
      uploaderName,
    } satisfies MedicalRecordView;
  });
}

export async function uploadMedicalRecord(input: UploadRecordInput) {
  const timestamp = Date.now();
  const filePath = `${input.patientId}/${timestamp}_${input.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('medical-records')
    .upload(filePath, input.file, { upsert: false });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from('medical_records').insert({
    patient_id: input.patientId,
    uploaded_by: input.uploadedBy,
    file_url: filePath,
    file_name: input.file.name,
    record_type: input.recordType,
    notes: input.notes || null,
    upload_date: new Date().toISOString().slice(0, 10),
  });

  if (insertError) throw insertError;
}

export async function fetchVisits(patientId: string, viewerId?: string) {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  const visits = (data as Visit[]) ?? [];
  const doctorIds = unique(
    visits.map((visit) => visit.doctor_id).filter((value): value is string => Boolean(value)),
  );
  const doctorsById = await fetchProfilesByIds(doctorIds);

  return visits.map((visit) => ({
    ...visit,
    doctorName:
      (visit.doctor_id && viewerId && visit.doctor_id === viewerId && 'You') ||
      doctorsById.get(visit.doctor_id ?? '')?.name ||
      'Doctor',
  })) as VisitView[];
}

export async function addVisit(input: VisitInput) {
  const { error } = await supabase.from('visits').insert({
    patient_id: input.patientId,
    doctor_id: input.doctorId,
    visit_date: input.visitDate,
    notes: input.notes || null,
    diagnosis_notes: input.diagnosisNotes || null,
  });

  if (error) throw error;
}

export async function fetchPredictionHistory(patientId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const predictions = (data as Prediction[]) ?? [];
  const [doctorProfiles, patientProfile] = await Promise.all([
    fetchProfilesByIds(
      unique(predictions.map((prediction) => prediction.doctor_id).filter((value): value is string => Boolean(value))),
    ),
    fetchProfile(patientId),
  ]);

  return predictions.map((prediction) => ({
    ...prediction,
    confidence: normalizeConfidence(prediction.confidence),
    top3: prediction.top3?.map((item) => ({
      ...item,
      confidence: normalizeConfidence(item.confidence),
    })) ?? null,
    doctorName: doctorProfiles.get(prediction.doctor_id)?.name ?? 'Doctor',
    patientName: patientProfile?.name ?? 'Patient',
  })) as PredictionView[];
}

export async function savePredictionRecord(input: {
  patientId: string;
  doctorId: string;
  symptoms: string[];
  predictedDisease: string;
  confidence: number;
  top3: Array<{ disease: string; confidence: number }>;
}) {
  const { error } = await supabase.from('predictions').insert({
    patient_id: input.patientId,
    doctor_id: input.doctorId,
    symptoms_input: input.symptoms,
    predicted_disease: input.predictedDisease,
    confidence: normalizeConfidence(input.confidence),
    top3: input.top3.map((entry) => ({
      disease: entry.disease,
      confidence: normalizeConfidence(entry.confidence),
    })),
  });

  if (error) throw error;
}

export async function fetchDoctorDashboardData(doctorId: string): Promise<DoctorDashboardData> {
  const [
    patientsCountResult,
    predictionsCountResult,
    recordsCountResult,
    reportsCountResult,
    predictionsResult,
    visitsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { head: true, count: 'exact' }).eq('role', 'patient'),
    supabase.from('predictions').select('*', { head: true, count: 'exact' }).eq('doctor_id', doctorId),
    supabase.from('medical_records').select('*', { head: true, count: 'exact' }).eq('uploaded_by', doctorId),
    supabase.from('disease_reports').select('*', { head: true, count: 'exact' }).eq('reported_by', doctorId),
    supabase
      .from('predictions')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('visits')
      .select('patient_id, visit_date')
      .eq('doctor_id', doctorId)
      .order('visit_date', { ascending: false })
      .limit(25),
  ]);

  if (patientsCountResult.error) throw patientsCountResult.error;
  if (predictionsCountResult.error) throw predictionsCountResult.error;
  if (recordsCountResult.error) throw recordsCountResult.error;
  if (reportsCountResult.error) throw reportsCountResult.error;
  if (predictionsResult.error) throw predictionsResult.error;
  if (visitsResult.error) throw visitsResult.error;

  const predictionRows = (predictionsResult.data as Prediction[]) ?? [];
  const recentVisits = (visitsResult.data as Array<Pick<Visit, 'patient_id' | 'visit_date'>>) ?? [];

  const patientIds = unique([
    ...predictionRows.map((prediction) => prediction.patient_id),
    ...recentVisits.map((visit) => visit.patient_id),
  ]);

  const patientProfiles = await fetchProfilesByIds(patientIds);

  const recentPredictions = predictionRows.map((prediction) => ({
    ...prediction,
    confidence: normalizeConfidence(prediction.confidence),
    top3: prediction.top3?.map((item) => ({
      ...item,
      confidence: normalizeConfidence(item.confidence),
    })) ?? null,
    doctorName: 'You',
    patientName: patientProfiles.get(prediction.patient_id)?.name ?? 'Patient',
  })) as PredictionView[];

  const seenPatients = new Set<string>();
  const recentPatients: Array<Profile & { lastVisitDate: string | null }> = [];

  for (const visit of recentVisits) {
    if (seenPatients.has(visit.patient_id)) continue;
    seenPatients.add(visit.patient_id);

    const patient = patientProfiles.get(visit.patient_id);
    if (!patient) continue;

    recentPatients.push({
      ...patient,
      lastVisitDate: visit.visit_date ?? null,
    });

    if (recentPatients.length === 5) break;
  }

  if (!recentPatients.length) {
    const fallbackPatients = await fetchPatients();
    recentPatients.push(
      ...fallbackPatients.slice(0, 5).map((patient) => ({
        ...patient,
        lastVisitDate: null,
      })),
    );
  }

  return {
    stats: [
      { label: 'Total Patients', value: String(patientsCountResult.count ?? 0) },
      { label: 'Predictions Run', value: String(predictionsCountResult.count ?? 0) },
      { label: 'Records Uploaded', value: String(recordsCountResult.count ?? 0) },
      { label: 'Disease Reports', value: String(reportsCountResult.count ?? 0) },
    ],
    recentPredictions,
    recentPatients,
  };
}

export async function fetchPatientDashboardData(patientId: string): Promise<PatientDashboardData> {
  const [records, visits] = await Promise.all([
    fetchMedicalRecords(patientId, patientId),
    fetchVisits(patientId),
  ]);

  const lastCheckup = visits[0]?.visit_date ?? null;

  return {
    stats: [
      { label: 'Records Uploaded', value: String(records.length) },
      { label: 'Doctor Visits', value: String(visits.length) },
      { label: 'Last Checkup', value: formatDate(lastCheckup) },
    ],
    recentRecords: records.slice(0, 3),
    recentVisits: visits.slice(0, 3),
  };
}

export async function fetchPatientDetail(patientId: string, viewerId?: string) {
  const [profile, records, visits, predictions] = await Promise.all([
    fetchProfile(patientId),
    fetchMedicalRecords(patientId, viewerId),
    fetchVisits(patientId, viewerId),
    fetchPredictionHistory(patientId),
  ]);

  return { profile, records, visits, predictions };
}

export function filterPatientRows(
  rows: PatientListRow[],
  search: string,
  predictedDisease: string,
  fromDate: string,
  toDate: string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      !normalizedSearch ||
      row.name.toLowerCase().includes(normalizedSearch) ||
      row.email.toLowerCase().includes(normalizedSearch);

    const matchesDisease = !predictedDisease || row.lastPredictedDisease === predictedDisease;

    const visitDate = row.lastVisitDate ? new Date(row.lastVisitDate) : null;
    const fromMatches = !fromDate || (visitDate ? visitDate >= new Date(fromDate) : false);
    const toMatches = !toDate || (visitDate ? visitDate <= new Date(toDate) : false);

    return matchesSearch && matchesDisease && fromMatches && toMatches;
  });
}

export function previewDiagnosis(note: string | null) {
  return truncate(note, 96);
}
