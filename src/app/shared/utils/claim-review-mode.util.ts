export const LEGACY_CLAIM_MODE = {
  yatra: 'YT',
  manual: 'MN',
} as const;

function normalizeClaimMode(value: any): string {
  return String(value ?? '').trim().toUpperCase();
}

export function isYatraClaimModeValue(value: any): boolean {
  const mode = normalizeClaimMode(value);
  return mode === LEGACY_CLAIM_MODE.yatra || mode === 'YATRA';
}

export function isManualClaimModeValue(value: any): boolean {
  const mode = normalizeClaimMode(value);
  return mode === LEGACY_CLAIM_MODE.manual || mode === 'MANUAL';
}
