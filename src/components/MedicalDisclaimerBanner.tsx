import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function MedicalDisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="flex items-start gap-4 rounded-[24px] border border-amber-200 bg-cs-warning-light px-5 py-4 text-cs-ink shadow-cs">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-cs-warning">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-cs-warning">Medical Disclaimer</p>
        <p className="mt-1 text-sm leading-6 text-cs-ink-secondary">
          This AI tool is for informational purposes only. AI can make mistakes. Always consult a qualified medical
          professional before making any clinical decisions. Do not rely solely on these predictions for diagnosis or
          treatment.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded-full p-2 text-cs-warning transition-colors hover:bg-amber-100"
        aria-label="Dismiss medical disclaimer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
