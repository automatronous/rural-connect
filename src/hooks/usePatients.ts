import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';


export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function usePatient(patientId?: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!patientId,
  });
}

export function usePatientsWithStats() {
  return useQuery({
    queryKey: ['patients_with_stats'],
    queryFn: async () => {
      const { data: patients, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const patientsWithStats = await Promise.all(
        (patients as Profile[]).map(async (p) => {
          const { data: lastVisit } = await supabase
            .from('visits')
            .select('visit_date, diagnosis_notes')
            .eq('patient_id', p.id)
            .order('visit_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: lastPred } = await supabase
            .from('predictions')
            .select('predicted_disease')
            .eq('patient_id', p.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...p,
            last_visit_date: lastVisit?.visit_date ?? null,
            last_predicted_disease: lastPred?.predicted_disease ?? null,
          };
        })
      );
      return patientsWithStats;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // removed toast
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
    onError: () => { /* removed toast */ },
  });
}
