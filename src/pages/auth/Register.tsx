import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader } from '../../components/PublicHeader';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../lib/types';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await signUp({
        email,
        password,
        name,
        role,
        age: age ? Number(age) : null,
        bloodGroup: bloodGroup || null,
      });

      if (user) {
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      } else {
        navigate('/login');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell min-h-screen">
      <PublicHeader />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="panel-card w-full max-w-2xl space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-cs-ink">Create Account</h1>
            <p className="mt-3 text-cs-ink-secondary">Register as a doctor or patient.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field-input"
              placeholder="Full name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-input"
              placeholder="Email address"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
              placeholder="Password"
              required
            />
            <input
              type="number"
              min="0"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="field-input"
              placeholder="Age"
            />
            <input
              type="text"
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
              className="field-input"
              placeholder="Blood group"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`rounded-2xl px-5 py-4 text-left transition-all ${
                role === 'patient'
                  ? 'bg-cs-primary/8 ring-2 ring-cs-primary'
                  : 'bg-cs-surface-low hover:bg-cs-surface-high'
              }`}
            >
              <p className="font-display text-sm font-semibold text-cs-ink">Patient</p>
              <p className="mt-2 text-sm text-cs-ink-secondary">Personal dashboard, records, and map access.</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`rounded-2xl px-5 py-4 text-left transition-all ${
                role === 'doctor'
                  ? 'bg-cs-primary/8 ring-2 ring-cs-primary'
                  : 'bg-cs-surface-low hover:bg-cs-surface-high'
              }`}
            >
              <p className="font-display text-sm font-semibold text-cs-ink">Doctor</p>
              <p className="mt-2 text-sm text-cs-ink-secondary">Patients, AI prediction, reports, and heatmap controls.</p>
            </button>
          </div>

          <button type="submit" className="primary-button w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

          {error ? <p className="text-sm text-cs-error">{error}</p> : null}

          <p className="text-sm text-cs-ink-secondary">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-cs-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
