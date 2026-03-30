import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader } from '../../components/PublicHeader';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { role, signIn, signOut, supabase, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (user && role === 'patient') {
      navigate('/patient/dashboard');
    }
  }, [navigate, role, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // NEW: if already submitting, ignore
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const signedInUser = await signIn(email, password);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signedInUser.id)
        .single();

      if (profile?.role === 'doctor') {
        navigate('/doctor/dashboard');
        return;
      }

      if (profile?.role === 'patient') {
        navigate('/patient/dashboard');
        return;
      }

      await signOut();
      setError('This account does not have a valid role.');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Login failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell min-h-screen">
      <PublicHeader />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="panel-card w-full max-w-md space-y-5">
          <div>
            <h1 className="heading-orbitron text-3xl font-bold text-white">Sign In</h1>
            <p className="mt-3 text-white/60">
              Access the correct doctor or patient workspace.
            </p>
          </div>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
            placeholder="Email address"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-input"
            placeholder="Password"
            required
          />

          <button
            type="submit"
            className="primary-button w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {error ? <p className="text-sm text-cs-error">{error}</p> : null}

          <p className="text-sm text-cs-ink-secondary">
            New here?{' '}
            <Link to="/register" className="font-semibold text-cs-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}