import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { useVisits } from '../../hooks/useVisits';
import { CardSkeleton, StatsSkeleton } from '../../components/SkeletonLoader';
import { FileText, Calendar, Upload, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: records, isLoading: recLoading } = useMedicalRecords(profile?.id);
  const { data: visits, isLoading: visLoading } = useVisits(profile?.id);

  const latestVisit = visits?.[0];
  const recentRecords = records?.slice(0, 3) ?? [];
  const recentVisits = visits?.slice(0, 3) ?? [];

  const statCard = (icon: React.ReactNode, label: string, value: string | number, accent: string) => (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}22`,
      borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', color: '#fff' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Welcome back,</div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>
            {profile?.name || 'Patient'} <span style={{ color: '#4488ff' }}>👋</span>
          </h1>
          {latestVisit && (
            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 20, background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.25)', fontSize: 13, color: '#4488ff' }}>
              <Calendar size={14} />
              Latest checkup: {format(new Date(latestVisit.visit_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>

        {/* Stats */}
        {recLoading || visLoading
          ? <StatsSkeleton />
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
              {statCard(<FileText size={18} color="#4488ff" />, 'Total Records', records?.length ?? 0, '#4488ff')}
              {statCard(<Calendar size={18} color="#00cc66" />, 'Total Visits', visits?.length ?? 0, '#00cc66')}
              {statCard(<Activity size={18} color="#ffaa00" />, 'Blood Group', profile?.blood_group ?? '—', '#ffaa00')}
              {statCard(<FileText size={18} color="#aa44ff" />, 'Current Age', profile?.age ?? '—', '#aa44ff')}
            </div>
        }

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Records */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#fff', margin: 0 }}>Recent Records</h2>
              <button onClick={() => navigate('/patient/records')} style={{ background: 'none', border: 'none', color: '#4488ff', fontSize: 12, cursor: 'pointer' }}>View all →</button>
            </div>
            {recLoading ? <>{[0,1,2].map(i => <CardSkeleton key={i} />)}</> : recentRecords.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 13, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>No records uploaded yet</div>
              : recentRecords.map(r => (
                <div key={r.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(68,136,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} color="#4488ff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.file_name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{r.record_type} · {format(new Date(r.upload_date), 'MMM d, yyyy')}</div>
                  </div>
                </div>
              ))
            }
            <button
              onClick={() => navigate('/patient/records')}
              style={{
                width: '100%', marginTop: 8, padding: '11px', borderRadius: 10,
                border: '1px dashed rgba(68,136,255,0.3)', background: 'transparent',
                color: '#4488ff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Upload size={14} /> Upload New Record
            </button>
          </div>

          {/* Recent Visits */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#fff', margin: 0 }}>Recent Visits</h2>
            </div>
            {visLoading ? <>{[0,1,2].map(i => <CardSkeleton key={i} />)}</> : recentVisits.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 13, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>No visits recorded yet</div>
              : recentVisits.map(v => (
                <div key={v.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Dr. {v.doctor?.name ?? 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{format(new Date(v.visit_date), 'MMM d, yyyy')}</div>
                  </div>
                  {v.notes && <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{v.notes}</div>}
                </div>
              ))
            }
          </div>
        </div>
      </main>
    </div>
  );
}
