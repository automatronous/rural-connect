import { Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '../lib/constants';
import { cn } from '../lib/utils';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="heading-orbitron text-2xl font-bold text-red-500">
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
