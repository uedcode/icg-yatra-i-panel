import { isLegacyBlank, legacyDate, legacyDateTime, legacyValue } from './legacy-display.util';

describe('legacy display utils', () => {
  it('detects legacy blank values without treating zero as blank', () => {
    expect(isLegacyBlank(null)).toBeTrue();
    expect(isLegacyBlank(undefined)).toBeTrue();
    expect(isLegacyBlank('')).toBeTrue();
    expect(isLegacyBlank('   ')).toBeTrue();
    expect(isLegacyBlank('null')).toBeTrue();
    expect(isLegacyBlank('undefined')).toBeTrue();
    expect(isLegacyBlank(0)).toBeFalse();
  });

  it('formats display values with configurable fallback', () => {
    expect(legacyValue(0)).toBe('0');
    expect(legacyValue(null)).toBe('-');
    expect(legacyValue('')).toBe('-');
    expect(legacyValue('   abc   ')).toBe('abc');
    expect(legacyValue(undefined, 'Nil')).toBe('Nil');
    expect(legacyValue('', '')).toBe('');
  });

  it('formats dates with default and custom formats', () => {
    const date = new Date(2025, 11, 29);
    expect(legacyDate(date)).toBe('29-Dec-2025');
    expect(legacyDate(date, 'dd/MM/yyyy')).toBe('29/12/2025');
    expect(legacyDate(null)).toBe('-');
    expect(legacyDate('', 'dd/MM/yyyy', '')).toBe('');
  });

  it('formats date times', () => {
    const date = new Date(2025, 11, 29, 9, 30);
    expect(legacyDateTime(date)).toBe('29-Dec-2025 09:30');
  });
});
