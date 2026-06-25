import { buildLegacyClaimStateHeaders, buildLegacyStateCountHeaders } from './legacy-api.util';

describe('legacy-api.util', () => {
  const roles = {
    creator: 'CR',
    verifier: 'VE1',
    verifier1: 'VE1',
    verifier2: 'VE2',
    approver: 'AP',
  };

  it('builds creator state count headers without unit filters like legacy', () => {
    expect(buildLegacyStateCountHeaders({
      userId: 'CREATOR-1',
      roleTypeId: 'CR',
      unitId: 'UNIT-1',
      gxUnitId: 'GX-1',
    }, roles)).toEqual({
      userId: 'CREATOR-1',
      roleTypeId: 'CR',
    });
  });

  it('keeps verifier state count scoped by gx unit', () => {
    expect(buildLegacyStateCountHeaders({
      userId: 'VERIFIER-1',
      roleTypeId: 'VE1',
      unitId: 'UNIT-1',
      gxUnitId: 'GX-1',
    }, roles)).toEqual({
      userId: 'VERIFIER-1',
      roleTypeId: 'VE1',
      gxUnitId: 'GX-1',
    });
  });

  it('builds creator claim-state headers with isArchive zero and no unit filters', () => {
    expect(buildLegacyClaimStateHeaders({
      userId: 'CREATOR-1',
      roleTypeId: 'CR',
      unitId: 'UNIT-1',
      gxUnitId: 'GX-1',
      claimState: 'DR',
      isArchive: '0',
      formId: 'ADV',
      searchFormId: '',
      pno: '',
      searchedName: '',
    }, roles)).toEqual({
      userId: 'CREATOR-1',
      roleTypeId: 'CR',
      claimState: 'DR',
      isArchive: '0',
      formId: 'ADV',
      searchFormId: '',
      pno: '',
      searchedName: '',
    });
  });

  it('preserves archive one for creator archive queues', () => {
    expect(buildLegacyClaimStateHeaders({
      userId: 'CREATOR-1',
      roleTypeId: 'CR',
      isArchive: '1',
      formId: 'CLM',
    }, roles)).toEqual({
      userId: 'CREATOR-1',
      roleTypeId: 'CR',
      isArchive: '1',
      formId: 'CLM',
    });
  });

  it('builds verifier claim-state list headers with archive zero and gx unit scope', () => {
    expect(buildLegacyClaimStateHeaders({
      userId: 'VERIFIER-1',
      roleTypeId: 'VE1',
      unitId: 'UNIT-1',
      gxUnitId: 'GX-1',
      claimState: 'PS',
      isArchive: '0',
      formId: 'CLM',
    }, roles)).toEqual({
      roleTypeId: 'VE1',
      gxUnitId: 'GX-1',
      claimState: 'PS',
      isArchive: '0',
      formId: 'CLM',
    });
  });

  it('builds verifier archive headers with archive one and gx unit scope', () => {
    expect(buildLegacyClaimStateHeaders({
      userId: 'VERIFIER-1',
      roleTypeId: 'VE1',
      unitId: 'UNIT-1',
      gxUnitId: 'GX-1',
      claimState: '',
      isArchive: '1',
      formId: 'CLM',
    }, roles)).toEqual({
      roleTypeId: 'VE1',
      gxUnitId: 'GX-1',
      claimState: '',
      isArchive: '1',
      formId: 'CLM',
    });
  });
});
