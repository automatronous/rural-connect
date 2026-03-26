import type { PredictionApiResponse } from '../lib/types';
import { formatLabel, normalizeConfidence } from '../lib/utils';

interface PredictionResultProps {
  result: PredictionApiResponse;
  onSave: () => Promise<void>;
  saving: boolean;
  saved?: boolean;
}

export default function PredictionResult({
  result,
  onSave,
  saving,
  saved = false,
}: PredictionResultProps) {
  const confidence = normalizeConfidence(result.confidence);
  const top3 = result.top3.map((entry) => ({
    ...entry,
    confidence: normalizeConfidence(entry.confidence),
  }));

  return (
    <div className="panel-card space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-red-300">Predicted Disease</p>
          <h3
            className="heading-orbitron mt-3 text-4xl font-bold text-red-400"
            style={{ textShadow: '0 0 24px rgba(255,68,68,0.55)' }}
          >
            {result.disease}
          </h3>
        </div>

        <div className="min-w-[220px]">
          <div className="mb-2 flex items-center justify-between text-sm text-white/60">
            <span>Confidence</span>
            <span>{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(100, confidence))}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="heading-orbitron text-lg font-semibold text-white">Top 3 Differentials</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {top3.map((entry) => (
            <div key={entry.disease} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-semibold text-white">{entry.disease}</p>
              <p className="mt-2 text-sm text-white/60">{entry.confidence.toFixed(1)}% match</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="font-semibold text-white">Symptoms Used</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.symptoms_used.length ? (
              result.symptoms_used.map((symptom) => (
                <span key={symptom} className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-200">
                  {formatLabel(symptom)}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/50">None</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="font-semibold text-white">Symptoms Ignored</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.symptoms_ignored.length ? (
              result.symptoms_ignored.map((symptom) => (
                <span key={symptom} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  {formatLabel(symptom)}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/50">None</span>
            )}
          </div>
        </div>
      </div>

      <button type="button" onClick={onSave} className="primary-button" disabled={saving || saved}>
        {saved ? 'Saved to Patient Record' : saving ? 'Saving...' : 'Save to Patient Record'}
      </button>
    </div>
  );
}
