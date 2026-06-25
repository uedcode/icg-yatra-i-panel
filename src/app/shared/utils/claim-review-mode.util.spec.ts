import { isManualClaimModeValue, isYatraClaimModeValue } from './claim-review-mode.util';

describe('claim review mode util', () => {
  it('recognizes legacy yatra claim mode code and display value', () => {
    expect(isYatraClaimModeValue('YT')).toBeTrue();
    expect(isYatraClaimModeValue('Yatra')).toBeTrue();
    expect(isYatraClaimModeValue(' yatra ')).toBeTrue();
  });

  it('recognizes legacy manual claim mode code and display value', () => {
    expect(isManualClaimModeValue('MN')).toBeTrue();
    expect(isManualClaimModeValue('Manual')).toBeTrue();
    expect(isManualClaimModeValue(' manual ')).toBeTrue();
  });

  it('does not mix claim mode types', () => {
    expect(isYatraClaimModeValue('MN')).toBeFalse();
    expect(isManualClaimModeValue('YT')).toBeFalse();
    expect(isYatraClaimModeValue(null)).toBeFalse();
    expect(isManualClaimModeValue(undefined)).toBeFalse();
  });
});
