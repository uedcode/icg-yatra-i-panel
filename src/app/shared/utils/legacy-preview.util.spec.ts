import { isESign, isInkSign, isManualClaimMode, isYatraClaimMode, legacySignLabel } from './legacy-preview.util';

describe('legacy preview util', () => {
  it('detects sign modes', () => {
    expect(isInkSign('IS')).toBeTrue();
    expect(isInkSign('IK')).toBeTrue();
    expect(isInkSign('INK_SIGN')).toBeTrue();
    expect(isInkSign('ES')).toBeFalse();

    expect(isESign('ES')).toBeTrue();
    expect(isESign('E_SIGN')).toBeTrue();
    expect(isESign('eSignAlt')).toBeTrue();
    expect(isESign('IS')).toBeFalse();
  });

  it('detects claim modes and sign labels', () => {
    expect(isYatraClaimMode('YT')).toBeTrue();
    expect(isYatraClaimMode('Yatra')).toBeTrue();
    expect(isManualClaimMode('MN')).toBeTrue();
    expect(isManualClaimMode('Manual')).toBeTrue();

    expect(legacySignLabel('ES')).toBe('eSign');
    expect(legacySignLabel('IK')).toBe('Ink Sign');
    expect(legacySignLabel('')).toBe('');
  });
});
