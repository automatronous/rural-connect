import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, NAV_LINKS } from '../lib/constants';
import { cn } from '../lib/utils';

export function AppShell() {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const links = role ? NAV_LINKS[role] : [];

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,68,68,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(68,136,255,0.1),transparent_30%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <NavLink to={role ? `/${role}/dashboard` : '/'} className="heading-orbitron text-2xl font-bold text-red-500">
              {APP_NAME}
            </NavLink>

            <div
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] lg:hidden',
                role === 'doctor' ? 'badge-doctor' : 'badge-patient',
              )}
            >
              {role}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-between gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <div className="text-right">
                <p className="text-sm text-white/60">Signed in as</p>
                <p className="font-semibold text-white">{profile?.name ?? 'Unknown user'}</p>
              </div>
              <div
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                  role === 'doctor' ? 'badge-doctor' : 'badge-patient',
                )}
              >
                {role}
              </div>
            </div>

            <button type="button" onClick={handleLogout} className="secondary-button py-2">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
