import { asArray, firstItem, hasAnyLegacyValue, isLegacyPresent, unwrapNullablePreviewObject, unwrapPreviewObject } from './legacy-preview-data.util';

describe('legacy preview data util', () => {
  it('normalizes first item and preview object values', () => {
    expect(firstItem([{ id: 1 }])).toEqual({ id: 1 });
    expect(firstItem([])).toEqual({});
    expect(firstItem({ id: 2 })).toEqual({ id: 2 });
    expect(firstItem(null)).toEqual({});

    expect(unwrapPreviewObject([{ id: 3 }])).toEqual({ id: 3 });
    expect(unwrapPreviewObject(undefined)).toEqual({});
  });

  it('normalizes nullable preview values', () => {
    expect(unwrapNullablePreviewObject([{ id: 1 }])).toEqual({ id: 1 });
    expect(unwrapNullablePreviewObject([])).toBeNull();
    expect(unwrapNullablePreviewObject(null)).toBeNull();
    expect(unwrapNullablePreviewObject({ id: 2 })).toEqual({ id: 2 });
  });

  it('normalizes arrays and presence checks with legacy blank rules', () => {
    expect(asArray([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(asArray({ id: 2 })).toEqual([{ id: 2 }]);
    expect(asArray(null)).toEqual([]);
    expect(asArray('')).toEqual([]);

    expect(isLegacyPresent(0)).toBeTrue();
    expect(isLegacyPresent(false)).toBeTrue();
    expect(isLegacyPresent('null')).toBeFalse();
    expect(hasAnyLegacyValue('', null, 'A')).toBeTrue();
    expect(hasAnyLegacyValue('', null, undefined)).toBeFalse();
  });
});
