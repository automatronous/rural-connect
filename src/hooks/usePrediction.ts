import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Prediction } from '../types/database.types';
import type { PredictRequest } from '../types/api.types';


export function usePrediction() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync: runPrediction, isPending: predicting, data: predictionResult, reset } =
    useMutation({
      mutationFn: async (params: PredictRequest) => {
        if (!profile || profile.role !== 'doctor') throw new Error('Only doctors can run predictions');
        return api.predict(params);
      },
      onError: () => { /* removed toast */ },
    });

  const savePrediction = useMutation({
    mutationFn: async (pred: Omit<Prediction, 'id' | 'created_at' | 'doctor' | 'patient' | 'model_version'>) => {
      const { error } = await supabase.from('predictions').insert({
        ...pred,
        model_version: '1.0',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // removed toast
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
    onError: () => { /* removed toast */ },
  });

  return { runPrediction, predicting, predictionResult, reset, savePrediction: savePrediction.mutateAsync, saving: savePrediction.isPending };
}

export function usePatientPredictions(patientId?: string) {
  return useQuery({
    queryKey: ['predictions', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from('predictions')
        .select('*, doctor:doctor_id(name, email)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Prediction & { doctor: { name: string; email: string } })[];
    },
    enabled: !!patientId,
  });
}

export function useRecentPredictions() {
  return useQuery({
    queryKey: ['predictions', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*, patient:patient_id(name, age)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });
}
