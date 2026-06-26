export function isInkSign(signWith: unknown): boolean {
  return ['IS', 'IK', 'INK_SIGN'].includes(String(signWith ?? '').toUpperCase());
}

export function isESign(signWith: unknown): boolean {
  return ['ES', 'E_SIGN', 'ESIGNAL', 'ESIGNALT'].includes(String(signWith ?? '').toUpperCase());
}

export function isYatraClaimMode(claimMode: unknown): boolean {
  return ['YT', 'YATRA'].includes(String(claimMode ?? '').toUpperCase());
}

export function isManualClaimMode(claimMode: unknown): boolean {
  return ['MN', 'MANUAL'].includes(String(claimMode ?? '').toUpperCase());
}

export function legacySignLabel(signWith: unknown): string {
  if (isESign(signWith)) {
    return 'eSign';
  }
  if (isInkSign(signWith)) {
    return 'Ink Sign';
  }
  return '';
}

export function normalizePreviewSubFormId(subFormId: unknown): string {
  const id = String(subFormId ?? '').toUpperCase();
  if (id === 'P' || id === 'PMTA' || id === 'PMT') return 'PMT';
  if (id === 'T' || id === 'TYA' || id === 'TY' || id === 'TYD') return 'TYD';
  if (id === 'F' || id === 'FTEA' || id === 'FTE') return 'FTE';
  if (id === 'L' || id === 'LTCA' || id === 'LTC') return 'LTC';
  if (id === 'RS' || id === 'RES' || id === 'R') return 'RS';
  return String(subFormId ?? '');
}
