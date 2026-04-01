import { Outlet } from 'react-router-dom';
import { Bell, HelpCircle, LogOut, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AppShell() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar />

      <div className="ml-[220px] flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cs-outline bg-white/95 px-8 py-4 backdrop-blur-md">
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cs-ink-secondary/50" />
              <input
                type="text"
                placeholder="Search data or medical record"
                className="rounded-full border border-cs-outline bg-cs-surface-low py-2 pl-10 pr-4 text-sm text-cs-ink placeholder-cs-ink-secondary/40 outline-none transition-all duration-200 focus:bg-white focus:shadow-cs"
                style={{ width: '260px' }}
              />
            </div>

            <button
              type="button"
              className="relative rounded-full p-2 text-cs-ink-secondary transition-colors hover:bg-cs-surface-high"
            >
              <Bell className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="rounded-full p-2 text-cs-ink-secondary transition-colors hover:bg-cs-surface-high"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cs-primary text-sm font-bold text-white shadow-sm">
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-cs-error/90 transition-colors hover:bg-cs-error/10 hover:text-cs-error"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-8 pb-8 pt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
