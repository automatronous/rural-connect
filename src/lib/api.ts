import type { PredictRequest, PredictResponse, SymptomsResponse, DiseasesResponse, HealthResponse } from '../types/api.types';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL as string;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${FASTAPI_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  predict: (body: PredictRequest): Promise<PredictResponse> =>
    apiFetch<PredictResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getSymptoms: (): Promise<SymptomsResponse> =>
    apiFetch<SymptomsResponse>('/symptoms'),

  getDiseases: (): Promise<DiseasesResponse> =>
    apiFetch<DiseasesResponse>('/diseases'),

  health: (): Promise<HealthResponse> =>
    apiFetch<HealthResponse>('/health'),
};
