export function LoadingScreen({ label = 'Loading RuralConnect...' }: { label?: string }) {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="panel-card flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
        <p className="heading-orbitron text-xl text-white">{label}</p>
      </div>
    </div>
  );
}
