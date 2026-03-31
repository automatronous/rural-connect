import type { DashboardStat } from '../lib/types';

interface StatCardProps extends DashboardStat {
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accentDot?: string;
}

export function StatCard({ label, value, hint, icon, trend, trendUp, accentDot }: StatCardProps) {
  return (
    <div className="panel-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cs-primary-light text-cs-primary">
            {icon}
          </div>
        ) : null}
        {trend ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              trendUp ? 'bg-cs-green-light text-cs-green' : 'bg-cs-error-light text-cs-error'
            }`}
          >
            {trendUp ? 'Up' : 'Down'} {trend}
          </span>
        ) : null}
      </div>

      <div className="flex items-end gap-2">
        <p className="font-display text-3xl font-bold text-cs-ink">{value}</p>
        {accentDot ? (
          <span className="mb-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: accentDot }} />
        ) : null}
      </div>

      <p className="text-sm text-cs-ink-secondary">{label}</p>
      {hint ? <p className="text-xs text-cs-ink-secondary/70">{hint}</p> : null}
    </div>
  );
}
