import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  CircleDot,
  Flame,
  HeartPulse,
  Info,
  Pill,
  Search,
  Shield,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { predictDisease } from '../../lib/api';
import { fetchPatients } from '../../lib/data';
import type { PredictionApiResponse, Profile } from '../../lib/types';

const SYMPTOM_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  Fever: { icon: <Thermometer className="h-6 w-6" />, color: '#ba1a1a' },
  Cough: { icon: <Wind className="h-6 w-6" />, color: '#003178' },
  'Muscle Pain': { icon: <Zap className="h-6 w-6" />, color: '#6b7a3d' },
  Headache: { icon: <Brain className="h-6 w-6" />, color: '#003178' },
  Rash: { icon: <Flame className="h-6 w-6" />, color: '#ba1a1a' },
  Fatigue: { icon: <CircleDot className="h-6 w-6" />, color: '#003178' },
  Dizziness: { icon: <CircleDot className="h-6 w-6" />, color: '#1b6d24' },
  Nausea: { icon: <Pill className="h-6 w-6" />, color: '#1b6d24' },
};

const QUICK_SYMPTOMS = [
  { label: 'Fever', key: 'highfever' },
  { label: 'Cough', key: 'cough' },
  { label: 'Muscle Pain', key: 'musclepain' },
  { label: 'Headache', key: 'headache' },
  { label: 'Rash', key: 'skinrash' },
  { label: 'Fatigue', key: 'fatigue' },
  { label: 'Dizziness', key: 'dizziness' },
  { label: 'Nausea', key: 'nausea' },
];

export default function DoctorPredict() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Profile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      try {
        const nextPatients = await fetchPatients();
        if (!active) return;
        setPatients(nextPatients);
        setSelectedPatientId((current) => current || nextPatients[0]?.id || '');
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load patients.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPatients();
    return () => { active = false; };
  }, []);

  function toggleSymptom(key: string) {
    setSelectedSymptoms((current) =>
      current.includes(key) ? current.filter((s) => s !== key) : [...current, key],
    );
  }

  const filteredSymptoms = useMemo(() => {
    if (!search.trim()) return QUICK_SYMPTOMS;
    return QUICK_SYMPTOMS.filter((s) =>
      s.label.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [search]);

  async function handleContinue() {
    if (!user || !selectedPatientId || !selectedSymptoms.length) return;

    setPredicting(true);
    setError(null);

    try {
      const result: PredictionApiResponse = await predictDisease(selectedSymptoms, selectedPatientId, user.id);
      navigate('/doctor/results', {
        state: {
          result,
          selectedSymptoms,
          selectedPatientId,
          patientName: patients.find((p) => p.id === selectedPatientId)?.name ?? 'Patient',
        },
      });
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : 'Prediction failed.');
      setPredicting(false);
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading prediction tool..." />;
  }

  const totalSteps = 2;
  const currentStep = 1;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-primary">
              Step {currentStep} of {totalSteps}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-cs-ink">Symptom Screening</h1>
          </div>
          <span className="text-sm text-cs-ink-secondary">{progress}% Complete</span>
        </div>
        <div className="progress-bar mt-3">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Patient Selector */}
      <select
        value={selectedPatientId}
        onChange={(e) => {
          setSelectedPatientId(e.target.value);
          setSelectedSymptoms([]);
        }}
        className="field-select max-w-md"
      >
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} ({patient.email})
          </option>
        ))}
      </select>

      {/* Main Question */}
      <div>
        <h2 className="font-display text-3xl font-bold leading-tight text-cs-ink md:text-4xl">
          What symptoms are you{' '}
          <span className="text-cs-primary">experiencing today?</span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-cs-ink-secondary">
          Select all that apply. This helps our AI prioritize your care needs before connecting with a provider.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cs-ink-secondary/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input pl-11"
          placeholder="Search for a specific symptom (e.g. sore throat)"
        />
      </div>

      {/* Symptom Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {filteredSymptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.key);
          const iconConfig = SYMPTOM_ICONS[symptom.label];

          return (
            <button
              key={symptom.key}
              type="button"
              onClick={() => toggleSymptom(symptom.key)}
              className={`flex flex-col items-center gap-3 rounded-2xl p-6 transition-all duration-200 ${
                isSelected
                  ? 'bg-cs-primary/5 ring-2 ring-cs-primary'
                  : 'bg-white shadow-cs hover:shadow-cs-lg'
              }`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: isSelected ? '#003178' : `${iconConfig?.color ?? '#003178'}15`,
                  color: isSelected ? 'white' : iconConfig?.color ?? '#003178',
                }}
              >
                {iconConfig?.icon ?? <HeartPulse className="h-6 w-6" />}
              </div>
              <span className="text-sm font-semibold text-cs-ink">{symptom.label}</span>
              {isSelected ? (
                <span className="rounded-full bg-cs-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? <div className="panel-card text-cs-error">{error}</div> : null}

      {/* Footer */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-cs-ink-secondary">
          <Info className="h-4 w-4 text-cs-tint" />
          <em>Your data is encrypted and only visible to authorized medical staff.</em>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={predicting || !selectedSymptoms.length || !selectedPatientId}
          className="primary-button flex items-center gap-2"
        >
          {predicting ? 'Analyzing...' : 'Continue to Details →'}
        </button>
      </div>

      {/* Emergency Banner */}
      <div className="glass-card flex items-center gap-4 bg-cs-surface-low/80">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-cs-surface-high">
          <Shield className="h-6 w-6 text-cs-ink-secondary" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-cs-ink">Need immediate assistance?</h3>
          <p className="mt-0.5 text-xs text-cs-ink-secondary">
            If you are experiencing severe chest pain, shortness of breath, or sudden weakness,
            please use the emergency call button immediately or dial 911.
          </p>
        </div>
      </div>
    </div>
  );
}
