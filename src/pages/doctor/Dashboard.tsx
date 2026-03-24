import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { usePatients } from '../../hooks/usePatients';
import { useRecentPredictions } from '../../hooks/usePrediction';
import { useVisits } from '../../hooks/useVisits';
import { StatsSkeleton, TableSkeleton } from '../../components/SkeletonLoader';
import { Users, Brain, FileText, Calendar, ArrowRight, Map, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { data: patients, isLoading: pLoad } = usePatients();
  const { data: predictions, isLoading: predLoad } = useRecentPredictions();
  const { data: visits } = useVisits();

  const totalPatients = patients?.length ?? 0;
  const totalPredictions = predictions?.length ?? 0;

  const recentPatients = patients?.slice(0, 5) ?? [];
  const recentPreds = predictions?.slice(0, 5) ?? [];

  const statCard = (icon: React.ReactNode, label: string, value: string | number, accent: string, sub?: string) => (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}22`,
      borderRadius: 12, padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', color: '#fff' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Doctor Portal</div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 28, fontWeight: 700, margin: 0, color: '#fff' }}>
            Dashboard <span style={{ color: '#ff4444' }}>⚕️</span>
          </h1>
        </div>

        {/* Stats */}
        {pLoad || predLoad
          ? <StatsSkeleton />
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {statCard(<Users size={18} color="#ff4444" />, 'Total Patients', totalPatients, '#ff4444')}
              {statCard(<Brain size={18} color="#aa44ff" />, 'Predictions Run', totalPredictions, '#aa44ff', 'total')}
              {statCard(<FileText size={18} color="#00cc66" />, 'Total Visits', visits?.length ?? 0, '#00cc66')}
              {statCard(<Calendar size={18} color="#ffaa00" />, 'Recent Patients', recentPatients.length, '#ffaa00', 'last 5')}
            </div>
        }

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'New Prediction', icon: <Brain size={15} />, onClick: () => navigate('/doctor/predict'), accent: '#ff4444' },
            { label: 'View Heatmap', icon: <Map size={15} />, onClick: () => navigate('/doctor/heatmap'), accent: '#4488ff' },
            { label: 'All Patients', icon: <Users size={15} />, onClick: () => navigate('/doctor/patients'), accent: '#00cc66' },
          ].map(({ label, icon, onClick, accent }) => (
            <button key={label} onClick={onClick} style={{
              padding: '11px 20px', borderRadius: 10, border: `1px solid ${accent}33`,
              background: `${accent}10`, color: accent, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${accent}20`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${accent}10`; }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent predictions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#fff', margin: 0 }}>Recent Predictions</h2>
              <button onClick={() => navigate('/doctor/predict')} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={12} /> New <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              {predLoad ? <TableSkeleton rows={5} /> : recentPreds.length === 0
                ? <div style={{ padding: 28, textAlign: 'center', color: '#555', fontSize: 13 }}>No predictions yet</div>
                : recentPreds.map((p, i) => (
                  <div key={p.id} style={{
                    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                    borderBottom: i < recentPreds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{(p as unknown as Record<string,{name:string}>).patient?.name ?? 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: '#ff4444', marginTop: 2 }}>{p.predicted_disease}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ff8888' }}>{Math.round((p.confidence ?? 0) * 100)}%</div>
                      <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{format(new Date(p.created_at), 'MMM d')}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Recent patients */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#fff', margin: 0 }}>Recent Patients</h2>
              <button onClick={() => navigate('/doctor/patients')} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                All <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              {pLoad ? <TableSkeleton rows={5} /> : recentPatients.length === 0
                ? <div style={{ padding: 28, textAlign: 'center', color: '#555', fontSize: 13 }}>No patients yet</div>
                : recentPatients.map((p, i) => (
                  <button key={p.id} onClick={() => navigate(`/doctor/patients/${p.id}`)} style={{
                    width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                    border: 'none', borderBottom: i < recentPatients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,68,68,0.06)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#ff4444', flexShrink: 0 }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>age {p.age ?? '?'} · {p.blood_group ?? 'Unknown BG'}</div>
                    </div>
                    <ArrowRight size={14} color="#555" />
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
