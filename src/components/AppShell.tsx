import { Outlet } from 'react-router-dom';
import { Bell, HelpCircle, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export function AppShell() {
  const { profile } = useAuth();

  return (
    <div className="app-shell flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[220px] flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-cs-surface/80 px-8 py-4 backdrop-blur-md">
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cs-ink-secondary/50" />
              <input
                type="text"
                placeholder="Search data or medical record"
                className="rounded-full bg-cs-surface-low py-2 pl-10 pr-4 text-sm text-cs-ink placeholder-cs-ink-secondary/40 outline-none transition-all duration-200 focus:bg-white focus:shadow-cs"
                style={{ width: '260px' }}
              />
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full p-2 text-cs-ink-secondary transition-colors hover:bg-cs-surface-high"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* Help */}
            <button
              type="button"
              className="rounded-full p-2 text-cs-ink-secondary transition-colors hover:bg-cs-surface-high"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cs-primary to-cs-primary-dark text-sm font-bold text-white">
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 pb-8 pt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
