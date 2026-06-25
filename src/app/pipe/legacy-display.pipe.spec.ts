import { LegacyDatePipe } from './legacy-date.pipe';
import { LegacyHyphenPipe } from './legacy-hyphen.pipe';
import { LegacyNilPipe } from './legacy-nil.pipe';
import { LegacyValuePipe } from './legacy-value.pipe';
import { LegacyZeroPipe } from './legacy-zero.pipe';

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
    expect(pipe.transform(date, 'queueDate')).toBe('29/12/2025');
    expect(pipe.transform(date, 'formDate')).toBe('29-Dec-2025');
    expect(pipe.transform(date, 'voucherDate')).toBe('29/12/2025');
    expect(pipe.transform(new Date(2025, 11, 29, 9, 30), 'dateTime')).toBe('29-Dec-2025 09:30 AM');
    expect(pipe.transform(null, 'dd-MMM-yyyy', '')).toBe('');
    expect(pipe.transform(0, 'previewDate', 'Nil')).toBe('Nil');
  });

  it('renders AngularJS legacy filter semantics for Nil, hyphen, and zero', () => {
    const nilPipe = new LegacyNilPipe();
    const hyphenPipe = new LegacyHyphenPipe();
    const zeroPipe = new LegacyZeroPipe();

    expect(nilPipe.transform(null)).toBe('Nil');
    expect(nilPipe.transform(undefined)).toBe('Nil');
    expect(nilPipe.transform('')).toBe('Nil');
    expect(nilPipe.transform(0)).toBe('Nil');
    expect(nilPipe.transform('0')).toBe('0');

    expect(hyphenPipe.transform(0)).toBe('-');
    expect(hyphenPipe.transform('0')).toBe('0');

    expect(zeroPipe.transform(null)).toBe('0');
    expect(zeroPipe.transform(0)).toBe('0');
    expect(zeroPipe.transform(25)).toBe('25');
  });
});
