import { formatDate } from '@angular/common';

export const LEGACY_DATE_FORMATS = {
  queueDate: 'dd/MM/yyyy',
  formDate: 'dd-MMM-yyyy',
  voucherDate: 'dd/MM/yyyy',
  dateTime: 'dd-MMM-yyyy hh:mm a',
  dateTimeSeconds: 'dd-MMM-yyyy hh:mm:ss a',
  previewDate: 'd/MM/yyyy',
  previewDateTime: 'dd/MM/yyyy HH:mm',
  previewDateTimeSeconds: 'dd/MM/yyyy HH:mm:ss',
  inputDate: 'yyyy-MM-dd',
} as const;

export type LegacyDateFormatKey = keyof typeof LEGACY_DATE_FORMATS;

export function resolveLegacyDateFormat(format: string): string {
  return LEGACY_DATE_FORMATS[format as LegacyDateFormatKey] || format;
}

export function isLegacyBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined';
  }
  return false;
}

export function isLegacyFilterBlank(value: unknown): boolean {
  return value === null || value === undefined || value === '' || value === 0 || value === false;
}

export function legacyValue(value: unknown, fallback = '-'): string {
  if (isLegacyBlank(value)) return fallback;
  return String(value).trim();
}

export function legacyShowNil(value: unknown): string {
  return isLegacyFilterBlank(value) ? 'Nil' : String(value);
}

export function legacyShowHyphen(value: unknown): string {
  return isLegacyFilterBlank(value) ? '-' : String(value);
}

export function legacyShowZero(value: unknown): string {
  return isLegacyFilterBlank(value) ? '0' : String(value);
}

export function legacyDate(value: unknown, format = 'dd-MMM-yyyy', fallback = '-'): string {
  if (isLegacyBlank(value) || value === 0 || value === false) return fallback;
  try {
    const rawValue = typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))
      ? Number(value)
      : value;
    return formatDate(rawValue as string | number | Date, resolveLegacyDateFormat(format), 'en-US');
  } catch {
    return fallback;
  }
}

export function legacyDateTime(value: unknown, fallback = '-'): string {
  return legacyDate(value, 'dateTime', fallback);
}
