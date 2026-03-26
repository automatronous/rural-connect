import { useEffect, useState } from 'react';
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
    <DiseaseHeatmap
      title="Doctor Heatmap"
      description="Monitor public disease spread, drop new case reports, and let Supabase Realtime update every connected map view instantly."
      allowReporting
      doctorId={user?.id}
      diseaseOptions={diseases}
    />
  );
}
