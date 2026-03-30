import { Link } from 'react-router-dom';

export default function PatientRecords() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-cs-ink">Medical Records</h1>
      <div className="panel-card">
        <p className="text-cs-ink-secondary">
          Upload and manage your medical records securely. All files are encrypted and stored with Supabase.
        </p>
        <Link to="/patient/dashboard" className="primary-button mt-4 inline-block text-center">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
