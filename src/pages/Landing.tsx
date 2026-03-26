import { Link } from 'react-router-dom';
import { PublicHeader } from '../components/PublicHeader';

export default function Landing() {
  return (
    <div className="app-shell min-h-screen">
      <PublicHeader />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center px-4 py-12">
        <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-6 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm uppercase tracking-[0.28em] text-red-200">
              AI-Powered Rural Healthcare Platform
            </p>
            <h1
              className="heading-orbitron text-5xl font-bold text-red-500 md:text-6xl"
              style={{ textShadow: '0 0 40px rgba(255,68,68,0.8)' }}
            >
              RuralConnect
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/60">
              Connect patients, doctors, AI diagnosis, live outbreak signals, and secure medical records in one
              production-ready rural health workflow.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/login" className="secondary-button text-center">
                Login
              </Link>
              <Link to="/register" className="primary-button text-center">
                Register
              </Link>
              <Link to="/map" className="secondary-button text-center">
                View Disease Map
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            {[
              {
                title: 'AI Disease Prediction',
                text: 'Doctors can run symptom-based disease prediction against the FastAPI model and save results to real patient histories.',
              },
              {
                title: 'Live Disease Heatmap',
                text: 'Anyone can view public disease reporting layers across India, with realtime inserts flowing from Supabase directly to the map.',
              },
              {
                title: 'Secure Records',
                text: 'Patients and doctors upload real PDFs and images into Supabase Storage with metadata stored in the medical records table.',
              },
            ].map((feature) => (
              <article key={feature.title} className="panel-card">
                <h2 className="heading-orbitron text-xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-white/65">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
