import { useEffect, useState } from 'react';
import { AlertTriangle, Info, TrendingDown } from 'lucide-react';
import DiseaseHeatmap from '../../components/DiseaseHeatmap';
import { useAuth } from '../../context/AuthContext';
import { getDiseases } from '../../lib/api';

export default function DoctorHeatmap() {
  const { user } = useAuth();
  const [diseases, setDiseases] = useState<string[]>([]);

  useEffect(() => {
    void getDiseases().then(setDiseases).catch(() => setDiseases([]));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="font-display text-2xl font-bold text-cs-ink">Disease Heatmap</h1>

      {/* Disease & Time Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {['Malaria', 'Dengue', 'Flu'].map((disease, i) => (
            <button
              key={disease}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                i === 0
                  ? 'bg-cs-primary text-white'
                  : 'bg-cs-surface-high text-cs-ink-secondary hover:bg-cs-surface-highest'
              }`}
            >
              {disease}
            </button>
          ))}
        </div>

        <div className="flex gap-2 rounded-full bg-cs-surface-low p-1">
          {['Last 24h', '7 Days', '30 Days'].map((period, i) => (
            <button
              key={period}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                i === 1
                  ? 'bg-white text-cs-ink shadow-sm'
                  : 'text-cs-ink-secondary hover:text-cs-ink'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* KPI Badges */}
        <div className="ml-auto flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Total Cases</p>
            <p className="font-display text-2xl font-bold text-cs-ink">1,284</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Active Hotspots</p>
            <p className="font-display text-2xl font-bold text-cs-error">12</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        {/* Map */}
        <div>
          <DiseaseHeatmap
            title="Doctor Heatmap"
            description="Monitor public disease spread, drop new case reports, and let Supabase Realtime update every connected map view instantly."
            allowReporting
            doctorId={user?.id}
            diseaseOptions={diseases}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Regional Risk */}
          <div className="panel-card">
            <h3 className="font-display text-base font-bold text-cs-ink">Regional Risk</h3>
            <div className="mt-4 space-y-4">
              {[
                { name: 'District A (North)', cases: 124, trend: '4%', up: true, dot: '#ff8800' },
                { name: 'Sector 4 (Central)', cases: 328, trend: '12%', up: true, dot: '#ba1a1a' },
                { name: 'Western Plains', cases: 12, trend: '18%', up: false, dot: '#2b5bb5' },
              ].map((region) => (
                <div key={region.name} className="flex items-center gap-3">
                  <div className="h-10 w-1 rounded-full" style={{ backgroundColor: region.dot }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-cs-ink">{region.name}</p>
                    <p className="text-xs text-cs-ink-secondary">{region.cases} active cases</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        region.up
                          ? 'bg-cs-error-light text-cs-error'
                          : 'bg-cs-green-light text-cs-green'
                      }`}
                    >
                      {region.up ? '↑' : '↓'}{region.trend}
                    </span>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: region.dot }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cs-ink-secondary">Active Alerts</p>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cs-error text-[10px] font-bold text-white">
                2
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="alert-card-danger">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cs-error" />
                  <div>
                    <h4 className="text-sm font-bold text-cs-ink">Outbreak Detected</h4>
                    <p className="mt-1 text-xs text-cs-ink-secondary">
                      High mosquito activity in Sector 4. Please distribute nets and clear stagnant water.
                    </p>
                    <button type="button" className="mt-2 w-full rounded-lg bg-white py-2 text-xs font-semibold text-cs-ink shadow-sm">
                      View Action Plan
                    </button>
                  </div>
                </div>
              </div>

              <div className="alert-card-info">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-cs-tint" />
                  <div>
                    <h4 className="text-sm font-bold text-cs-ink">Supplies Alert</h4>
                    <p className="mt-1 text-xs text-cs-ink-secondary">
                      Vaccine storage in Western Plains reaching 20% capacity. Restock scheduled for Tuesday.
                    </p>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-lg py-2 text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #003178, #0d47a1)' }}
                    >
                      Confirm Logistics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transmission Trend Summary */}
      <div className="panel-card">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-cs-ink md:text-3xl">
              <span className="text-cs-primary">Transmission slowing down.</span>
            </h2>
            <p className="mt-2 text-sm text-cs-ink-secondary">
              Community health initiatives in the North have resulted in a{' '}
              <span className="font-bold text-cs-green">22% decrease</span>{' '}
              in reported symptoms this week.
            </p>
          </div>
          <div className="hidden items-end gap-1 md:flex">
            {[35, 45, 55, 65, 80].map((h, i) => (
              <div
                key={i}
                className="w-7 rounded-t-md"
                style={{
                  height: `${h}px`,
                  backgroundColor: i === 4 ? '#1b6d24' : '#dce4f5',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
