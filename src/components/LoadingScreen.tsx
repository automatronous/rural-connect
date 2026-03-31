export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cs-surface-high border-t-cs-primary" />
      <p className="text-sm font-medium text-cs-ink-secondary">{label}</p>
    </div>
  );
}
