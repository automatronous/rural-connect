import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientProfile() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <section className="panel-card">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Patient Profile</p>
        <h1 className="heading-orbitron mt-4 text-4xl font-bold text-white">{profile?.name ?? 'Patient'}</h1>
        <p className="mt-3 text-white/65">Your synced identity and health basics from the Supabase profile record.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel-card grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Email</p>
            <p className="mt-2 text-white">{profile?.email ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Role</p>
            <p className="mt-2 text-white">{profile?.role ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Age</p>
            <p className="mt-2 text-white">{profile?.age ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Blood Group</p>
            <p className="mt-2 text-white">{profile?.blood_group ?? 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Allergies</p>
            <p className="mt-2 text-white">{profile?.allergies ?? 'No allergies recorded.'}</p>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="heading-orbitron text-2xl font-bold text-white">Quick Access</h2>
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
