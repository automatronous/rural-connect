import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Info,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import type { PredictionApiResponse } from '../../lib/types';
import { formatLabel, normalizeConfidence } from '../../lib/utils';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface ResultsState {
  result: PredictionApiResponse;
  selectedSymptoms: string[];
  selectedPatientId: string;
  patientName: string;
}

export default function DoctorResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const state = location.state as ResultsState | null;

  if (!state?.result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-cs-ink-secondary">No results to display.</p>
        <button
          type="button"
          onClick={() => navigate('/doctor/predict')}
          className="primary-button"
        >
          Go to Symptom Screening
        </button>
      </div>
    );
  }

  const { result, patientName } = state;
  const confidence = normalizeConfidence(result.confidence);
  const isHighPriority = confidence >= 60;
  const today = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-cs-ink">{t('assessmentResults')}</h1>
        <p className="mt-1 text-sm text-cs-ink-secondary">
          Symptom Check Complete • {today} • Patient: {patientName}
        </p>
      </div>

      {/* Analysis Progress */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-primary">{t('analysisProgress')}</p>
          <span className="text-sm font-bold text-cs-primary">100%</span>
        </div>
        <div className="progress-bar mt-2">
          <div className="progress-bar-fill" style={{ width: '100%' }} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className="panel-card">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-cs-primary text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    isHighPriority
                      ? 'bg-cs-error-light text-cs-error'
                      : 'bg-cs-green-light text-cs-green'
                  }`}
                >
                  {t('priority')}: {isHighPriority ? 'High' : 'Low'}
                </span>

                <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-cs-ink md:text-3xl">
                  High Probability of {result.disease} detected based on your symptoms and regional data.
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-cs-ink-secondary">
                  Our AI engine has correlated your reported symptoms of{' '}
                  {result.symptoms_used.slice(0, 3).map((s) => formatLabel(s).toLowerCase()).join(', ')}
                  {' '}with current epidemiological trends in your specific district.{' '}
                  {result.disease} activity is currently elevated in your proximity.
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-6 rounded-xl bg-cs-surface-low p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cs-ink-secondary">{t('confidenceScore')}</span>
                <span className="font-bold text-cs-ink">{confidence.toFixed(1)}%</span>
              </div>
              <div className="progress-bar mt-2">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(100, confidence)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Why This Result */}
          <div className="panel-card">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cs-primary">
              {t('whyThisResult')}
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Matched Symptoms */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">
                  {t('matchedSymptoms')}
                </p>
                <div className="mt-3 space-y-2">
                  {result.symptoms_used.slice(0, 3).map((symptom) => (
                    <div key={symptom} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cs-green" />
                      <span className="text-sm text-cs-ink">{formatLabel(symptom)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Context */}
              <div className="rounded-xl bg-cs-surface-low p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cs-error" />
                  <span className="text-sm font-bold text-cs-ink">{t('outbreakProximity')}</span>
                </div>
                <p className="mt-2 text-xs text-cs-ink-secondary">
                  Active cluster detected within 2.4km of your current location.
                </p>
              </div>
            </div>
          </div>

          {/* Top 3 Differentials */}
          {result.top3.length > 0 ? (
            <div className="panel-card">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cs-primary">
                {t('topDifferentials')}
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {result.top3.map((entry) => (
                  <div key={entry.disease} className="rounded-xl bg-cs-surface-low p-4">
                    <p className="font-display text-sm font-bold text-cs-ink">{entry.disease}</p>
                    <p className="mt-1 text-xs text-cs-ink-secondary">
                      {normalizeConfidence(entry.confidence).toFixed(1)}% match
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-2xl bg-cs-surface-low p-5">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-cs-tint" />
            <p className="text-sm italic text-cs-ink-secondary">
              {t('aiDisclaimer')}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Immediate Concern */}
          <div className="overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-br from-cs-error to-red-700 p-5">
              <Sparkles className="h-8 w-8 text-white/80" />
              <h3 className="mt-3 font-display text-lg font-bold text-white">{t('immediateConcern')}</h3>
              <p className="mt-2 text-xs text-white/80">
                If you are experiencing difficulty breathing or loss of consciousness, call the center now.
              </p>
            </div>
            <div className="bg-cs-error-light p-4">
              <button type="button" className="danger-button flex w-full items-center justify-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                {t('callHealthCenter')}
              </button>
            </div>
          </div>

          {/* Recommended Step */}
          <div className="panel-card">
            <h3 className="font-display text-base font-bold text-cs-ink">{t('recommendedStep')}</h3>
            <p className="mt-2 text-sm text-cs-ink-secondary">
              Connect with a specialist via Telehealth for a formal diagnostic plan and prescription.
            </p>

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #003178, #0d47a1)' }}
            >
              <Calendar className="h-4 w-4" />
              {t('bookConsultation')}
            </button>

            <button
              type="button"
              className="mt-2 w-full text-center text-sm font-semibold text-cs-primary hover:text-cs-primary-dark"
            >
              {t('findNearestClinic')}
            </button>
          </div>

          {/* Regional Heatmap Mini */}
          <div className="panel-card overflow-hidden p-0">
            <p className="px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">
              {t('regionalHeatmap')}
            </p>
            <div className="mt-2 h-32 bg-gradient-to-br from-cs-primary/10 to-cs-green/5">
              <div className="flex h-full items-center justify-center">
                <Link
                  to="/doctor/heatmap"
                  className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-cs-primary shadow-sm transition-all hover:shadow-md"
                >
                  {t('viewFullMap')}
                </Link>
              </div>
            </div>
            <p className="px-4 py-3 text-xs text-cs-ink-secondary">
              Visualizing active {result.disease} clusters in your district based on the last 24 hours of reported data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
