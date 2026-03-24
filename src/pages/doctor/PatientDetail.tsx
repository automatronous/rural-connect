import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { usePatient } from '../../hooks/usePatients';
import { useMedicalRecords, useUploadRecord } from '../../hooks/useMedicalRecords';
import { useVisits, useAddVisit } from '../../hooks/useVisits';
import { usePrediction, usePatientPredictions } from '../../hooks/usePrediction';
import { useAuth } from '../../context/AuthContext';
import SymptomSelector from '../../components/SymptomSelector';
import PredictionResult from '../../components/PredictionResult';
import FileUploader from '../../components/FileUploader';
import Modal from '../../components/Modal';
import { TableSkeleton, CardSkeleton, Skeleton } from '../../components/SkeletonLoader';
import { ArrowLeft, FileText, Calendar, Brain, History, Plus, Download, User, AlertCircle, Droplets, Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { PredictResponse } from '../../types/api.types';

const RECORD_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'Vaccination', 'Other'];

type Tab = 'records' | 'visits' | 'predict' | 'history';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: doctorProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('records');

  // Patient data
  const { data: patient, isLoading: pLoading } = usePatient(id);
  const { data: records, isLoading: rLoading } = useMedicalRecords(id);
  const { data: visits, isLoading: vLoading } = useVisits(id);
  const { data: predHistory, isLoading: phLoading } = usePatientPredictions(id);
  const { runPrediction, predicting, predictionResult, savePrediction, saving } = usePrediction();
  const { mutateAsync: uploadRecord, isPending: uploading } = useUploadRecord();
  const { mutateAsync: addVisit, isPending: addingVisit } = useAddVisit();

  // Prediction state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [localPredResult, setLocalPredResult] = useState<PredictResponse | null>(null);
  const [predSaved, setPredSaved] = useState(false);

  // Record upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('Blood Test');
  const [uploadNotes, setUploadNotes] = useState('');

  // Visit modal state
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitNotes, setVisitNotes] = useState('');
  const [visitDiagnosis, setVisitDiagnosis] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
  };

  const handlePredict = async () => {
    if (!selectedSymptoms.length || !id || !doctorProfile) return;
    const result = await runPrediction({ symptoms: selectedSymptoms, patient_id: id, doctor_id: doctorProfile.id });
    if (result) { setLocalPredResult(result); setPredSaved(false); }
  };

  const handleSavePred = async () => {
    if (!localPredResult || !id || !doctorProfile) return;
    await savePrediction({
      patient_id: id,
      doctor_id: doctorProfile.id,
      symptoms_input: selectedSymptoms,
      predicted_disease: localPredResult.disease,
      confidence: localPredResult.confidence,
      top3: localPredResult.top3,
    });
    setPredSaved(true);
  };

  const handleUpload = async () => {
    if (!uploadFile || !id) return;
    await uploadRecord({ file: uploadFile, patientId: id, recordType: uploadType, notes: uploadNotes });
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadNotes('');
  };

  const handleAddVisit = async () => {
    if (!id) return;
    await addVisit({ patientId: id, visitDate, notes: visitNotes, diagnosisNotes: visitDiagnosis });
    setShowVisitModal(false);
    setVisitNotes('');
    setVisitDiagnosis('');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'records', label: 'Medical Records', icon: <FileText size={14} /> },
    { id: 'visits', label: 'Visit History', icon: <Calendar size={14} /> },
    { id: 'predict', label: 'AI Prediction', icon: <Brain size={14} /> },
    { id: 'history', label: 'Pred. History', icon: <History size={14} /> },
  ];

  if (pLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px' }}>
        <Skeleton height={28} width={200} style={{ marginBottom: 24 }} />
        <CardSkeleton />
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '28px 32px', color: '#fff' }}>
        {/* Back */}
        <button onClick={() => navigate('/doctor/patients')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 20, padding: 0 }}>
          <ArrowLeft size={14} /> All Patients
        </button>

        {/* Patient profile card */}
        {patient && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 16, padding: 24, marginBottom: 24, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(68,136,255,0.3),rgba(68,136,255,0.1))', border: '2px solid rgba(68,136,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#4488ff' }}>
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{patient.name}</h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
                {[
                  { icon: <User size={11} />, val: patient.email },
                  { icon: <Calendar size={11} />, val: patient.age ? `${patient.age} years` : 'Age unknown' },
                  { icon: <Droplets size={11} />, val: patient.blood_group ?? 'BG unknown', color: '#ff4444' },
                  { icon: <AlertCircle size={11} />, val: patient.allergies ?? 'No allergies', color: patient.allergies ? '#ffaa00' : undefined },
                ].map(({ icon, val, color }, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, color: color ?? '#888' }}>
                    {icon} {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 18px', border: 'none', borderBottom: activeTab === t.id ? '2px solid #ff4444' : '2px solid transparent',
              background: 'transparent', color: activeTab === t.id ? '#ff4444' : '#666',
              cursor: 'pointer', fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Medical Records */}
        {activeTab === 'records' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => setShowUploadModal(true)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ff4444, #cc2222)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Upload Record
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>
                <span>File</span><span>Type</span><span>Date</span><span>Uploaded by</span><span></span>
              </div>
              {rLoading ? <TableSkeleton rows={4} /> : !records?.length
                ? <div style={{ padding: 32, textAlign: 'center', color: '#555', fontSize: 13 }}>No records for this patient</div>
                : records.map((r, i) => (
                  <div key={r.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '14px 16px', alignItems: 'center',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                    borderBottom: i < records.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={14} color="#4488ff" />
                      <span style={{ fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.file_name}</span>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(68,136,255,0.1)', borderRadius: 6, color: '#4488ff', display: 'inline-block' }}>{r.record_type}</span>
                    <span style={{ fontSize: 12, color: '#aaa' }}>{format(new Date(r.upload_date), 'MMM d, yyyy')}</span>
                    <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} />{r.uploader?.name ?? '—'}</span>
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.2)', color: '#4488ff', textDecoration: 'none', fontSize: 11 }}>
                      <Download size={11} /> Open
                    </a>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Tab 2: Visit History */}
        {activeTab === 'visits' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => setShowVisitModal(true)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ff4444, #cc2222)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Add Visit Note
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {vLoading ? <>{[0,1,2].map(i => <CardSkeleton key={i} />)}</> : !visits?.length
                ? <div style={{ padding: 32, textAlign: 'center', color: '#555', fontSize: 13, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>No visits recorded yet</div>
                : visits.map(v => (
                  <div key={v.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Dr. {v.doctor?.name ?? 'Unknown'}</div>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{format(new Date(v.visit_date), 'MMMM d, yyyy')}</div>
                      </div>
                      <span style={{ padding: '3px 10px', background: 'rgba(0,204,102,0.1)', border: '1px solid rgba(0,204,102,0.2)', borderRadius: 20, fontSize: 11, color: '#00cc66' }}>Visit</span>
                    </div>
                    {v.notes && <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8, lineHeight: 1.6 }}><strong style={{ color: '#888', fontSize: 11 }}>Notes: </strong>{v.notes}</div>}
                    {v.diagnosis_notes && <div style={{ fontSize: 13, color: '#ff8888', lineHeight: 1.6 }}><strong style={{ color: '#888', fontSize: 11 }}>Diagnosis: </strong>{v.diagnosis_notes}</div>}
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Tab 3: ML Prediction */}
        {activeTab === 'predict' && (
          <div style={{ display: 'grid', gridTemplateColumns: localPredResult ? '1fr 1fr' : '1fr', gap: 24 }}>
            {/* Left: Symptom selector */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: 14, padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#ff4444', margin: '0 0 4px' }}>AI Disease Predictor</h3>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Select symptoms observed in patient</p>
              </div>
              <SymptomSelector selected={selectedSymptoms} onChange={setSelectedSymptoms} accent="#ff4444" />
              <button
                onClick={handlePredict}
                disabled={predicting || selectedSymptoms.length === 0}
                style={{
                  width: '100%', marginTop: 16, padding: '13px', borderRadius: 10, border: 'none',
                  background: selectedSymptoms.length === 0 || predicting ? '#333' : 'linear-gradient(135deg, #ff4444, #cc2222)',
                  color: '#fff', cursor: selectedSymptoms.length === 0 || predicting ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 700, boxShadow: selectedSymptoms.length > 0 && !predicting ? '0 0 32px rgba(255,68,68,0.3)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Activity size={16} />
                {predicting ? 'Running AI Model…' : selectedSymptoms.length === 0 ? 'Select symptoms to predict' : `Run Prediction (${selectedSymptoms.length} symptoms)`}
              </button>
            </div>

            {/* Right: Result */}
            {localPredResult && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#ff4444', margin: '0 0 16px' }}>Prediction Result</h3>
                <PredictionResult result={localPredResult} accent="#ff4444" />
                {!predSaved ? (
                  <button
                    onClick={handleSavePred}
                    disabled={saving}
                    style={{ width: '100%', marginTop: 16, padding: '11px', borderRadius: 10, border: 'none', background: saving ? '#333' : '#00cc66', color: '#000', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}
                  >
                    {saving ? 'Saving…' : '✓ Save to Patient Record'}
                  </button>
                ) : (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,204,102,0.1)', border: '1px solid rgba(0,204,102,0.2)', borderRadius: 10, fontSize: 13, color: '#00cc66', textAlign: 'center' }}>
                    ✓ Saved to patient record
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Prediction History */}
        {activeTab === 'history' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>
                <span>Disease</span><span>Confidence</span><span>Date</span><span>Doctor</span>
              </div>
              {phLoading ? <TableSkeleton rows={5} /> : !predHistory?.length
                ? <div style={{ padding: 32, textAlign: 'center', color: '#555', fontSize: 13 }}>No predictions recorded for this patient</div>
                : predHistory.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', padding: '14px 16px', alignItems: 'center',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                    borderBottom: i < predHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{ fontSize: 13, color: '#ff4444', fontWeight: 600 }}>{p.predicted_disease}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Math.round(p.confidence * 100)}%</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 4 }}>
                        <div style={{ width: `${Math.round(p.confidence * 100)}%`, height: '100%', background: '#ff4444', borderRadius: 2 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>{format(new Date(p.created_at), 'MMM d, yyyy')}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Dr. {(p as unknown as Record<string,{name:string}>).doctor?.name ?? '—'}</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Upload Record Modal */}
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Record for Patient">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Record Type</label>
              <select value={uploadType} onChange={e => setUploadType(e.target.value)} style={inputStyle}>
                {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Notes</label>
              <input value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="Optional notes" style={inputStyle} />
            </div>
            <FileUploader onFileSelect={setUploadFile} />
            <button onClick={handleUpload} disabled={!uploadFile || uploading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: !uploadFile ? '#333' : 'linear-gradient(135deg,#ff4444,#cc2222)', color: '#fff', cursor: !uploadFile ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </Modal>

        {/* Add Visit Modal */}
        <Modal isOpen={showVisitModal} onClose={() => setShowVisitModal(false)} title="Add Visit Note">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Visit Date</label>
              <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Visit Notes</label>
              <textarea value={visitNotes} onChange={e => setVisitNotes(e.target.value)} rows={3} placeholder="Clinical observations…" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Diagnosis Notes</label>
              <textarea value={visitDiagnosis} onChange={e => setVisitDiagnosis(e.target.value)} rows={3} placeholder="Provisional / confirmed diagnosis…" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <button onClick={handleAddVisit} disabled={addingVisit} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ff4444,#cc2222)', color: '#fff', cursor: addingVisit ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
              {addingVisit ? 'Saving…' : 'Save Visit Note'}
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
