export interface LegacyCountHeadersInput {
  userId?: string;
  roleTypeId?: string;
  unitId?: string;
  gxUnitId?: string;
}

export interface LegacyCountHeaderRoles {
  verifier?: string;
  verifier1?: string;
  verifier2?: string;
  approver?: string;
}

export interface LegacyClaimStateHeadersInput extends LegacyCountHeadersInput {
  claimState?: string;
  formId?: string;
  isArchive?: string;
  searchFormId?: string;
  pno?: string;
  searchedName?: string;
}

export function buildLegacyStateCountHeaders(
  user: LegacyCountHeadersInput,
  roles: LegacyCountHeaderRoles = {}
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (user?.userId) {
    headers.userId = String(user.userId);
  }
  if (user?.roleTypeId) {
    headers.roleTypeId = String(user.roleTypeId);
  }

  const roleTypeId = String(user?.roleTypeId || '');
  const isVerifierFlow =
    roleTypeId === String(roles?.verifier || '') ||
    roleTypeId === String(roles?.verifier1 || '') ||
    roleTypeId === String(roles?.verifier2 || '') ||
    roleTypeId === String(roles?.approver || '');

  if (isVerifierFlow) {
    headers.gxUnitId = String(user?.gxUnitId || user?.unitId || '');
  } else if (user?.unitId) {
    headers.unitId = String(user.unitId);
  }

  return headers;
}

export function buildLegacyClaimStateHeaders(
  input: LegacyClaimStateHeadersInput,
  roles: LegacyCountHeaderRoles = {}
): Record<string, string> {
  const headers = buildLegacyStateCountHeaders(input, roles);

  if (input?.claimState !== undefined) {
    headers.claimState = String(input.claimState || '');
  }
  if (input?.formId) {
    headers.formId = String(input.formId);
  }
  if (input?.isArchive !== undefined) {
    headers.isArchive = String(input.isArchive || '');
  }
  if (input?.searchFormId !== undefined) {
    headers.searchFormId = String(input.searchFormId || '');
  }
  if (input?.pno !== undefined) {
    headers.pno = String(input.pno || '');
  }
  if (input?.searchedName !== undefined) {
    headers.searchedName = String(input.searchedName || '');
  }

  return headers;
}
