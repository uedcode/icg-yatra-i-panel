import { of, throwError } from 'rxjs';

import { InboxComponent } from './inbox.component';

describe('Approver Advance InboxComponent', () => {
  let component: InboxComponent;
  let authService: jasmine.SpyObj<any>;
  let commonService: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<any>;
  let claimStateApi: jasmine.SpyObj<any>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getModuleName', 'isNullOrEmpty']);
    commonService = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
    claimStateApi = jasmine.createSpyObj('ClaimStateApiService', [
      'changeStatusById',
      'notifyStatusCountRefresh',
    ]);

    authService.getModuleName.and.returnValue('/adv/approver');
    authService.isNullOrEmpty.and.callFake((value: any) => value === null || value === undefined || value === '');

    component = new InboxComponent(
      {} as any,
      authService,
      commonService,
      router,
      claimStateApi,
      { queryParamMap: of(new Map()) } as any
    );
    component.userIdDetails = { userId: 'U1', roleTypeId: 'VE1' };
    component.codeStatus = { manualDraft: 'MD' } as any;
  });

  it('refreshes sidebar counts after successful move to draft', () => {
    component.dataList = [
      { yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' },
      { yatClaimDTO: { claimId: 'C_ID_2' }, viewIndicator: '1' },
    ];
    claimStateApi.changeStatusById.and.returnValue(of({ status: true, message: 'Moved' }));

    component.moveToDraft({ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' });

    expect(claimStateApi.changeStatusById).toHaveBeenCalledWith({
      claimId: 'C_ID_1',
      roleTypeId: 'VE1',
      userId: 'U1',
      status: 'MD',
      remark: 'Moved to Draft',
    });
    expect(component.dataList).toEqual([{ yatClaimDTO: { claimId: 'C_ID_2' }, viewIndicator: '1' }]);
    expect(claimStateApi.notifyStatusCountRefresh).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/adv/approver/manual-draft');
  });

  it('does not refresh sidebar counts when move to draft fails', () => {
    component.dataList = [{ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' }];
    claimStateApi.changeStatusById.and.returnValue(of({ status: false, message: 'Unable' }));

    component.moveToDraft({ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' });

    expect(component.dataList).toEqual([{ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' }]);
    expect(claimStateApi.notifyStatusCountRefresh).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not refresh sidebar counts when move to draft errors', () => {
    component.dataList = [{ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' }];
    claimStateApi.changeStatusById.and.returnValue(throwError(() => new Error('network')));

    component.moveToDraft({ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' });

    expect(component.dataList).toEqual([{ yatClaimDTO: { claimId: 'C_ID_1' }, viewIndicator: '1' }]);
    expect(claimStateApi.notifyStatusCountRefresh).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
