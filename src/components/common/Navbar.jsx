import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'
import { useAuth } from '../../context/AuthContext'

// ── Step definitions for the consultation stepper ───────────────
const STEPS = [
  { label: 'Register',  path: '/register'      },
  { label: 'Symptoms',  path: '/symptoms'      },
  { label: 'Diagnosis', path: '/diagnosis'     },
  { label: 'Review',    path: '/doctor-review' },
]

const ROLE_LABELS = {
  asha:   'ASHA Worker',
  doctor: 'Doctor',
}

const ROLE_BADGE = {
  asha:   'bg-primary-100 text-primary-700',
  doctor: 'bg-blue-100 text-blue-700',
}

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { patientInfo, resetSession } = usePatient()
  const { user, isAuthenticated, logout } = useAuth()

  const isLogin   = location.pathname === '/login'
  const stepIndex = STEPS.findIndex(s => s.path === location.pathname)
  const showStepper = stepIndex >= 0

  function handleLogout() {
    resetSession()
    logout()
    navigate('/login', { replace: true })
  }

  const dashboardPath = user?.role === 'asha' ? '/asha/dashboard' : '/doctor/dashboard'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to={isAuthenticated ? dashboardPath : '/login'} className="flex items-center gap-2 group shrink-0">
          <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow">
            RC
          </span>
          <span className="font-bold text-primary-700 group-hover:text-primary-600 transition hidden sm:block">
            RuralCareConnect
          </span>
        </Link>

        {/* Progress stepper — only inside the consultation flow */}
        {showStepper && (
          <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Progress">
            {STEPS.map((step, i) => {
              const done    = i < stepIndex
              const current = i === stepIndex
              return (
                <div key={step.path} className="flex items-center gap-1">
                  <span
                    className={[
                      'text-xs font-semibold px-2.5 py-1 rounded-full transition-all',
                      done    ? 'bg-primary-600 text-white'                         : '',
                      current ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300' : '',
                      !done && !current ? 'text-neutral-400' : '',
                    ].join(' ')}
                  >
                    {i + 1}. {step.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className={`text-neutral-300 ${done ? 'text-primary-400' : ''}`}>›</span>
                  )}
                </div>
              )
            })}
          </nav>
        )}

        {/* Right side */}
        <div className="shrink-0 flex items-center gap-2">
          {isAuthenticated && (
            <>
              {/* Dashboard link */}
              {!showStepper && location.pathname !== dashboardPath && (
                <Link to={dashboardPath} className="btn-secondary text-xs py-1.5 px-3 hidden sm:inline-flex">
                  ← Dashboard
                </Link>
              )}

              {/* Role badge */}
              <span className={`badge ${ROLE_BADGE[user?.role] || 'badge-blue'} text-xs hidden sm:inline-flex`}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>

              {/* Patient pill (during consultation) */}
              {patientInfo && (
                <span className="badge badge-green text-xs max-w-[100px] truncate" title={patientInfo.name}>
                  {patientInfo.name}
                </span>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-xs text-neutral-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50"
                title="Logout"
                id="logout-btn"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
