-- Doctor-only live patient location feed for the dashboard heatmap
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  intensity double precision NOT NULL DEFAULT 0.8 CHECK (intensity > 0 AND intensity <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_role text NOT NULL CHECK (user_role IN ('patient', 'doctor'))
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations FORCE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_locations_user_role_created_at
  ON public.locations (user_role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_locations_user_id_created_at
  ON public.locations (user_id, created_at DESC);

DROP POLICY IF EXISTS "doctor_select_patient_locations" ON public.locations;
CREATE POLICY "doctor_select_patient_locations" ON public.locations
  FOR SELECT TO authenticated
  USING (
    user_role = 'patient'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'doctor'
    )
  );

DROP POLICY IF EXISTS "patient_insert_own_location" ON public.locations;
CREATE POLICY "patient_insert_own_location" ON public.locations
  FOR INSERT TO authenticated
  WITH CHECK (
    user_role = 'patient'
    AND user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'patient'
    )
  );

CREATE OR REPLACE FUNCTION public.add_test_patient_location()
RETURNS public.locations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_location public.locations;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'doctor'
  ) THEN
    RAISE EXCEPTION 'Only doctors can add test patient locations.';
  END IF;

  INSERT INTO public.locations (user_id, lat, lng, intensity, user_role)
  VALUES (
    NULL,
    19.0760 + ((random() - 0.5) * 0.22),
    72.8777 + ((random() - 0.5) * 0.24),
    round((0.62 + (random() * 0.35))::numeric, 2)::double precision,
    'patient'
  )
  RETURNING * INTO inserted_location;

  RETURN inserted_location;
END;
$$;

REVOKE ALL ON FUNCTION public.add_test_patient_location() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_test_patient_location() TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END;
$$;
