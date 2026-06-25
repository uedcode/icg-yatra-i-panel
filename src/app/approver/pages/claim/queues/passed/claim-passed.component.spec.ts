import { of } from 'rxjs';

import { ClaimPassedComponent } from './claim-passed.component';

describe('ClaimPassedComponent', () => {
  let component: ClaimPassedComponent;
  let claimStateApi: any;

  beforeEach(() => {
    const auth: any = {
      getUserDetails: () => ({
        userId: 'VERIFIER-1',
        roleTypeId: 'VE1',
        unitId: 'UNIT-1',
        gxUnitId: 'GX-1',
      }),
      codeStatus: () => ({ passed: 'PS' }),
      codeRoleType: () => ({ verifier: 'VE1', verifier1: 'VE1', verifier2: 'VE2', approver: 'AP' }),
    };
    claimStateApi = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ object: [] })),
    };
    const route: any = {
      snapshot: {
        data: {
          queueModule: 'CLM',
        },
      },
    };
    component = new ClaimPassedComponent(
      {} as any,
      auth,
      {} as any,
      {} as any,
      claimStateApi,
      route
    );
  });

  it('loads non-archived passed claim rows with legacy verifier headers', () => {
    component.ngOnInit();

    expect(claimStateApi.getAll).toHaveBeenCalledWith({
      headers: {
        roleTypeId: 'VE1',
        gxUnitId: 'GX-1',
        claimState: 'PS',
        isArchive: '0',
        formId: 'CLM',
      },
    });
  });
});
