import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../../components/LoadingScreen';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { fetchPatientDashboardData, previewDiagnosis } from '../../lib/data';
import type { PatientDashboardData } from '../../lib/types';
import { formatDate } from '../../lib/utils';

export default function PatientDashboard() {
  const { profile, user } = useAuth();
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) return;

    void fetchPatientDashboardData(user.id)
      .then((nextData) => {
        if (active) setData(nextData);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!data && !error) {
    return <LoadingScreen label="Loading patient dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <section className="panel-card">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Patient Dashboard</p>
        <h1 className="heading-orbitron mt-4 text-4xl font-bold text-white">Hello {profile?.name ?? 'Patient'}</h1>
        <p className="mt-3 text-white/65">
          Keep your records organized, review recent doctor visits, and track public disease activity from one place.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/patient/records" className="primary-button text-center">
            Quick Upload
          </Link>
          <Link to="/map" className="secondary-button text-center">
            View Disease Map
          </Link>
        </div>
      </section>

      {error ? <div className="panel-card text-red-300">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        {data?.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel-card">
          <div className="flex items-center justify-between">
            <h2 className="heading-orbitron text-2xl font-bold text-white">Recent Records</h2>
            <Link to="/patient/records" className="text-sm text-red-300">
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {data?.recentRecords.length ? (
              data.recentRecords.map((record) => (
                <article key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-semibold text-white">{record.file_name}</p>
                  <p className="mt-2 text-sm text-white/60">
                    {record.record_type ?? 'Other'} • {formatDate(record.upload_date ?? record.created_at)}
                  </p>
                  {record.downloadUrl ? (
                    <a
                      href={record.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm text-red-300"
                    >
                      Download file
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-white/55">No records uploaded yet.</p>
            )}
          </div>
        </div>

        <div className="panel-card">
          <h2 className="heading-orbitron text-2xl font-bold text-white">Recent Visits</h2>
          <div className="mt-6 space-y-4">
            {data?.recentVisits.length ? (
              data.recentVisits.map((visit) => (
                <article key={visit.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">{visit.doctorName}</p>
                    <span className="text-sm text-white/55">{formatDate(visit.visit_date)}</span>
                  </div>
                  <p className="mt-3 text-sm text-white/70">{previewDiagnosis(visit.diagnosis_notes)}</p>
                </article>
              ))
            ) : (
              <p className="text-white/55">No doctor visits recorded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
