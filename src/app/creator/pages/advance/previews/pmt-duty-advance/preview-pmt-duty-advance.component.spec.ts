import { of, throwError } from 'rxjs';
import { PreviewPmtDutyComponent } from './preview-pmt-duty-advance.component';

describe('PreviewPmtDutyComponent', () => {
  const createComponent = () => {
    const component = Object.create(PreviewPmtDutyComponent.prototype) as any;
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.route = {
      snapshot: { data: { subFormId: 'PMT', previewKind: 'advance' } },
      queryParams: of({ claimId: '101', subFormId: 'PMT' })
    };
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.returnValue('2026-01-01');
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    component.$claim = jasmine.createSpyObj('ClaimService', ['getSingleClaim']);
    component.$claim.getSingleClaim.and.returnValue(of({ status: true, object: [{ claimId: '101', yatDocsDTOs: [{ id: 1 }] }] }));
    component.$auth = jasmine.createSpyObj('AuthService', ['getUserDetails']);
    component.$auth.getUserDetails.and.returnValue({ userId: '501' });
    return component;
  };

  it('loads claim details on init from query params', () => {
    const component = createComponent();
    component.ngOnInit();
    expect(component.claimId).toBe('101');
    expect(component.subFormId).toBe('P');
    expect(component.$claim.getSingleClaim).toHaveBeenCalled();
    expect(component.$claim.getSingleClaim.calls.mostRecent().args[0].headers).toEqual(
      jasmine.objectContaining({
        claimId: '101',
        subFormId: 'P',
        isPreview: 'true',
        userId: '501',
      })
    );
  });

  it('passes supplementary claim id when previewing a supplementary form', () => {
    const component = createComponent();
    component.route.queryParams = of({ claimId: '101', subFormId: 'RS', supId: '202' });
    component.ngOnInit();
    expect(component.claimId).toBe('101');
    expect(component.subFormId).toBe('RS');
    expect(component.$claim.getSingleClaim.calls.mostRecent().args[0].headers).toEqual(
      jasmine.objectContaining({
        claimId: '101',
        subFormId: 'RS',
        supCLaimId: '202',
        userId: '501',
      })
    );
  });

  it('shows message when claim id is missing', () => {
    const component = createComponent();
    component.claimId = null;
    component.getClaimDetails();
    expect(component.$claim.getSingleClaim).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalled();
  });

  it('maps response object and documents on successful fetch', () => {
    const component = createComponent();
    component.claimId = '101';
    component.getClaimDetails();
    expect(component.formObj.claimId).toBe('101');
    expect(component.documentDtos.length).toBe(1);
  });

  it('handles failed status response', () => {
    const component = createComponent();
    component.claimId = '101';
    component.$claim.getSingleClaim.and.returnValue(of({ status: false, message: 'nope' }));
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('nope', 'danger');
  });

  it('handles API error response', () => {
    const component = createComponent();
    component.claimId = '101';
    component.$claim.getSingleClaim.and.returnValue(throwError(() => new Error('err')));
    component.getClaimDetails();
    expect(component.$common.hideLoader).toHaveBeenCalled();
  });

  it('computes preview and detail headings for resettlement claim', () => {
    const component = createComponent();
    component.subFormId = 'RS';
    component.previewKind = 'claim';
    expect(component.previewHeading).toBe('Resettlement Claim Preview');
    expect(component.detailHeading).toBe('Resettlement Details');
  });

  it('uses claim-specific detail heading for PMT claim preview', () => {
    const component = createComponent();
    component.subFormId = 'PMT';
    component.previewKind = 'claim';
    expect(component.previewHeading).toBe('PMT Duty Claim Preview');
    expect(component.detailHeading).toBe('PMT Claim Details');
  });

  it('formats epoch dates and falls back for non-numeric values', () => {
    const component = createComponent();
    expect(component.asDate(1700000000000)).toBe('2026-01-01');
    expect(component.asDate('raw')).toBe('raw');
    expect(component.asDate(null)).toBeNull();
  });

  it('navigates back on goBack', () => {
    const component = createComponent();
    component.goBack();
    expect(component.location.back).toHaveBeenCalled();
  });
});

