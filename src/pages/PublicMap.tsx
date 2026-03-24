import React from 'react';
import HeatmapView from '../components/HeatmapView';
import { useDiseaseReports } from '../hooks/useDiseaseReports';
import { HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PublicMap() {
  const { data: reports = [], isLoading } = useDiseaseReports();
  const navigate = useNavigate();
  return (
    <div style={{ height: '100vh', background: '#05070a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 1000,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HeartPulse size={18} color="#ff4444" />
          <span style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#fff' }}>RuralConnect</span>
          <span style={{ fontSize: 12, color: '#666' }}>· Public Disease Map</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: 12 }}>Login</button>
          <button onClick={() => navigate('/register')} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#ff4444', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Register</button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {!isLoading && <HeatmapView reports={reports} canAddReport={false} />}
      </div>
    </div>
  );
}
