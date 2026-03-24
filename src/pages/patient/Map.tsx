import React from 'react';
import Sidebar from '../../components/Sidebar';
import HeatmapView from '../../components/HeatmapView';
import { useDiseaseReports } from '../../hooks/useDiseaseReports';
import { Skeleton } from '../../components/SkeletonLoader';

export default function PatientMap() {
  const { data: reports = [], isLoading } = useDiseaseReports();
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#05070a' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 28px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700, color: '#4488ff', margin: '0 0 4px' }}>Disease Distribution Map</h1>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 16px' }}>View-only — Real-time disease surveillance across India</p>
        </div>
        {isLoading
          ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skeleton width={300} height={20} /></div>
          : <div style={{ flex: 1 }}><HeatmapView reports={reports} canAddReport={false} /></div>
        }
      </div>
    </div>
  );
}
