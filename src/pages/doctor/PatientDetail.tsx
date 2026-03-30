import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingScreen } from '../../components/LoadingScreen';
import { PredictionHistoryTable } from '../../components/PredictionHistoryTable';
import PredictionResult from '../../components/PredictionResult';
import { RecordsSection } from '../../components/RecordsSection';
import SymptomSelector from '../../components/SymptomSelector';
import { useAuth } from '../../context/AuthContext';
import { predictDisease } from '../../lib/api';
import { addVisit, fetchPatientDetail, savePredictionRecord, uploadMedicalRecord } from '../../lib/data';
import type { MedicalRecordView, PredictionApiResponse, PredictionView, Profile, VisitView } from '../../lib/types';
import { formatDate } from '../../lib/utils';

type DetailTab = 'records' | 'visits' | 'predict' | 'history';

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Profile | null>(null);
  const [records, setRecords] = useState<MedicalRecordView[]>([]);
  const [visits, setVisits] = useState<VisitView[]>([]);
  const [predictions, setPredictions] = useState<PredictionView[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>('records');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingVisit, setSavingVisit] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [savingPrediction, setSavingPrediction] = useState(false);
  const [savedPrediction, setSavedPrediction] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionApiResponse | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitNotes, setVisitNotes] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!id || !user) return;
    const detail = await fetchPatientDetail(id, user.id);
    setPatient(detail.profile);
    setRecords(detail.records);
    setVisits(detail.visits);
    setPredictions(detail.predictions);
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;

    void loadDetail()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load patient.'))
      .finally(() => setLoading(false));
  }, [id, loadDetail, user]);

  async function handleUploadRecord(payload: { file: File; recordType: string; notes: string }) {
    if (!id || !user) return;
    setUploading(true);

    try {
      await uploadMedicalRecord({
        file: payload.file,
        patientId: id,
        uploadedBy: user.id,
        recordType: payload.recordType,
        notes: payload.notes,
      });
      await loadDetail();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Record upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleAddVisit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !user) return;

    setSavingVisit(true);

    try {
      await addVisit({
        patientId: id,
        doctorId: user.id,
        visitDate,
        notes: visitNotes,
        diagnosisNotes,
      });
      setVisitNotes('');
      setDiagnosisNotes('');
      await loadDetail();
    } catch (visitError) {
      setError(visitError instanceof Error ? visitError.message : 'Failed to save visit.');
    } finally {
      setSavingVisit(false);
    }
  }

  async function handleRunPrediction() {
    if (!id || !user || !selectedSymptoms.length) return;
    setPredicting(true);
    setSavedPrediction(false);

    try {
      const result = await predictDisease(selectedSymptoms, id, user.id);
      setPredictionResult(result);
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : 'Prediction failed.');
    } finally {
      setPredicting(false);
    }
  }

  async function handleSavePrediction() {
    if (!id || !user || !predictionResult) return;
    setSavingPrediction(true);

    try {
      await savePredictionRecord({
        patientId: id,
        doctorId: user.id,
        symptoms: selectedSymptoms,
        predictedDisease: predictionResult.disease,
        confidence: predictionResult.confidence,
        top3: predictionResult.top3,
      });
      setSavedPrediction(true);
      await loadDetail();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save prediction.');
    } finally {
      setSavingPrediction(false);
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading patient detail..." />;
  }

  return (
    <div className="space-y-6">
      <Link to="/doctor/patients" className="text-sm font-semibold text-cs-primary hover:underline">
        ← Back to patients
      </Link>

      <section className="panel-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-ink-secondary">Patient Detail</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-cs-ink">{patient?.name ?? 'Patient'}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-cs-ink-secondary">
          <span>{patient?.email}</span>
          <span>Age {patient?.age ?? 'N/A'}</span>
          <span>Blood Group {patient?.blood_group ?? 'N/A'}</span>
        </div>
      </section>

      {error ? <div className="panel-card text-cs-error">{error}</div> : null}

      <div className="flex flex-wrap gap-3">
        {[
          ['records', 'Medical Records'],
          ['visits', 'Visit History'],
          ['predict', 'AI Prediction'],
          ['history', 'All Predictions'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? 'primary-button' : 'secondary-button'}
            onClick={() => setActiveTab(key as DetailTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'records' ? (
        <RecordsSection
          title="Medical Records"
          description="Upload new files on behalf of this patient and review the complete record table."
          records={records}
          onUpload={handleUploadRecord}
          uploading={uploading}
        />
      ) : null}

      {activeTab === 'visits' ? (
        <div className="space-y-6">
          <section className="panel-card">
            <h2 className="font-display text-xl font-bold text-cs-ink">Add Visit Note</h2>
            <form onSubmit={handleAddVisit} className="mt-6 grid gap-4">
              <input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} className="field-input" />
              <textarea
                value={visitNotes}
                onChange={(event) => setVisitNotes(event.target.value)}
                className="field-textarea"
                placeholder="Visit notes"
              />
              <textarea
                value={diagnosisNotes}
                onChange={(event) => setDiagnosisNotes(event.target.value)}
                className="field-textarea"
                placeholder="Diagnosis notes"
              />
              <button type="submit" className="primary-button" disabled={savingVisit}>
                {savingVisit ? 'Saving visit...' : 'Add Visit Note'}
              </button>
            </form>
          </section>

          <div className="table-shell">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-cell">Date</th>
                    <th className="table-cell">Doctor</th>
                    <th className="table-cell">Notes</th>
                    <th className="table-cell">Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.length ? (
                    visits.map((visit) => (
                      <tr key={visit.id} className="border-t border-cs-surface-high">
                        <td className="table-cell">{formatDate(visit.visit_date)}</td>
                        <td className="table-cell">{visit.doctorName}</td>
                        <td className="table-cell">{visit.notes ?? 'N/A'}</td>
                        <td className="table-cell">{visit.diagnosis_notes ?? 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="table-cell py-8 text-center text-cs-ink-secondary" colSpan={4}>
                        No visits recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'predict' ? (
        <div className="space-y-6">
          <SymptomSelector selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />
          <button
            type="button"
            className="primary-button"
            onClick={handleRunPrediction}
            disabled={predicting || !selectedSymptoms.length}
          >
            {predicting ? 'Running prediction...' : 'Run Prediction'}
          </button>

          {predictionResult ? (
            <PredictionResult
              result={predictionResult}
              onSave={handleSavePrediction}
              saving={savingPrediction}
              saved={savedPrediction}
            />
          ) : null}

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-cs-ink">Prediction History</h2>
            <PredictionHistoryTable predictions={predictions} />
          </section>
        </div>
      ) : null}

      {activeTab === 'history' ? (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-cs-ink">All Predictions</h2>
          <PredictionHistoryTable predictions={predictions} />
        </div>
      ) : null}
    </div>
  );
}
