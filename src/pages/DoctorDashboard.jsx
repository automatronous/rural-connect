import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import CaseDetailModal from '../components/common/CaseDetailModal'

const SEVERITY_STYLE = {
  Low:    'badge-green',
  Medium: 'badge-yellow',
  High:   'badge-red',
}

const SEVERITY_ICON = { Low: '🟢', Medium: '🟡', High: '🔴' }

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [cases, setCases]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('All')
  const [search, setSearch]       = useState('')
  const [selectedCase, setSelected] = useState(null)

  useEffect(() => {
    fetchCases()
  }, [])

  async function fetchCases() {
    try {
      const res  = await fetch('/api/cases')
      const data = await res.json()
      setCases(data.cases || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const FILTERS = ['All', 'High', 'Medium', 'Low']

  const filtered = cases
    .filter(c => filter === 'All' || c.severityLevel === filter)
    .filter(c =>
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.village?.toLowerCase().includes(search.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(search.toLowerCase()),
    )

  const highCount   = cases.filter(c => c.severityLevel === 'High').length
  const mediumCount = cases.filter(c => c.severityLevel === 'Medium').length
  const lowCount    = cases.filter(c => c.severityLevel === 'Low').length

  return (
    <div className="page-container animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'DR'}
        </div>
        <div>
          <p className="font-semibold text-blue-800">{user?.name || 'Doctor'}</p>
          <p className="text-xs text-blue-600">Doctor Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-neutral-800 mb-1">Patient Cases</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Review submitted cases from ASHA workers across all villages.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { value: cases.length, label: 'Total Cases',    color: 'text-primary-600' },
          { value: highCount,    label: 'High Severity',  color: 'text-red-600' },
          { value: mediumCount,  label: 'Medium Severity',color: 'text-yellow-600' },
          { value: lowCount,     label: 'Low Severity',   color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card text-center py-3">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
              }`}
            >
              {f !== 'All' && SEVERITY_ICON[f]} {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name, village, or case ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field sm:max-w-xs"
          id="doctor-search-input"
        />
      </div>

      {/* Cases list */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400">⏳ Loading cases…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-neutral-500 font-medium">
            {cases.length === 0 ? 'No patient cases submitted yet.' : 'No cases match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <button
              key={c.caseId}
              onClick={() => setSelected(c)}
              className="w-full card flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer group"
              id={`case-row-${c.caseId}`}
            >
              {/* Severity dot */}
              <div className={`w-3 h-3 rounded-full shrink-0 ${
                c.severityLevel === 'High' ? 'bg-red-500' :
                c.severityLevel === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-neutral-800 group-hover:text-primary-700 transition">{c.patientName}</p>
                  <span className={`badge ${SEVERITY_STYLE[c.severityLevel] || 'badge-blue'}`}>
                    {c.severityLevel}
                  </span>
                  <span className="badge badge-blue text-[10px]">{c.caseId}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {c.age}y · {c.gender} · 📍 {c.village} · 🕐 {new Date(c.submittedAt).toLocaleString('en-IN')}
                </p>
              </div>

              <span className="text-neutral-300 group-hover:text-primary-500 transition text-lg shrink-0">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Regional Trends placeholder */}
      <div className="mt-8 px-4 py-8 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 text-center">
        <p className="text-3xl mb-2">🗺️</p>
        <p className="text-sm font-medium text-neutral-500">Regional Disease Trends — Coming Soon</p>
        <p className="text-xs text-neutral-400 mt-1">
          A map-based view of disease patterns across districts will be available once the AI module is integrated.
        </p>
      </div>

      {/* Case detail modal */}
      {selectedCase && (
        <CaseDetailModal caseData={selectedCase} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
