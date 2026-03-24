import React from 'react';
import type { PredictResponse } from '../types/api.types';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface PredictionResultProps {
  result: PredictResponse;
  accent?: string;
}

export default function PredictionResult({ result, accent = '#ff4444' }: PredictionResultProps) {
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Primary prediction */}
      <div style={{
        background: `linear-gradient(135deg, ${accent}15, ${accent}08)`,
        border: `1px solid ${accent}33`,
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          Predicted Disease
        </div>
        <div style={{ fontSize: 28, fontFamily: 'Orbitron', fontWeight: 700, color: accent, marginBottom: 16 }}>
          {result.disease}
        </div>

        {/* Confidence bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Activity size={12} /> Confidence
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: accent }}>{confidencePct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${confidencePct}%`, height: '100%',
              background: `linear-gradient(90deg, ${accent}99, ${accent})`,
              borderRadius: 100, transition: 'width 1s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Top 3 differential */}
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} />
          Differential Diagnoses
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.top3.map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.04)',
              border: idx === 0 ? `1px solid ${accent}33` : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: idx === 0 ? `${accent}22` : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: idx === 0 ? accent : '#666',
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: 13, color: idx === 0 ? '#fff' : '#aaa' }}>{item.disease}</span>
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: idx === 0 ? accent : '#666',
              }}>
                {typeof item.confidence === 'number' ? item.confidence.toFixed(1) : item.confidence}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Symptoms used */}
      {result.symptoms_used?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} />
            Symptoms Used ({result.symptoms_used.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.symptoms_used.map((s) => (
              <span key={s} style={{
                padding: '4px 10px', borderRadius: 20,
                background: `${accent}15`, border: `1px solid ${accent}33`,
                fontSize: 11, color: accent,
              }}>
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.symptoms_ignored?.length > 0 && (
        <div style={{ fontSize: 11, color: '#666' }}>
          Symptoms ignored (not in model): {result.symptoms_ignored.join(', ')}
        </div>
      )}
    </div>
  );
}
