import { of } from 'rxjs';

import { ClaimDraftComponent } from './claim-draft.component';

describe('Creator Claim DraftComponent', () => {
  let component: ClaimDraftComponent;
  let authService: any;
  let claimStateApi: any;

  beforeEach(() => {
    authService = {
      getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue({
        userId: 'CREATOR-1',
        roleTypeId: 'CR',
        unitId: 'UNIT-1',
        gxUnitId: 'GX-1',
      }),
      codeStatus: jasmine.createSpy('codeStatus').and.returnValue({ draft: 'DR' }),
    };
    claimStateApi = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ object: [] })),
    };

    component = new ClaimDraftComponent(
      {} as any,
      authService,
      {} as any,
      {} as any,
      {} as any,
      claimStateApi,
      {} as any
    );
  });

  it('loads draft records with legacy creator claim headers', () => {
    component.ngOnInit();

    expect(claimStateApi.getAll).toHaveBeenCalledOnceWith({
      headers: {
        userId: 'CREATOR-1',
        roleTypeId: 'CR',
        claimState: 'DR',
        isArchive: '0',
        formId: 'CLM',
        searchFormId: '',
        pno: '',
        searchedName: '',
      },
    });
  });
});
