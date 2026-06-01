import { normalizeSidebarCounts } from './sidebar-count.util';

describe('normalizeSidebarCounts', () => {
  it('maps ADV legacy dto keys to normalized keys', () => {
    const result = normalizeSidebarCounts({
      inboxCount: 1,
      outboxCount: 2,
      draftCount: 3,
      approvedCount: 4,
      notApprovedCount: 5,
      passedCount: 6,
      notPassedCount: 7,
      archiveCount: 8,
    });

    expect(result.inbox).toBe(1);
    expect(result.outbox).toBe(2);
    expect(result.draft).toBe(3);
    expect(result.approved).toBe(4);
    expect(result.rejected).toBe(5);
    expect(result.passed).toBe(6);
    expect(result.notPassed).toBe(7);
    expect(result.archive).toBe(8);
  });

  it('maps CLM legacy dto keys to normalized keys', () => {
    const result = normalizeSidebarCounts({
      newClaimCount: 1,
      inboxClaimCount: 2,
      outboxClaimCount: 3,
      draftClaimCount: 4,
      approvedClaimCount: 5,
      notApprovedClaimCount: 6,
      passedClaimCount: 7,
      notPassedClaimCount: 8,
      archiveClaimCount: 9,
    });

    expect(result.newClaim).toBe(1);
    expect(result.inboxClaim).toBe(2);
    expect(result.outboxClaim).toBe(3);
    expect(result.draftClaim).toBe(4);
    expect(result.approvedClaim).toBe(5);
    expect(result.notApprovedClaim).toBe(6);
    expect(result.passedClaim).toBe(7);
    expect(result.notPassedClaim).toBe(8);
    expect(result.archiveClaim).toBe(9);
  });

  it('returns zero defaults for null/partial payload', () => {
    const result = normalizeSidebarCounts({ inboxCount: null });
    expect(result.inbox).toBe(0);
    expect(result.approved).toBe(0);
    expect(result.inboxClaim).toBe(0);
    expect(result.archiveClaim).toBe(0);
  });

  it('supports array payload shape from legacy response.object[0]', () => {
    const result = normalizeSidebarCounts([
      { approvedCount: 3, approvedClaimCount: 5 },
    ]);
    expect(result.approved).toBe(3);
    expect(result.approvedClaim).toBe(5);
  });
});
