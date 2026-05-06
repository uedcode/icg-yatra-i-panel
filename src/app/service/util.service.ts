import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  // ---- DATE HELPERS ----
  toMillis(value: any): number {
    if (!value) return 0;

    if (typeof value === 'number') return value;

    const d = new Date(value);
    if (isNaN(d.getTime())) return 0;

    return d.getTime();
  }

  /**
   * Null / undefined / '' / whitespace check.
   */
  isNullOrEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  /**
   * Safe number conversion. Anything invalid → defaultValue (0 if not given).
   */
  toNumber(value: unknown, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const n = Number(value);
    return isNaN(n) ? defaultValue : n;
  }

  /**
   * Sum over an array column. Non-numeric entries are treated as 0.
   */
  sumOfColumn<T extends Record<string, any>>(
    arr: T[],
    key: keyof T,
    defaultValue: number = 0
  ): number {
    if (!Array.isArray(arr) || !arr.length) {
      return 0;
    }
    return arr.reduce((sum, item) => {
      return sum + this.toNumber(item?.[key as string], defaultValue);
    }, 0);
  }

  /**
   * Remove emojis / surrogate pairs from a string.
   */
  stripEmojis(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
  }

  /**
   * Simple deep clone via JSON (for DTOs only – no dates / functions).
   */
  clone<T>(obj: T): T {
    return obj == null ? obj : JSON.parse(JSON.stringify(obj));
  }

  /** Keep only digits (0-9). Useful for paste / input sanitizing */
  onlyDigits(value: any): string {
    return (value ?? '').toString().replace(/\D+/g, '');
  }

  /** True if the key is allowed in numeric-only input */
  isAllowedNumericKey(event: KeyboardEvent): boolean {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(event.key)) return true;

    // allow Ctrl/Command shortcuts (copy/paste/select all)
    if (event.ctrlKey || event.metaKey) return true;

    return /^\d$/.test(event.key);
  }

  /** True if pasted text contains only digits */
  isDigitsOnly(text: string): boolean {
    return /^\d+$/.test(text);
  }

  /** Parse positive integer, return null if invalid */
  parsePositiveInt(value: any): number | null {
    const s = (value ?? '').toString().trim();
    if (!/^\d+$/.test(s)) return null;
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }
}
