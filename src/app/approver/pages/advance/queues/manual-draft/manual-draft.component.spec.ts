import { of, throwError } from 'rxjs';

import { ManualDraftComponent } from './manual-draft.component';

describe('Approver Advance ManualDraftComponent', () => {
  let component: ManualDraftComponent;
  let claimApi: jasmine.SpyObj<any>;
  let claimStateApi: jasmine.SpyObj<any>;
  let commonService: jasmine.SpyObj<any>;

  beforeEach(() => {
    claimApi = jasmine.createSpyObj('ClaimApiService', ['deleteClaim']);
    claimStateApi = jasmine.createSpyObj('ClaimStateApiService', ['notifyStatusCountRefresh']);
    commonService = jasmine.createSpyObj('CommonService', ['showMessage']);

    component = new ManualDraftComponent(
      {} as any,
      {} as any,
      claimApi,
      claimStateApi,
      commonService,
      {} as any
    );
  });

  it('refreshes sidebar counts after successful manual draft delete', () => {
    component.dataList = [
      { yatClaimDTO: { claimId: 'C_ID_1' } },
      { yatClaimDTO: { claimId: 'C_ID_2' } },
    ];
    claimApi.deleteClaim.and.returnValue(of({ status: true, message: 'Deleted' }));

    component.deleteManualDraft({ yatClaimDTO: { claimId: 'C_ID_1' } });

    expect(claimApi.deleteClaim).toHaveBeenCalledWith({
      headers: { ids: ['C_ID_1'] },
    });
    expect(component.dataList).toEqual([{ yatClaimDTO: { claimId: 'C_ID_2' } }]);
    expect(claimStateApi.notifyStatusCountRefresh).toHaveBeenCalledTimes(1);
    expect(commonService.showMessage).toHaveBeenCalledWith('Deleted', 'success');
  });

  it('does not refresh sidebar counts when manual draft delete fails', () => {
    component.dataList = [{ yatClaimDTO: { claimId: 'C_ID_1' } }];
    claimApi.deleteClaim.and.returnValue(of({ status: false, message: 'Delete failed.' }));

    component.deleteManualDraft({ yatClaimDTO: { claimId: 'C_ID_1' } });

    expect(component.dataList).toEqual([{ yatClaimDTO: { claimId: 'C_ID_1' } }]);
    expect(claimStateApi.notifyStatusCountRefresh).not.toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('Delete failed.', 'danger');
  });

  it('does not refresh sidebar counts when manual draft delete errors', () => {
    component.dataList = [{ yatClaimDTO: { claimId: 'C_ID_1' } }];
    claimApi.deleteClaim.and.returnValue(throwError(() => new Error('network')));

    component.deleteManualDraft({ yatClaimDTO: { claimId: 'C_ID_1' } });

    expect(component.dataList).toEqual([{ yatClaimDTO: { claimId: 'C_ID_1' } }]);
    expect(claimStateApi.notifyStatusCountRefresh).not.toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Something went wrong while deleting claim.',
      'danger'
    );
  });
});
