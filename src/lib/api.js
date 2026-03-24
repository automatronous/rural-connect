const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL;

async function apiFetch(path, options) {
  const url = `${FASTAPI_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

export const api = {
  predict: (body) =>
    apiFetch('/predict', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getSymptoms: () =>
    apiFetch('/symptoms'),

  getDiseases: () =>
    apiFetch('/diseases'),

  health: () =>
    apiFetch('/health'),
};
