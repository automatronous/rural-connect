import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '📋',
    title: 'Quick Registration',
    desc: 'Register patients in under 60 seconds — no paperwork needed.',
  },
  {
    icon: '🩺',
    title: 'Symptom Mapping',
    desc: 'Select symptoms from a curated list built for rural health conditions.',
  },
  {
    icon: '🤖',
    title: 'AI Diagnosis',
    desc: 'Get ranked probable diagnoses with confidence scores instantly.',
  },
  {
    icon: '👨‍⚕️',
    title: 'Doctor Review',
    desc: 'Every AI result is reviewed and approved by a qualified doctor.',
  },
]

const STATS = [
  { value: '2,400+', label: 'Patients Served' },
  { value: '48',     label: 'Villages Covered' },
  { value: '92%',    label: 'Accuracy Rate'    },
  { value: '< 5 min',label: 'Avg. Consult Time'},
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4 backdrop-blur">
            🌿 AI-Powered Rural Healthcare · Prototype
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            RuralCareConnect
          </h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Bringing intelligent, affordable, and accessible healthcare to every village.
            Register a patient and get an AI-assisted diagnosis reviewed by a doctor — in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                         bg-white text-primary-700 font-bold text-base shadow-lg shadow-primary-900/30
                         hover:bg-primary-50 active:scale-[0.98] transition-all"
              id="start-consultation-btn"
            >
              Start Consultation →
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                         bg-white/10 text-white font-semibold text-base border border-white/20
                         hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-primary-600">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-neutral-800 mb-2">
          How It Works
        </h2>
        <p className="text-center text-neutral-500 mb-10">
          A simple four-step flow from registration to doctor-approved diagnosis.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="text-xs font-bold text-primary-600 mb-1">Step {i + 1}</div>
              <h3 className="font-bold text-neutral-800 mb-1">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-primary-50 border-t border-primary-100">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            Ready to start a consultation?
          </h2>
          <p className="text-primary-600 mb-6 text-sm">
            Register the patient and the AI will guide the rest.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary text-base px-8 py-3"
            id="cta-register-btn"
          >
            Register Patient →
          </button>
        </div>
      </section>
    </div>
  )
}
