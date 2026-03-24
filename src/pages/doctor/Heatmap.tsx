import React from 'react';
import Sidebar from '../../components/Sidebar';
import HeatmapView from '../../components/HeatmapView';
import { useDiseaseReports } from '../../hooks/useDiseaseReports';

export default function DoctorHeatmap() {
  const { data: reports = [], isLoading } = useDiseaseReports();
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#05070a' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 28px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#05070a', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700, color: '#ff4444', margin: '0 0 4px' }}>Disease Heatmap</h1>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 16px' }}>Click the + button to add a disease report. Updates live across all connected users.</p>
        </div>
        <div style={{ flex: 1 }}>
          {!isLoading && <HeatmapView reports={reports} canAddReport={true} />}
        </div>
      </div>
    </div>
  );
}
