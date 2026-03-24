import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Visit } from '../types/database.types';
import { useAuth } from '../context/AuthContext';


export function useVisits(patientId?: string) {
  return useQuery({
    queryKey: ['visits', patientId],
    queryFn: async () => {
      const q = supabase
        .from('visits')
        .select('*, doctor:doctor_id(name, email)')
        .order('visit_date', { ascending: false });
      if (patientId) q.eq('patient_id', patientId);
      const { data, error } = await q;
      if (error) throw error;
      return data as (Visit & { doctor: { name: string; email: string } })[];
    },
  });
}

export function useAddVisit() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      visitDate,
      notes,
      diagnosisNotes,
    }: {
      patientId: string;
      visitDate: string;
      notes: string;
      diagnosisNotes: string;
    }) => {
      if (!profile || profile.role !== 'doctor') throw new Error('Only doctors can add visits');
      const { error } = await supabase.from('visits').insert({
        patient_id: patientId,
        doctor_id: profile.id,
        visit_date: visitDate,
        notes: notes || null,
        diagnosis_notes: diagnosisNotes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // removed toast
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: () => { /* removed toast */ },
  });
}
