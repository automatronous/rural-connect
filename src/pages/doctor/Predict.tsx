import { useEffect, useState } from 'react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { PredictionHistoryTable } from '../../components/PredictionHistoryTable';
import PredictionResult from '../../components/PredictionResult';
import SymptomSelector from '../../components/SymptomSelector';
import { useAuth } from '../../context/AuthContext';
import { predictDisease } from '../../lib/api';
import { fetchPatients, fetchPredictionHistory, savePredictionRecord } from '../../lib/data';
import type { PredictionApiResponse, PredictionView, Profile } from '../../lib/types';

export default function DoctorPredict() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Profile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<PredictionApiResponse | null>(null);
  const [history, setHistory] = useState<PredictionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      try {
        const nextPatients = await fetchPatients();
        if (!active) return;
        setPatients(nextPatients);
        setSelectedPatientId((current) => current || nextPatients[0]?.id || '');
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load patients.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPatients();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setHistory([]);
      return;
    }

    void fetchPredictionHistory(selectedPatientId)
      .then(setHistory)
      .catch((historyError) =>
        setError(historyError instanceof Error ? historyError.message : 'Failed to load prediction history.'),
      );
  }, [selectedPatientId]);

  async function handleRunPrediction() {
    if (!user || !selectedPatientId || !selectedSymptoms.length) return;

    setPredicting(true);
    setError(null);
    setSaved(false);

    try {
      const nextResult = await predictDisease(selectedSymptoms, selectedPatientId, user.id);
      setResult(nextResult);
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : 'Prediction failed.');
    } finally {
      setPredicting(false);
    }
  }

  async function handleSavePrediction() {
    if (!user || !selectedPatientId || !result) return;

    setSaving(true);
    try {
      await savePredictionRecord({
        patientId: selectedPatientId,
        doctorId: user.id,
        symptoms: selectedSymptoms,
        predictedDisease: result.disease,
        confidence: result.confidence,
        top3: result.top3,
      });
      setSaved(true);
      setHistory(await fetchPredictionHistory(selectedPatientId));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Saving prediction failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading prediction tool..." />;
  }

  return (
    <div className="space-y-6">
      <section className="panel-card space-y-4">
        <div>
          <h1 className="heading-orbitron text-3xl font-bold text-white">AI Predictor</h1>
          <p className="mt-3 text-white/60">
            Select a patient, choose symptoms from the FastAPI symptom list, and save the prediction to Supabase.
          </p>
        </div>

        <select
          value={selectedPatientId}
          onChange={(event) => {
            setSelectedPatientId(event.target.value);
            setSaved(false);
            setResult(null);
          }}
          className="field-select"
        >
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id} className="bg-[#0b1118]">
              {patient.name} ({patient.email})
            </option>
          ))}
        </select>
      </section>

      {error ? <div className="panel-card text-red-300">{error}</div> : null}

      <SymptomSelector selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />

      <button
        type="button"
        onClick={handleRunPrediction}
        className="primary-button"
        disabled={predicting || !selectedSymptoms.length || !selectedPatientId}
      >
        {predicting ? 'Running prediction...' : 'Run Prediction'}
      </button>

      {result ? <PredictionResult result={result} onSave={handleSavePrediction} saving={saving} saved={saved} /> : null}

      <section className="space-y-4">
        <h2 className="heading-orbitron text-2xl font-bold text-white">Prediction History</h2>
        <PredictionHistoryTable predictions={history} />
      </section>
    </div>
  );
}
