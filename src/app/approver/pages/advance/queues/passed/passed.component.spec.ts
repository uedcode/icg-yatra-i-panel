import { of } from 'rxjs';

import { PassedComponent } from './passed.component';

describe('PassedComponent', () => {
  let component: PassedComponent;
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
    component = new PassedComponent(
      {} as any,
      auth,
      {} as any,
      {} as any,
      claimStateApi
    );
  });

  it('loads non-archived passed advance rows with legacy verifier headers', () => {
    component.ngOnInit();

    expect(claimStateApi.getAll).toHaveBeenCalledWith({
      headers: {
        roleTypeId: 'VE1',
        gxUnitId: 'GX-1',
        claimState: 'PS',
        isArchive: '0',
        formId: 'ADV',
      },
    });
  });
});

