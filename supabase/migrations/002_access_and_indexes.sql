-- Performance indexes for common dashboard and detail queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_created ON medical_records(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_uploaded_by ON medical_records(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_visits_patient_date ON visits(patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_doctor_date ON visits(doctor_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_patient_created ON predictions(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_doctor_created ON predictions(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_reports_disease_date ON disease_reports(disease_name, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_disease_reports_reported_by ON disease_reports(reported_by);

-- Let patients read doctor profiles only when those doctors are already linked
-- to the patient's visits or uploaded medical records.
DROP POLICY IF EXISTS "patient_related_doctors" ON profiles;
CREATE POLICY "patient_related_doctors" ON profiles
  FOR SELECT USING (
    role = 'doctor'
    AND (
      EXISTS (
        SELECT 1
        FROM visits v
        WHERE v.doctor_id = profiles.id
          AND v.patient_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM medical_records mr
        WHERE mr.uploaded_by = profiles.id
          AND mr.patient_id = auth.uid()
      )
    )
  );

-- Ensure the required public storage bucket exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-records', 'medical-records', true)
ON CONFLICT (id) DO NOTHING;

-- Public downloads for uploaded records.
DROP POLICY IF EXISTS "public_read_medical_records" ON storage.objects;
CREATE POLICY "public_read_medical_records" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-records');

-- Patients upload to their own folder, doctors upload for any patient.
DROP POLICY IF EXISTS "authenticated_upload_medical_records" ON storage.objects;
CREATE POLICY "authenticated_upload_medical_records" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'medical-records'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'doctor'
      )
    )
  );
