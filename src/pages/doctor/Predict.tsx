import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import SymptomSelector from '../../components/SymptomSelector';
import PredictionResult from '../../components/PredictionResult';
import { usePrediction } from '../../hooks/usePrediction';
import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../context/AuthContext';
import { Brain, Activity, ChevronDown } from 'lucide-react';
import type { PredictResponse } from '../../types/api.types';

export default function DoctorPredict() {
  const { profile } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [localResult, setLocalResult] = useState<PredictResponse | null>(null);
  const [savedFor, setSavedFor] = useState('');
  const { runPrediction, predicting, savePrediction, saving } = usePrediction();
  const { data: patients } = usePatients();

  const handlePredict = async () => {
    if (!selectedSymptoms.length || !profile) return;
    const result = await runPrediction({
      symptoms: selectedSymptoms,
      patient_id: selectedPatientId || 'anonymous',
      doctor_id: profile.id,
    });
    if (result) { setLocalResult(result); setSavedFor(''); }
  };

  const handleSave = async () => {
    if (!localResult || !selectedPatientId || !profile) return;
    await savePrediction({
      patient_id: selectedPatientId,
      doctor_id: profile.id,
      symptoms_input: selectedSymptoms,
      predicted_disease: localResult.disease,
      confidence: localResult.confidence,
      top3: localResult.top3,
    });
    setSavedFor(selectedPatientId);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
    appearance: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '28px 36px', color: '#fff' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, margin: 0, color: '#ff4444' }}>AI Disease Predictor</h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 6 }}>Standalone prediction tool — select symptoms, run model, optionally save result to a patient record</p>
        </div>

        {/* Patient selector */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>Patient (optional — required to save result)</label>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} style={inputStyle}>
              <option value="">— Select patient —</option>
              {patients?.map(p => <option key={p.id} value={p.id}>{p.name} (age {p.age ?? '?'})</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: localResult ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Symptom selector */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Brain size={18} color="#ff4444" />
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#ff4444', margin: 0 }}>Select Symptoms</h3>
            </div>
            <SymptomSelector selected={selectedSymptoms} onChange={setSelectedSymptoms} accent="#ff4444" />
            <button
              onClick={handlePredict}
              disabled={predicting || selectedSymptoms.length === 0}
              style={{
                width: '100%', marginTop: 16, padding: '13px', borderRadius: 10, border: 'none',
                background: selectedSymptoms.length === 0 || predicting ? '#222' : 'linear-gradient(135deg,#ff4444,#cc2222)',
                color: selectedSymptoms.length === 0 || predicting ? '#555' : '#fff',
                cursor: selectedSymptoms.length === 0 || predicting ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: selectedSymptoms.length > 0 && !predicting ? '0 0 32px rgba(255,68,68,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Activity size={16} />
              {predicting ? 'Running AI…' : selectedSymptoms.length === 0 ? 'Select symptoms first' : `Run Prediction (${selectedSymptoms.length} symptoms)`}
            </button>
          </div>

          {/* Result */}
          {localResult && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#ff4444', margin: '0 0 16px' }}>Prediction Result</h3>
              <PredictionResult result={localResult} accent="#ff4444" />
              {savedFor !== selectedPatientId ? (
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedPatientId}
                  style={{
                    width: '100%', marginTop: 16, padding: '11px', borderRadius: 10, border: 'none',
                    background: !selectedPatientId ? '#222' : saving ? '#333' : '#00cc66',
                    color: !selectedPatientId ? '#555' : '#000', cursor: !selectedPatientId ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {saving ? 'Saving…' : !selectedPatientId ? 'Select a patient above to save' : '✓ Save to Patient Record'}
                </button>
              ) : (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,204,102,0.1)', border: '1px solid rgba(0,204,102,0.2)', borderRadius: 10, fontSize: 13, color: '#00cc66', textAlign: 'center' }}>
                  ✓ Saved to patient record
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
