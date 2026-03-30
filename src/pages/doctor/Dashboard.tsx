import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../../components/LoadingScreen';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { fetchDoctorDashboardData } from '../../lib/data';
import type { DoctorDashboardData } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Activity, BarChart3, FileText, MapPin } from 'lucide-react';

export default function DoctorDashboard() {
  const { profile, user } = useAuth();
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) return;

    void fetchDoctorDashboardData(user.id)
      .then((nextData) => {
        if (active) setData(nextData);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load doctor dashboard.');
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!data && !error) {
    return <LoadingScreen label="Loading doctor dashboard..." />;
  }

  const statIcons = [
    <Activity className="h-5 w-5" />,
    <BarChart3 className="h-5 w-5" />,
    <FileText className="h-5 w-5" />,
    <MapPin className="h-5 w-5" />,
  ];

  return (
    <div className="space-y-8">
      <section className="panel-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-ink-secondary">Doctor Dashboard</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-cs-ink">Welcome Dr. {profile?.name ?? ''}</h1>
        <p className="mt-3 text-cs-ink-secondary">
          Review patient activity, AI prediction usage, uploaded records, and disease reporting from one control surface.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/doctor/predict" className="primary-button text-center">
            New Prediction (Quick Assist)
          </Link>
          <Link to="/doctor/patients" className="secondary-button text-center">
            All Patients
          </Link>
        </div>
      </section>

      {error ? <div className="panel-card text-cs-error">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data?.stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            {...stat}
            icon={statIcons[i]}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-cs-ink">Recent Predictions</h2>
            <Link to="/doctor/predict" className="text-sm font-semibold text-cs-primary">
              Open tool
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Patient</th>
                  <th className="table-cell">Disease</th>
                  <th className="table-cell">Confidence</th>
                  <th className="table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentPredictions.length ? (
                  data.recentPredictions.map((prediction) => (
                    <tr key={prediction.id} className="border-t border-cs-surface-high">
                      <td className="table-cell">{prediction.patientName}</td>
                      <td className="table-cell font-medium text-cs-ink">{prediction.predicted_disease}</td>
                      <td className="table-cell">{prediction.confidence.toFixed(1)}%</td>
                      <td className="table-cell">{formatDate(prediction.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="table-cell py-8 text-center text-cs-ink-secondary" colSpan={4}>
                      No predictions run yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="font-display text-xl font-bold text-cs-ink">Recent Patients</h2>
          <div className="mt-6 space-y-4">
            {data?.recentPatients.length ? (
              data.recentPatients.map((patient) => (
                <article key={patient.id} className="rounded-2xl bg-cs-surface-low p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-cs-ink">{patient.name}</p>
                    <span className="text-sm text-cs-ink-secondary">{formatDate(patient.lastVisitDate)}</span>
                  </div>
                  <p className="mt-2 text-sm text-cs-ink-secondary">
                    Age {patient.age ?? 'N/A'} • Blood Group {patient.blood_group ?? 'N/A'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-cs-ink-secondary">No patients connected yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
