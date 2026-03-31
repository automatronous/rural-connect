import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientProfile() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <section className="panel-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-ink-secondary">Patient Profile</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-cs-ink">{profile?.name ?? 'Patient'}</h1>
        <p className="mt-3 text-cs-ink-secondary">Your synced identity and health basics from the Supabase profile record.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel-card grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Email</p>
            <p className="mt-2 text-cs-ink">{profile?.email ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Role</p>
            <p className="mt-2 text-cs-ink">{profile?.role ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Age</p>
            <p className="mt-2 text-cs-ink">{profile?.age ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Blood Group</p>
            <p className="mt-2 text-cs-ink">{profile?.blood_group ?? 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Allergies</p>
            <p className="mt-2 text-cs-ink">{profile?.allergies ?? 'No allergies recorded.'}</p>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="font-display text-xl font-bold text-cs-ink">Quick Access</h2>
          <div className="mt-6 space-y-3">
            <Link to="/patient/records" className="primary-button block text-center">
              Manage Records
            </Link>
            <Link to="/patient/map" className="secondary-button block text-center">
              Open Disease Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
