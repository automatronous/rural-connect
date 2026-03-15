import { useState } from 'react'

const SEVERITY_STYLE = {
  Low:    'badge-green',
  Medium: 'badge-yellow',
  High:   'badge-red',
}

/**
 * CaseDetailModal — slide-over panel showing full case details.
 *
 * Props:
 *   caseData  object  – full case record
 *   onClose   fn      – close callback
 */
export default function CaseDetailModal({ caseData, onClose }) {
  if (!caseData) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur">
          <h2 className="text-lg font-bold text-neutral-800">Case Details</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition text-xl leading-none" aria-label="Close">✕</button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Case ID + Severity */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-blue">{caseData.caseId}</span>
            <span className={`badge ${SEVERITY_STYLE[caseData.severityLevel] || 'badge-blue'}`}>
              {caseData.severityLevel} Severity
            </span>
            {caseData.aiPrediction ? (
              <span className="badge badge-green text-[10px]">AI Analysed</span>
            ) : (
              <span className="badge text-[10px] bg-amber-50 text-amber-600 border border-amber-200">🤖 AI Pending</span>
            )}
          </div>

          {/* Patient info */}
          <Section title="Patient Information">
            <InfoRow label="Name"     value={caseData.patientName} />
            <InfoRow label="Age"      value={`${caseData.age} years`} />
            <InfoRow label="Gender"   value={caseData.gender} />
            <InfoRow label="Village"  value={caseData.village} icon="📍" />
          </Section>

          {/* Symptoms */}
          <Section title="Symptoms">
            <div className="flex flex-wrap gap-2">
              {caseData.symptoms?.split(',').map((s, i) => (
                <span key={i} className="badge badge-blue">{s.trim()}</span>
              ))}
            </div>
          </Section>

          {/* Submission details */}
          <Section title="Submission Details">
            <InfoRow label="Submitted At" value={new Date(caseData.submittedAt).toLocaleString('en-IN')} icon="🕐" />
            <InfoRow label="ASHA Worker"  value={caseData.ashaWorkerName || caseData.ashaWorkerId || '—'} icon="👩‍⚕️" />
            <InfoRow label="Worker ID"    value={caseData.ashaWorkerId || '—'} />
          </Section>

          {/* AI Prediction placeholder */}
          <Section title="AI Analysis">
            <div className="px-4 py-6 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 text-center">
              <p className="text-3xl mb-2">🤖</p>
              <p className="text-sm font-medium text-neutral-500">Coming Soon</p>
              <p className="text-xs text-neutral-400 mt-1">
                AI disease prediction and risk scoring will appear here once the module is integrated.
              </p>
            </div>
          </Section>

          {/* Close */}
          <button onClick={onClose} className="btn-secondary w-full justify-center mt-4">
            Close
          </button>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="section-label mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon && <span>{icon}</span>}
      <span className="text-neutral-500 w-24 shrink-0">{label}</span>
      <span className="font-medium text-neutral-800">{value || '—'}</span>
    </div>
  )
}
