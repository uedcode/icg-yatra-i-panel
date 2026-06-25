import { formatDate } from '@angular/common';

export function isLegacyBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined';
  }
  return false;
}

export function legacyValue(value: unknown, fallback = '-'): string {
  if (isLegacyBlank(value)) return fallback;
  return String(value).trim();
}

export function legacyDate(value: unknown, format = 'dd-MMM-yyyy', fallback = '-'): string {
  if (isLegacyBlank(value)) return fallback;
  try {
    const rawValue = typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))
      ? Number(value)
      : value;
    return formatDate(rawValue as string | number | Date, format, 'en-US');
  } catch {
    return fallback;
  }
}

export function legacyDateTime(value: unknown, fallback = '-'): string {
  return legacyDate(value, 'dd-MMM-yyyy HH:mm', fallback);
}
