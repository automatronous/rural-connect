import {
  DISEASE_COLORS,
  FALLBACK_DISEASE_COLORS,
  SYMPTOM_CATEGORY_KEYS,
  SYMPTOM_CATEGORY_ORDER,
} from './constants';

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatLabel(raw: string) {
  return raw
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeSymptomKey(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getSymptomCategory(raw: string) {
  const normalized = normalizeSymptomKey(raw);
  const category = SYMPTOM_CATEGORY_ORDER.find((entry) =>
    SYMPTOM_CATEGORY_KEYS[entry].includes(normalized),
  );
  return category ?? 'General';
}

export function getDiseaseColor(disease: string) {
  if (DISEASE_COLORS[disease]) {
    return DISEASE_COLORS[disease];
  }

  const hash = Array.from(disease).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_DISEASE_COLORS[hash % FALLBACK_DISEASE_COLORS.length];
}

export function normalizeConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 1) return Number((value * 100).toFixed(1));
  return Number(value.toFixed(1));
}

export function truncate(value: string | null | undefined, maxLength = 80) {
  if (!value) return 'N/A';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}
