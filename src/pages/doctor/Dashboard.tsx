import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorHeatMap from '../../components/DoctorHeatMap';
import { LoadingScreen } from '../../components/LoadingScreen';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { fetchDoctorDashboardData } from '../../lib/data';
import type { DoctorDashboardData } from '../../lib/types';
import { formatDate } from '../../lib/utils';

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

  return (
    <div className="space-y-8">
      <section className="panel-card">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Doctor Dashboard</p>
        <h1 className="heading-orbitron mt-4 text-4xl font-bold text-white">Welcome Dr. {profile?.name ?? ''}</h1>
        <p className="mt-3 text-white/65">
          Review patient activity, AI prediction usage, uploaded records, and disease reporting from one control surface.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/doctor/predict" className="primary-button text-center">
            New Prediction
          </Link>
          <a href="#doctor-live-heatmap" className="secondary-button text-center">
            Live Heatmap
          </a>
          <Link to="/doctor/patients" className="secondary-button text-center">
            All Patients
          </Link>
        </div>
      </section>

      {error ? <div className="panel-card text-red-300">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data?.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <DoctorHeatMap />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-card">
          <div className="flex items-center justify-between">
            <h2 className="heading-orbitron text-2xl font-bold text-white">Recent Predictions</h2>
            <Link to="/doctor/predict" className="text-sm text-red-300">
              Open tool
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Patient</th>
                  <th className="table-cell">Disease</th>
                  <th className="table-cell">Confidence</th>
                  <th className="table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data?.recentPredictions.length ? (
                  data.recentPredictions.map((prediction) => (
                    <tr key={prediction.id}>
                      <td className="table-cell">{prediction.patientName}</td>
                      <td className="table-cell font-medium text-white">{prediction.predicted_disease}</td>
                      <td className="table-cell">{prediction.confidence.toFixed(1)}%</td>
                      <td className="table-cell">{formatDate(prediction.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="table-cell py-8 text-center text-white/50" colSpan={4}>
                      No predictions run yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="heading-orbitron text-2xl font-bold text-white">Recent Patients</h2>
          <div className="mt-6 space-y-4">
            {data?.recentPatients.length ? (
              data.recentPatients.map((patient) => (
                <article key={patient.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{patient.name}</p>
                    <span className="text-sm text-white/45">{formatDate(patient.lastVisitDate)}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    Age {patient.age ?? 'N/A'} • Blood Group {patient.blood_group ?? 'N/A'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-white/55">No patients connected yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
