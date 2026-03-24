import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DiseaseReport } from '../types/database.types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useDiseaseReports() {
  const queryClient = useQueryClient();
  const [realtimeCount, setRealtimeCount] = useState(0);

  const query = useQuery({
    queryKey: ['disease_reports', realtimeCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disease_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DiseaseReport[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('disease_reports_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'disease_reports' },
        (payload) => {
          queryClient.setQueryData(
            ['disease_reports', realtimeCount],
            (old: DiseaseReport[] | undefined) => [payload.new as DiseaseReport, ...(old ?? [])]
          );
          setRealtimeCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, realtimeCount]);

  return query;
}

export function useAddDiseaseReport() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Omit<DiseaseReport, 'id' | 'created_at' | 'reported_by'>) => {
      if (!profile || profile.role !== 'doctor') throw new Error('Only doctors can add reports');
      const { error } = await supabase.from('disease_reports').insert({
        ...report,
        reported_by: profile.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Disease report added to map!');
      queryClient.invalidateQueries({ queryKey: ['disease_reports'] });
    },
    onError: () => toast.error('Failed to add report'),
  });
}
