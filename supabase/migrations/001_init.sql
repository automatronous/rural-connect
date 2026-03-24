-- ============================================================
-- RuralConnect — Full Schema, RLS Policies, Seed Data
-- ============================================================

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text CHECK (role IN ('patient','doctor')) NOT NULL,
  age int,
  blood_group text,
  allergies text,
  created_at timestamptz DEFAULT now()
);

-- medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id),
  file_url text,
  file_name text,
  record_type text,
  upload_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES profiles(id),
  visit_date date DEFAULT CURRENT_DATE,
  notes text,
  diagnosis_notes text,
  created_at timestamptz DEFAULT now()
);

-- predictions table (doctors only)
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES profiles(id),
  symptoms_input text[],
  predicted_disease text,
  confidence float,
  top3 jsonb,
  model_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

-- disease_reports table
CREATE TABLE IF NOT EXISTS disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name text NOT NULL,
  region_name text NOT NULL,
  lat float NOT NULL,
  lng float NOT NULL,
  case_count int NOT NULL,
  report_date date DEFAULT CURRENT_DATE,
  reported_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles RLS policies
-- ============================================================
DROP POLICY IF EXISTS "own_profile_select" ON profiles;
CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "doctor_select_all_profiles" ON profiles;
CREATE POLICY "doctor_select_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'doctor')
  );

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- medical_records RLS policies
-- ============================================================
DROP POLICY IF EXISTS "patient_own_records_select" ON medical_records;
CREATE POLICY "patient_own_records_select" ON medical_records
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctor_all_records" ON medical_records;
CREATE POLICY "doctor_all_records" ON medical_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'doctor')
  );

DROP POLICY IF EXISTS "patient_insert_own_record" ON medical_records;
CREATE POLICY "patient_insert_own_record" ON medical_records
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- ============================================================
-- visits RLS policies
-- ============================================================
DROP POLICY IF EXISTS "patient_own_visits" ON visits;
CREATE POLICY "patient_own_visits" ON visits
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctor_all_visits" ON visits;
CREATE POLICY "doctor_all_visits" ON visits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'doctor')
  );

-- ============================================================
-- predictions RLS: DOCTORS ONLY — zero patient access
-- ============================================================
DROP POLICY IF EXISTS "doctor_only_predictions" ON predictions;
CREATE POLICY "doctor_only_predictions" ON predictions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'doctor')
  );

-- ============================================================
-- disease_reports RLS: everyone reads, only doctors write
-- ============================================================
DROP POLICY IF EXISTS "anyone_read_reports" ON disease_reports;
CREATE POLICY "anyone_read_reports" ON disease_reports
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "doctor_insert_reports" ON disease_reports;
CREATE POLICY "doctor_insert_reports" ON disease_reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'doctor')
  );

-- ============================================================
-- Auto-create profile on signup (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Seed Data: 20 Indian disease report points
-- ============================================================
INSERT INTO disease_reports (disease_name, region_name, lat, lng, case_count, report_date) VALUES
('Dengue',       'Mumbai',        19.076, 72.877, 342, '2024-01-15'),
('Dengue',       'Delhi',         28.704, 77.102, 289, '2024-01-15'),
('Dengue',       'Chennai',       13.082, 80.270, 198, '2024-01-15'),
('Malaria',      'Kolkata',       22.572, 88.363, 156, '2024-01-15'),
('Malaria',      'Bhopal',        23.259, 77.412, 203, '2024-01-15'),
('Malaria',      'Patna',         25.594, 85.137, 312, '2024-01-15'),
('Tuberculosis', 'Ahmedabad',     23.022, 72.571,  89, '2024-01-15'),
('Tuberculosis', 'Lucknow',       26.846, 80.946, 134, '2024-01-15'),
('Tuberculosis', 'Jaipur',        26.912, 75.787,  78, '2024-01-15'),
('Typhoid',      'Hyderabad',     17.385, 78.486, 167, '2024-01-15'),
('Typhoid',      'Pune',          18.520, 73.856, 143, '2024-01-15'),
('Typhoid',      'Nagpur',        21.145, 79.088,  98, '2024-01-15'),
('Pneumonia',    'Surat',         21.170, 72.831,  55, '2024-01-15'),
('Pneumonia',    'Kanpur',        26.449, 80.331,  87, '2024-01-15'),
('Hepatitis B',  'Visakhapatnam', 17.686, 83.218,  44, '2024-01-15'),
('Hepatitis B',  'Indore',        22.719, 75.857,  38, '2024-01-15'),
('Diabetes',     'Bangalore',     12.971, 77.594, 456, '2024-01-15'),
('Diabetes',     'Coimbatore',    11.016, 76.955, 321, '2024-01-15'),
('Common Cold',  'Shimla',        31.104, 77.172, 234, '2024-01-15'),
('Common Cold',  'Dehradun',      30.316, 78.032, 189, '2024-01-15')
ON CONFLICT DO NOTHING;
