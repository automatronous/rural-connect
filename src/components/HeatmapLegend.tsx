import React from 'react';
import type { DiseaseReport } from '../types/database.types';

export const DISEASE_COLORS: Record<string, string> = {
  'Dengue': '#ff4444',
  'Malaria': '#ff8800',
  'Tuberculosis': '#ffcc00',
  'Typhoid': '#00ff88',
  'Pneumonia': '#00ccff',
  'Hepatitis B': '#aa44ff',
  'Diabetes': '#ff44aa',
  'Common Cold': '#44ffcc',
  'AIDS': '#ff6655',
  'Acne': '#ffaa66',
  'Alcoholic hepatitis': '#cc8844',
  'Allergy': '#88ff88',
  'Arthritis': '#6688ff',
  'Bronchial Asthma': '#66ffff',
  'Cervical spondylosis': '#ff88cc',
  'Chicken pox': '#ffff66',
  'Chronic cholestasis': '#aaaa44',
  'Drug Reaction': '#ff6688',
  'Fungal infection': '#88cc44',
  'GERD': '#44aacc',
  'Gastroenteritis': '#cc6688',
  'Heart attack': '#ff2244',
  'Hepatitis A': '#aa8844',
  'Hepatitis C': '#aa4488',
  'Hepatitis D': '#8844aa',
  'Hepatitis E': '#4488aa',
  'Hypertension': '#ff4466',
  'Hyperthyroidism': '#44ff88',
  'Hypoglycemia': '#aaffaa',
  'Hypothyroidism': '#aaaaff',
  'Impetigo': '#ffaaaa',
  'Jaundice': '#ffdd44',
  'Migraine': '#cc44ff',
  'Osteoarthristis': '#44ccff',
  'Paralysis (brain hemorrhage)': '#ff6600',
  'Peptic ulcer disease': '#6600ff',
  'Psoriasis': '#ff0066',
  'Urinary tract infection': '#00ff66',
  'Varicose veins': '#6666ff',
  '(vertigo) Paroymsal Positional Vertigo': '#ff66ff',
  'Dimorphic hemmorhoids(piles)': '#aa6644',
};

function getColor(disease: string): string {
  return DISEASE_COLORS[disease] ?? '#aaaaaa';
}

interface HeatmapLegendProps {
  reports: DiseaseReport[];
  enabledDiseases: Set<string>;
  onToggle: (disease: string) => void;
}

export default function HeatmapLegend({ reports, enabledDiseases, onToggle }: HeatmapLegendProps) {
  const diseaseStats = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reports) {
      map[r.disease_name] = (map[r.disease_name] ?? 0) + r.case_count;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '14px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      width: 220,
    }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#fff', letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>
        Disease Layers
      </div>
      {diseaseStats.map(([disease, total]) => (
        <label
          key={disease}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            cursor: 'pointer', opacity: enabledDiseases.has(disease) ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}
        >
          <input
            type="checkbox"
            checked={enabledDiseases.has(disease)}
            onChange={() => onToggle(disease)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            background: enabledDiseases.has(disease) ? getColor(disease) : 'transparent',
            border: `2px solid ${getColor(disease)}`,
            transition: 'background 0.2s',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#ddd', lineHeight: 1.3 }}>{disease}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{total.toLocaleString()} cases</div>
          </div>
        </label>
      ))}

      {/* Color scale */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, color: '#666', marginBottom: 6 }}>Intensity Scale</div>
        <div style={{
          height: 8, borderRadius: 4,
          background: 'linear-gradient(90deg, #ffff00, #ff8800, #ff0000)',
          marginBottom: 4,
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#555' }}>
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
      </div>
    </div>
  );
}

export { getColor };
