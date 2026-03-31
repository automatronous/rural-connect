import { Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '../lib/constants';
import { cn } from '../lib/utils';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl" style={{ boxShadow: '0 1px 0 rgba(195, 198, 212, 0.25)' }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="font-display text-2xl font-bold text-cs-primary">
          {APP_NAME}
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Disease Map', to: '/map' },
            { label: 'Login', to: '/login' },
            { label: 'Register', to: '/register' },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
