import { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { RecordsSection } from '../../components/RecordsSection';
import { useAuth } from '../../context/AuthContext';
import { fetchMedicalRecords, uploadMedicalRecord } from '../../lib/data';
import type { MedicalRecordView } from '../../lib/types';

export default function PatientRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecordView[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    if (!user) return;
    const nextRecords = await fetchMedicalRecords(user.id, user.id);
    setRecords(nextRecords);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    void loadRecords()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load records.'))
      .finally(() => setLoading(false));
  }, [loadRecords, user]);

  async function handleUpload(payload: { file: File; recordType: string; notes: string }) {
    if (!user) return;

    setUploading(true);
    setError(null);

    try {
      await uploadMedicalRecord({
        file: payload.file,
        patientId: user.id,
        uploadedBy: user.id,
        recordType: payload.recordType,
        notes: payload.notes,
      });
      await loadRecords();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading records..." />;
  }

  return (
    <div className="space-y-6">
      {error ? <div className="panel-card text-red-300">{error}</div> : null}
      <RecordsSection
        title="Medical Records"
        description="Upload PDFs or images into the real Supabase storage bucket and review your full record timeline."
        records={records}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </div>
  );
}
