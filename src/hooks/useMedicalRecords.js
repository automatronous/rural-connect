import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';


export function useMedicalRecords(patientId) {
  return useQuery({
    queryKey: ['medical_records', patientId],
    queryFn: async () => {
      const q = supabase
        .from('medical_records')
        .select('*, uploader:uploaded_by(name, role)')
        .order('created_at', { ascending: false });
      if (patientId) q.eq('patient_id', patientId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: patientId !== undefined || true,
  });
}

export function useUploadRecord() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      patientId,
      recordType,
      notes,
    }) => {
      if (!profile) throw new Error('Not authenticated');
      const timestamp = Date.now();
      const filePath = `${patientId}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('medical-records')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('medical_records').insert({
        patient_id: patientId,
        uploaded_by: profile.id,
        file_url: urlData.publicUrl,
        file_name: file.name,
        record_type: recordType,
        notes: notes || null,
        upload_date: new Date().toISOString().split('T')[0],
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      // removed toast
      queryClient.invalidateQueries({ queryKey: ['medical_records'] });
    },
    onError: () => { /* removed toast */ },
  });
}
