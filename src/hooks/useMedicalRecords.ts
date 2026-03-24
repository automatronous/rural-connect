import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { MedicalRecord } from '../types/database.types';
import toast from 'react-hot-toast';

export function useMedicalRecords(patientId?: string) {
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
      return data as (MedicalRecord & { uploader: { name: string; role: string } })[];
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
    }: {
      file: File;
      patientId: string;
      recordType: string;
      notes: string;
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
      toast.success('File uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['medical_records'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Upload failed'),
  });
}
