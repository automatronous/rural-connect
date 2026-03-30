import { useEffect, useState } from 'react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { PredictionHistoryTable } from '../../components/PredictionHistoryTable';
import { useAuth } from '../../context/AuthContext';
import { fetchPredictionHistory } from '../../lib/data';
import type { PredictionView } from '../../lib/types';

export default function PatientHistory() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<PredictionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) return;

    void fetchPredictionHistory(user.id)
      .then((data) => {
        if (active) setPredictions(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return <LoadingScreen label="Loading your medical history..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-cs-ink">AI Prediction History</h1>
      <p className="text-sm text-cs-ink-secondary">
        Review the details and outcomes of your past symptom assessments.
      </p>

      {error ? <div className="panel-card text-cs-error">{error}</div> : null}

      <div className="panel-card overflow-hidden p-0">
        <PredictionHistoryTable predictions={predictions} includePatient={false} />
      </div>
    </div>
  );
}
