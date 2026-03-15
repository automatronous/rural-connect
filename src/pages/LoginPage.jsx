import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  {
    key: 'asha',
    label: 'ASHA Worker',
    icon: '👩‍⚕️',
    desc: 'Submit patient cases from the field',
    creds: 'asha / asha123',
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: '🩺',
    desc: 'Review and diagnose submitted cases',
    creds: 'doctor / doctor123',
  },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login, loading, error, setError } = useAuth()

  const [selectedRole, setSelectedRole] = useState(null)
  const [username, setUsername]         = useState('')
  const [password, setPassword]        = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    const user = await login(username, password)
    if (user) {
      navigate(user.role === 'asha' ? '/asha/dashboard' : '/doctor/dashboard', { replace: true })
    }
  }

  function handleRoleSelect(role) {
    setSelectedRole(role)
    setUsername('')
    setPassword('')
    setError('')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-600/30 mb-4">
            RC
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-800 tracking-tight">
            Welcome to RuralCareConnect
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Select your role to continue
          </p>
        </div>

        {/* Role selection cards */}
        {!selectedRole ? (
          <div className="space-y-3">
            {ROLES.map(role => (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role.key)}
                className="w-full card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                           flex items-center gap-4 text-left group cursor-pointer"
                id={`role-${role.key}-btn`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl
                                group-hover:bg-primary-100 transition shrink-0">
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-800 group-hover:text-primary-700 transition">
                    {role.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{role.desc}</p>
                </div>
                <span className="text-neutral-300 group-hover:text-primary-500 transition text-lg">→</span>
              </button>
            ))}

            {/* Demo hint */}
            <div className="mt-6 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
              <span className="font-semibold">Demo credentials:</span>
              <div className="mt-1 space-y-0.5">
                {ROLES.map(r => (
                  <div key={r.key}>
                    <span className="font-medium">{r.label}:</span> {r.creds}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Login form */
          <div className="animate-slide-up">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-4 inline-flex items-center gap-1 transition"
            >
              ← Choose a different role
            </button>

            <div className="card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-xl">
                  {ROLES.find(r => r.key === selectedRole)?.icon}
                </div>
                <div>
                  <p className="font-bold text-neutral-800">
                    {ROLES.find(r => r.key === selectedRole)?.label}
                  </p>
                  <p className="text-xs text-neutral-500">Sign in to continue</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="flex flex-col gap-1">
                  <label htmlFor="username" className="text-sm font-medium text-neutral-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field"
                  />
                </div>

                {error && (
                  <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-primary w-full justify-center py-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  id="login-submit-btn"
                >
                  {loading ? '⏳ Signing in…' : 'Sign In →'}
                </button>
              </form>

              {/* Credential hint */}
              <p className="text-xs text-neutral-400 mt-4 text-center">
                Demo: <span className="font-mono">{ROLES.find(r => r.key === selectedRole)?.creds}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
