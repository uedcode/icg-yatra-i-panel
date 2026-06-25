import { isLegacyBlank } from './legacy-display.util';

export function firstItem<T = any>(value: T[] | T | null | undefined): T | Record<string, never> {
  if (Array.isArray(value)) {
    return value[0] ?? {};
  }
  return isLegacyBlank(value) ? {} : value;
}

export function asArray<T = any>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return isLegacyBlank(value) ? [] : [value as T];
}

export function isLegacyPresent(value: unknown): boolean {
  return !isLegacyBlank(value);
}

export function unwrapPreviewObject<T = any>(value: T[] | T | null | undefined): T | Record<string, never> {
  return firstItem(value);
}

export function unwrapNullablePreviewObject<T = any>(value: T[] | T | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return isLegacyBlank(value) ? null : value;
}

export function hasAnyLegacyValue(...values: unknown[]): boolean {
  return values.some(isLegacyPresent);
}
