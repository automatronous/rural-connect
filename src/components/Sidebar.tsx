import { NavLink } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, NAV_LINKS } from '../lib/constants';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function Sidebar() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const links = role ? NAV_LINKS[role] : [];

  // Helper to get consistent keys regardless of case in constants
  const getTranslationKey = (label: string) => {
    switch (label) {
      case 'Dashboard': return 'dashboard';
      case 'Patients': return 'patients';
      case 'Patient Cases': return 'patients';
      case 'Disease Heatmap': return 'heatmap';
      case 'AI Predictor': return 'symptomScreening';
      case 'Add new case': return 'enterSymptoms';
      case 'Medical Records': return 'records';
      default: return label.toLowerCase();
    }
  };

  return (
    <aside className="sidebar-container">
      {/* Brand */}
      <div className="sidebar-brand">
        <h1 className="font-display text-xl font-bold text-cs-primary">
          Clinical Serenity
        </h1>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cs-ink-secondary/60">
          {APP_NAME} Health
        </p>
      </div>

      <div className="px-5 mb-4">
        <LanguageSwitcher />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = (link as any).icon || Phone; // fallback
          return (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              className={({ isActive }) =>
                cn('nav-link', isActive && 'nav-link-active')
              }
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="truncate">{t(getTranslationKey(link.label))}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Emergency Call */}
      <div className="sidebar-emergency">
        <button
          type="button"
          className="danger-button flex w-full items-center justify-center gap-2 text-sm"
        >
          <Phone className="h-4 w-4" />
          {t('callHealthCenter')}
        </button>
      </div>
    </aside>
  );
}
