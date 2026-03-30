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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-primary">Predicted Disease</p>
          <h3 className="mt-3 font-display text-4xl font-bold text-cs-primary">
            {result.disease}
          </h3>
        </div>

        <div className="min-w-[220px]">
          <div className="mb-2 flex items-center justify-between text-sm text-cs-ink-secondary">
            <span>Confidence</span>
            <span className="font-semibold text-cs-ink">{confidence.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, confidence))}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-display text-lg font-bold text-cs-ink">Top 3 Differentials</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {top3.map((entry) => (
            <div key={entry.disease} className="rounded-2xl bg-cs-surface-low p-4">
              <p className="font-semibold text-cs-ink">{entry.disease}</p>
              <p className="mt-2 text-sm text-cs-ink-secondary">{entry.confidence.toFixed(1)}% match</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-cs-surface-low p-4">
          <h4 className="font-semibold text-cs-ink">Symptoms Used</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.symptoms_used.length ? (
              result.symptoms_used.map((symptom) => (
                <span key={symptom} className="rounded-full bg-cs-primary-light px-3 py-1 text-xs font-medium text-cs-primary">
                  {formatLabel(symptom)}
                </span>
              ))
            ) : (
              <span className="text-sm text-cs-ink-secondary">None</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-cs-surface-low p-4">
          <h4 className="font-semibold text-cs-ink">Symptoms Ignored</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.symptoms_ignored.length ? (
              result.symptoms_ignored.map((symptom) => (
                <span key={symptom} className="rounded-full bg-cs-surface-high px-3 py-1 text-xs text-cs-ink-secondary">
                  {formatLabel(symptom)}
                </span>
              ))
            ) : (
              <span className="text-sm text-cs-ink-secondary">None</span>
            )}
          </div>
        </div>
      </div>

      <button type="button" onClick={onSave} className="primary-button" disabled={saving || saved}>
        {saved ? '✓ Saved to Patient Record' : saving ? 'Saving...' : 'Save to Patient Record'}
      </button>
    </div>
  );
}
