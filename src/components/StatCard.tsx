import type { DashboardStat } from '../lib/types';

export function StatCard({ label, value, hint }: DashboardStat) {
  return (
    <div className="panel-card">
      <p className="text-sm uppercase tracking-[0.24em] text-white/50">{label}</p>
      <p className="heading-orbitron mt-4 text-3xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-white/60">{hint}</p> : null}
    </div>
  );
}
