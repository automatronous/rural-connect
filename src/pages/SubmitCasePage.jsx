import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormInput from '../components/common/FormInput'
import { symptomList } from '../data/symptoms'

const GENDER_OPTIONS    = ['Male', 'Female', 'Other'].map(v => ({ value: v, label: v }))
const SEVERITY_OPTIONS  = ['Low', 'Medium', 'High'].map(v => ({ value: v, label: v }))

const EMPTY_FORM = {
  patientName: '', age: '', gender: '', village: '', severityLevel: '', symptomText: '',
}

export default function SubmitCasePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm]               = useState(EMPTY_FORM)
  const [selectedSymptoms, setSelected] = useState([])
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(null)

  function handleChange(field) {
    return e => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  function toggleSymptom(sym) {
    setSelected(prev =>
      prev.some(s => s.id === sym.id) ? prev.filter(s => s.id !== sym.id) : [...prev, sym],
    )
  }

  function validate() {
    const errs = {}
    if (!form.patientName.trim())  errs.patientName  = 'Patient name is required'
    if (!form.age || form.age < 1 || form.age > 120) errs.age = 'Enter a valid age (1–120)'
    if (!form.gender)              errs.gender        = 'Select gender'
    if (!form.village.trim())      errs.village       = 'Village / location is required'
    if (!form.severityLevel)       errs.severityLevel = 'Select severity'
    if (selectedSymptoms.length === 0 && !form.symptomText.trim()) {
      errs.symptoms = 'Select at least one symptom or describe them'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const symptoms = selectedSymptoms.length
        ? selectedSymptoms.map(s => s.label).join(', ') + (form.symptomText ? `, ${form.symptomText}` : '')
        : form.symptomText

      const res = await fetch('/api/patient-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          symptoms,
          ashaWorkerId:   user?.id,
          ashaWorkerName: user?.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSuccess(data.case)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="page-container animate-slide-up">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Case Submitted!</h2>
          <p className="text-neutral-500 text-sm mb-2">
            Case <span className="font-mono font-bold">{success.caseId}</span> has been recorded.
          </p>
          <p className="text-neutral-400 text-xs mb-6">
            Patient: {success.patientName} · Severity: {success.severityLevel}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/asha/dashboard')} className="btn-primary" id="back-dashboard-btn">
              ← Dashboard
            </button>
            <button onClick={() => { setSuccess(null); setForm(EMPTY_FORM); setSelected([]) }} className="btn-secondary">
              Submit Another Case
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="mb-6">
        <button onClick={() => navigate('/asha/dashboard')} className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2 inline-flex items-center gap-1 transition">
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-neutral-800">Submit Patient Case</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Fill in patient details and symptoms to create a new case.
        </p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Patient fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput id="patientName" label="Patient Name" value={form.patientName} onChange={handleChange('patientName')} placeholder="e.g. Savitri Devi" error={errors.patientName} required />
            <FormInput id="age" label="Age" type="number" value={form.age} onChange={handleChange('age')} placeholder="e.g. 42" error={errors.age} required />
            <FormInput id="gender" label="Gender" type="select" value={form.gender} onChange={handleChange('gender')} options={GENDER_OPTIONS} placeholder="Select gender" error={errors.gender} required />
            <FormInput id="village" label="Village / Location" value={form.village} onChange={handleChange('village')} placeholder="e.g. Rampur Kalan" error={errors.village} required />
          </div>

          {/* Symptom checklist */}
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Symptoms <span className="text-red-500">*</span>
            </p>
            {errors.symptoms && <p className="text-xs text-red-500 mb-2">{errors.symptoms}</p>}

            {/* Selected tags */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold">
                      {s.label}
                      <button type="button" onClick={() => toggleSymptom(s)} className="text-primary-200 hover:text-white transition">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {symptomList.map(sym => {
                const active = selectedSymptoms.some(s => s.id === sym.id)
                return (
                  <button
                    key={sym.id} type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`text-left px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    {sym.label}
                  </button>
                )
              })}
            </div>

            {/* Additional symptom text */}
            <FormInput
              id="symptomText" label="Other Symptoms (describe)" type="textarea" rows={2}
              value={form.symptomText} onChange={handleChange('symptomText')}
              placeholder="Any symptoms not listed above…"
              className="mt-3"
            />
          </div>

          {/* Severity */}
          <FormInput id="severity" label="Severity Level" type="select" value={form.severityLevel} onChange={handleChange('severityLevel')} options={SEVERITY_OPTIONS} placeholder="Select severity" error={errors.severityLevel} required />

          {/* Submit errors */}
          {errors.submit && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={submitting}
              className={`btn-primary ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              id="submit-case-btn"
            >
              {submitting ? '⏳ Submitting…' : '📋 Submit Case'}
            </button>
            <button type="button" onClick={() => { setForm(EMPTY_FORM); setSelected([]); setErrors({}) }} className="btn-secondary">
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
