import { Link } from 'react-router-dom';
import { Activity, Map as MapIcon, Shield, Users } from 'lucide-react';
import { PublicHeader } from '../components/PublicHeader';

export default function Landing() {
  return (
    <div className="app-shell min-h-screen">
      <PublicHeader />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center px-4 py-12">
        <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-6 inline-flex rounded-full bg-cs-primary/8 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-cs-primary">
              AI-Powered Rural Healthcare Platform
            </p>
            <h1 className="font-display text-5xl font-bold text-cs-primary md:text-6xl">
              RuralConnect
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-cs-ink-secondary">
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
                icon: <Activity className="h-6 w-6 text-cs-primary" />,
              },
              {
                title: 'Live Disease Heatmap',
                text: 'Anyone can view public disease reporting layers across India, with realtime inserts flowing from Supabase directly to the map.',
                icon: <MapIcon className="h-6 w-6 text-cs-green" />,
              },
              {
                title: 'Secure Records',
                text: 'Patients and doctors upload real PDFs and images into Supabase Storage with metadata stored in the medical records table.',
                icon: <Shield className="h-6 w-6 text-cs-tint" />,
              },
            ].map((feature) => (
              <article key={feature.title} className="panel-card flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cs-primary-light">
                  {feature.icon}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-cs-ink">{feature.title}</h2>
                  <p className="mt-2 text-sm text-cs-ink-secondary">{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
