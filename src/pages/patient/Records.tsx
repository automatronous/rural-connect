import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import FileUploader from '../../components/FileUploader';
import { useMedicalRecords, useUploadRecord } from '../../hooks/useMedicalRecords';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { FileText, Download, User, ChevronDown, Upload } from 'lucide-react';
import { format } from 'date-fns';

const RECORD_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'Vaccination', 'Other'];

export default function PatientRecords() {
  const { profile } = useAuth();
  const { data: records, isLoading } = useMedicalRecords(profile?.id);
  const { mutateAsync: uploadRecord, isPending: uploading } = useUploadRecord();

  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState('Blood Test');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleUpload = async () => {
    if (!file || !profile) return;
    await uploadRecord({ file, patientId: profile.id, recordType, notes });
    setFile(null);
    setNotes('');
    setShowForm(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, margin: 0, color: '#fff' }}>My Medical Records</h1>
            <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{records?.length ?? 0} documents on file</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              padding: '11px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #4488ff, #2266dd)', color: '#fff',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 24px rgba(68,136,255,0.25)',
            }}
          >
            <Upload size={15} /> Upload Record
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div style={{
            background: 'rgba(68,136,255,0.06)', border: '1px solid rgba(68,136,255,0.2)',
            borderRadius: 14, padding: 24, marginBottom: 24,
          }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#4488ff', margin: '0 0 18px' }}>Upload New Record</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Record Type</label>
                <div style={{ position: 'relative' }}>
                  <select value={recordType} onChange={e => setRecordType(e.target.value)} style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}>
                    {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes…" style={inputStyle} />
              </div>
            </div>
            <FileUploader onFileSelect={setFile} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleUpload} disabled={!file || uploading} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: !file ? '#333' : 'linear-gradient(135deg, #4488ff, #2266dd)',
                color: '#fff', cursor: !file ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
              }}>
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Records table */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 1.2fr 1fr 80px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
            <span>File</span><span>Type</span><span>Date</span><span>Uploaded by</span><span>Notes</span><span></span>
          </div>

          {isLoading ? <TableSkeleton rows={5} /> : records?.length === 0
            ? <div style={{ padding: 48, textAlign: 'center', color: '#555', fontSize: 14 }}>No records yet. Upload your first medical record above.</div>
            : records?.map((r, i) => (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 1.2fr 1fr 80px',
                padding: '14px 16px', alignItems: 'center',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(68,136,255,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} color="#4488ff" />
                  <span style={{ fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.file_name}</span>
                </div>
                <span style={{ fontSize: 12, color: '#888', padding: '3px 8px', background: 'rgba(68,136,255,0.1)', borderRadius: 6, display: 'inline-block' }}>{r.record_type}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>{format(new Date(r.upload_date), 'MMM d, yyyy')}</span>
                <span style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={11} /> {r.uploader?.name ?? 'You'}
                </span>
                <span style={{ fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes ?? '—'}</span>
                <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.25)', color: '#4488ff', textDecoration: 'none', fontSize: 11 }}>
                  <Download size={12} /> View
                </a>
              </div>
            ))
          }
        </div>
      </main>
    </div>
  );
}
