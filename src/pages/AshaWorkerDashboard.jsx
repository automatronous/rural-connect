import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SEVERITY_STYLE = {
  Low:    'badge-green',
  Medium: 'badge-yellow',
  High:   'badge-red',
}

export default function AshaWorkerDashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCases()
  }, [])

  async function fetchCases() {
    try {
      const res  = await fetch('/api/cases')
      const data = await res.json()
      // Show only this worker's cases
      const myCases = (data.cases || []).filter(c => c.ashaWorkerId === user?.id)
      setCases(myCases)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const todayCount = cases.filter(c => {
    const d = new Date(c.submittedAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  const highCount = cases.filter(c => c.severityLevel === 'High').length

  return (
    <div className="page-container animate-slide-up">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            Welcome, {user?.name || 'ASHA Worker'} 👋
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            ASHA Worker Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/asha/submit-case')}
          className="btn-primary text-base px-6 py-3"
          id="new-case-btn"
        >
          + Submit New Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { value: cases.length, label: 'Total Cases', color: 'text-primary-600' },
          { value: todayCount,   label: 'Submitted Today', color: 'text-blue-600' },
          { value: highCount,    label: 'High Severity', color: 'text-red-600' },
          { value: cases.length - highCount, label: 'Low / Medium', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <h2 className="text-xl font-bold text-neutral-800 mb-3">Recent Submissions</h2>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">⏳ Loading cases…</div>
      ) : cases.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-neutral-500 font-medium">No cases submitted yet.</p>
          <button onClick={() => navigate('/asha/submit-case')} className="btn-primary mt-4">
            Submit Your First Case →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => (
            <div key={c.caseId} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-neutral-800">{c.patientName}</p>
                  <span className={`badge ${SEVERITY_STYLE[c.severityLevel] || 'badge-blue'}`}>
                    {c.severityLevel}
                  </span>
                  <span className="badge badge-blue">{c.caseId}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {c.age}y · {c.gender} · 📍 {c.village} · {new Date(c.submittedAt).toLocaleString('en-IN')}
                </p>
              </div>
              {c.aiPrediction ? (
                <span className="badge badge-green text-[10px]">AI Analysed</span>
              ) : (
                <span className="badge text-[10px] bg-neutral-100 text-neutral-400">Awaiting AI</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
