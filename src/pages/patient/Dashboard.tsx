import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  MapPin,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { fetchPatientDashboardData } from '../../lib/data';
import type { PatientDashboardData } from '../../lib/types';

/* ── Donut Ring Component ── */
function HealthScoreRing({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-[150px] w-[150px] items-center justify-center">
      <svg className="absolute inset-0" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e4e8" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#1b6d24"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="donut-ring"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="text-center">
        <p className="font-display text-3xl font-bold text-cs-ink">{score}%</p>
        <p className="text-xs text-cs-ink-secondary">Optimal</p>
      </div>
    </div>
  );
}

/* ── Bar Chart Component ── */
function TrendChart() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const malaria = [45, 60, 75, 55, 40, 30];
  const dengue = [35, 50, 65, 45, 35, 25];
  const maxVal = 80;

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-2" style={{ height: '180px' }}>
        {days.map((day, i) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-1" style={{ height: '150px' }}>
              <div
                className="w-5 rounded-t-md bg-cs-primary/20"
                style={{ height: `${(malaria[i] / maxVal) * 100}%` }}
              />
              <div
                className="w-5 rounded-t-md bg-cs-primary/8"
                style={{ height: `${(dengue[i] / maxVal) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-cs-ink-secondary">{day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <span className="flex items-center gap-2 text-xs text-cs-ink-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-cs-primary/30" /> Malaria Cases
        </span>
        <span className="flex items-center gap-2 text-xs text-cs-ink-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-cs-primary/10" /> Dengue Cases
        </span>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { profile, user } = useAuth();
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    let active = true;
    if (!user) return;

    void fetchPatientDashboardData(user.id)
      .then((nextData) => { if (active) setData(nextData); })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
      });

    return () => { active = false; };
  }, [user]);

  if (!data && !error) {
    return <LoadingScreen label="Loading patient dashboard..." />;
  }

  const statsConfig = [
    { icon: <BarChart3 className="h-5 w-5" />, trend: '7%', trendUp: true, label: 'Predictions Made' },
    { icon: <Users className="h-5 w-5" />, hint: '2 NEARBY', label: 'Doctors Available' },
    { icon: <AlertTriangle className="h-5 w-5" />, label: 'Active Alerts' },
    { icon: <FileText className="h-5 w-5" />, accentDot: '#2b5bb5', label: 'Reports Uploaded' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="font-display text-2xl font-bold text-cs-ink">Dashboard Overview</h1>

      {error ? <div className="panel-card text-cs-error">{error}</div> : null}

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">
          {/* Health Score + Stats Row */}
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            {/* AI Health Score */}
            <div className="panel-card flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cs-ink-secondary">
                AI Health Score
              </p>
              <div className="mt-3">
                <HealthScoreRing score={82} />
              </div>
              <p className="mt-2 text-xs text-cs-ink-secondary">
                Based on your recent symptoms and regional data.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {data?.stats.map((stat, i) => (
                <div key={stat.label} className="panel-card flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cs-primary-light text-cs-primary">
                      {statsConfig[i]?.icon}
                    </div>
                    {statsConfig[i]?.trend ? (
                      <span className="rounded-full bg-cs-green-light px-2 py-0.5 text-[10px] font-semibold text-cs-green">
                        ↑ {statsConfig[i].trend}
                      </span>
                    ) : null}
                    {statsConfig[i]?.hint ? (
                      <span className="text-[10px] font-semibold text-cs-ink-secondary">
                        {statsConfig[i].hint}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-end gap-1.5">
                    <p className="font-display text-2xl font-bold text-cs-ink">{stat.value}</p>
                    {statsConfig[i]?.accentDot ? (
                      <span className="mb-1 h-2 w-2 rounded-full" style={{ backgroundColor: statsConfig[i].accentDot }} />
                    ) : null}
                  </div>
                  <p className="text-xs text-cs-ink-secondary">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Health Trends */}
          <div className="panel-card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-cs-ink">Regional Health Trends</h2>
                <p className="mt-1 text-sm text-cs-ink-secondary">Community spread monitoring</p>
              </div>
              <div className="flex gap-1 rounded-full bg-cs-surface-low p-1">
                <button
                  type="button"
                  onClick={() => setTrendPeriod('weekly')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    trendPeriod === 'weekly'
                      ? 'bg-white text-cs-ink shadow-sm'
                      : 'text-cs-ink-secondary hover:text-cs-ink'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setTrendPeriod('monthly')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    trendPeriod === 'monthly'
                      ? 'bg-white text-cs-ink shadow-sm'
                      : 'text-cs-ink-secondary hover:text-cs-ink'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <TrendChart />
          </div>

          {/* AI Smart Alerts */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-cs-ink">
              <Shield className="h-5 w-5 text-cs-primary" />
              AI Smart Alerts
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="alert-card-warning">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-cs-ink">Community Update</h3>
                    <p className="mt-1 text-xs text-cs-ink-secondary">
                      Fever cases increasing in your area. Consider preventive measures.
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Amber Status
                    </span>
                  </div>
                </div>
              </div>

              <div className="alert-card-danger">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-cs-error">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-cs-ink">Health Risk Detected</h3>
                    <p className="mt-1 text-xs text-cs-ink-secondary">
                      High probability of dengue detected in your immediate district.
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-red-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cs-error">
                      Red Status
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="panel-card space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cs-ink-secondary">
              Quick Actions
            </p>

            <Link
              to="/patient/map"
              className="flex items-center justify-between rounded-2xl p-4 text-white transition-all hover:shadow-cs-hover"
              style={{ background: 'linear-gradient(135deg, #003178, #0d47a1)' }}
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5" />
                <span className="font-display text-sm font-bold">Check Symptoms</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Link>

            <Link
              to="/patient/records"
              className="flex items-center justify-between rounded-2xl bg-cs-surface-low p-4 transition-all hover:bg-cs-surface-high"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-cs-ink-secondary" />
                <span className="font-display text-sm font-semibold text-cs-ink">Book Appointment</span>
              </div>
              <ChevronRight className="h-5 w-5 text-cs-ink-secondary" />
            </Link>
          </div>

          {/* Appointments */}
          <div className="panel-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-cs-ink">Appointments</h3>
              <button type="button" className="text-xs font-semibold text-cs-primary">
                View All
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cs-primary-light text-sm font-bold text-cs-primary">
                  ST
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cs-ink">Dr. Sarah Thompson</p>
                  <p className="text-xs text-cs-ink-secondary">General Practitioner</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cs-ink">10:00 AM</p>
                  <p className="text-[10px] font-bold uppercase text-cs-primary">Today</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cs-surface-high text-sm font-bold text-cs-ink-secondary">
                  JW
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cs-ink">Dr. James Wilson</p>
                  <p className="text-xs text-cs-ink-secondary">Cardiology Specialist</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cs-ink">2:30 PM</p>
                  <p className="text-[10px] font-bold uppercase text-cs-ink-secondary">Tomorrow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Outbreak */}
          <div className="alert-card-danger">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cs-error" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-cs-error">
                Nearby Outbreak
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-cs-ink">
              Malaria outbreak reported 5 miles away in the Eastern District.
            </p>
            <div className="mt-3 rounded-xl bg-cs-error/5 px-3 py-2">
              <p className="text-xs text-cs-green">
                Recommendation: Use bed nets and repellent during evening hours.
              </p>
            </div>
            <Link
              to="/patient/map"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cs-ink"
            >
              View Hotspot Map <TrendingUp className="h-3 w-3" />
            </Link>
          </div>

          {/* Community Health Status (Mini Map Preview) */}
          <div className="panel-card overflow-hidden p-0">
            <div className="relative h-32 bg-gradient-to-br from-cs-primary/20 to-cs-green/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-cs-ink shadow-sm">
                  2 ACTIVE RISK ZONES
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-xs text-cs-ink-secondary">Community Health Status</span>
              <span className="rounded-full bg-cs-green-light px-2 py-0.5 text-[10px] font-bold text-cs-green">
                STABLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
