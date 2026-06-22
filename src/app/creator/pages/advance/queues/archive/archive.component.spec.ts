import { of, throwError } from 'rxjs';

import { ArchiveComponent } from './archive.component';

describe('Creator Advance ArchiveComponent', () => {
  let component: ArchiveComponent;
  let commonService: jasmine.SpyObj<any>;
  let claimStateApi: jasmine.SpyObj<any>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj('CommonService', ['showMessage']);
    claimStateApi = jasmine.createSpyObj('ClaimStateApiService', [
      'changeStatusArchive',
      'notifyStatusCountRefresh',
    ]);

    component = new ArchiveComponent(
      {} as any,
      {} as any,
      claimStateApi,
      commonService,
      {} as any
    );
  });

  it('refreshes sidebar counts after successful restore', () => {
    component.dataList = [
      { claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } },
      { claimStateId: 22, yatClaimDTO: { claimId: 'C_ID_22' } },
    ];
    claimStateApi.changeStatusArchive.and.returnValue(of({ status: true, message: 'Restored' }));

    component.restoreClaim({ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } });

    expect(claimStateApi.changeStatusArchive).toHaveBeenCalledWith({
      headers: {
        ids: ['11'],
        isArchive: '0',
      },
    });
    expect(component.dataList).toEqual([{ claimStateId: 22, yatClaimDTO: { claimId: 'C_ID_22' } }]);
    expect(claimStateApi.notifyStatusCountRefresh).toHaveBeenCalledTimes(1);
    expect(commonService.showMessage).toHaveBeenCalledWith('Restored', 'success');
  });

  it('does not refresh sidebar counts when restore API reports failure', () => {
    component.dataList = [{ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } }];
    claimStateApi.changeStatusArchive.and.returnValue(of({ status: false, message: 'Restore failed.' }));

    component.restoreClaim({ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } });

    expect(component.dataList).toEqual([{ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } }]);
    expect(claimStateApi.notifyStatusCountRefresh).not.toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('Restore failed.', 'danger');
  });

  it('does not refresh sidebar counts when restore request errors', () => {
    component.dataList = [{ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } }];
    claimStateApi.changeStatusArchive.and.returnValue(throwError(() => new Error('network')));

    component.restoreClaim({ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } });

    expect(component.dataList).toEqual([{ claimStateId: 11, yatClaimDTO: { claimId: 'C_ID_11' } }]);
    expect(claimStateApi.notifyStatusCountRefresh).not.toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Something went wrong while restoring claim.',
      'danger'
    );
  });
});
