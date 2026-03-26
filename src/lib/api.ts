import type { PredictionApiResponse } from './types';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${FASTAPI_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `FastAPI request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getSymptoms(): Promise<string[]> {
  const response = await apiFetch<{ symptoms: string[] }>('/symptoms');
  return response.symptoms;
}

export async function getDiseases(): Promise<string[]> {
  const response = await apiFetch<{ diseases: string[] }>('/diseases');
  return response.diseases;
}

export async function predictDisease(
  symptoms: string[],
  patientId: string,
  doctorId: string,
): Promise<PredictionApiResponse> {
  return apiFetch<PredictionApiResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify({
      symptoms,
      patient_id: patientId,
      doctor_id: doctorId,
    }),
  });
}
