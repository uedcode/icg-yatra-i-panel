export interface SidebarCounts {
  inbox: number;
  outbox: number;
  draft: number;
  approved: number;
  rejected: number;
  passed: number;
  notPassed: number;
  archive: number;
  newClaim: number;
  inboxClaim: number;
  outboxClaim: number;
  draftClaim: number;
  approvedClaim: number;
  notApprovedClaim: number;
  passedClaim: number;
  notPassedClaim: number;
  archiveClaim: number;
}

const toCount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const pick = (source: any, ...keys: string[]): number => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return toCount(source[key]);
    }
  }
  return 0;
};

export const DEFAULT_SIDEBAR_COUNTS: SidebarCounts = {
  inbox: 0,
  outbox: 0,
  draft: 0,
  approved: 0,
  rejected: 0,
  passed: 0,
  notPassed: 0,
  archive: 0,
  newClaim: 0,
  inboxClaim: 0,
  outboxClaim: 0,
  draftClaim: 0,
  approvedClaim: 0,
  notApprovedClaim: 0,
  passedClaim: 0,
  notPassedClaim: 0,
  archiveClaim: 0,
};

export function normalizeSidebarCounts(raw: any): SidebarCounts {
  const source = Array.isArray(raw) ? raw[0] : raw;

  return {
    inbox: pick(source, 'inbox', 'inboxCount'),
    outbox: pick(source, 'outbox', 'outboxCount'),
    draft: pick(source, 'draft', 'draftCount'),
    approved: pick(source, 'approved', 'approvedCount'),
    rejected: pick(source, 'rejected', 'notApproved', 'notApprovedCount'),
    passed: pick(source, 'passed', 'passedCount'),
    notPassed: pick(source, 'notPassed', 'notPassedCount'),
    archive: pick(source, 'archive', 'archiveCount'),
    newClaim: pick(source, 'newClaim', 'newClaimCount'),
    inboxClaim: pick(source, 'inboxClaim', 'inboxClaimCount'),
    outboxClaim: pick(source, 'outboxClaim', 'outboxClaimCount'),
    draftClaim: pick(source, 'draftClaim', 'draftClaimCount'),
    approvedClaim: pick(source, 'approvedClaim', 'approvedClaimCount'),
    notApprovedClaim: pick(source, 'notApprovedClaim', 'notApprovedClaimCount'),
    passedClaim: pick(source, 'passedClaim', 'passedClaimCount'),
    notPassedClaim: pick(source, 'notPassedClaim', 'notPassedClaimCount'),
    archiveClaim: pick(source, 'archiveClaim', 'archiveClaimCount'),
  };
}
