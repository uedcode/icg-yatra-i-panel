import { LegacyDatePipe } from './legacy-date.pipe';
import { LegacyValuePipe } from './legacy-value.pipe';

describe('legacy display pipes', () => {
  it('renders legacy values with fallback while preserving zero', () => {
    const pipe = new LegacyValuePipe();
    expect(pipe.transform(0)).toBe('0');
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform('')).toBe('-');
    expect(pipe.transform('', 'Nil')).toBe('Nil');
    expect(pipe.transform('', '')).toBe('');
  });

  it('renders legacy dates with default and custom formats', () => {
    const pipe = new LegacyDatePipe();
    const date = new Date(2025, 11, 29);
    expect(pipe.transform(date)).toBe('29-Dec-2025');
    expect(pipe.transform(date, 'dd/MM/yyyy')).toBe('29/12/2025');
    expect(pipe.transform(null, 'dd-MMM-yyyy', '')).toBe('');
  });
});
