import { of, throwError } from 'rxjs';
import { PreviewFteAdvanceComponent } from './preview-fte-advance.component';

describe('PreviewFteAdvanceComponent', () => {
  const createComponent = () => {
    const component = Object.create(PreviewFteAdvanceComponent.prototype) as any;
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.route = {
      snapshot: { data: { subFormId: 'FTE' } },
      queryParams: of({ claimId: '301', subFormId: 'FTE' })
    };
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.returnValue('2026-02-01');
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    component.$claimApi = jasmine.createSpyObj('ClaimApiService', ['getSingleClaim']);
    component.$claimApi.getSingleClaim.and.returnValue(of({ status: true, object: [{ claimId: '301', yatDocsDTOs: [{ id: 1 }] }] }));
    component.$auth = {} as any;
    return component;
  };

  it('reads query params and fetches claim details on init', () => {
    const component = createComponent();
    spyOn(component, 'getClaimDetails');
    component.ngOnInit();
    expect(component.claimId).toBe('301');
    expect(component.subFormId).toBe('FTE');
    expect(component.getClaimDetails).toHaveBeenCalled();
  });

  it('shows missing claim message when claim id is absent', () => {
    const component = createComponent();
    component.claimId = null;
    component.getClaimDetails();
    expect(component.$claimApi.getSingleClaim).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Missing claim id for FTE preview.', 'danger');
  });

  it('maps successful API response into form and docs', () => {
    const component = createComponent();
    component.claimId = '301';
    component.getClaimDetails();
    expect(component.formObj.claimId).toBe('301');
    expect(component.documentDtos.length).toBe(1);
  });

  it('shows danger message when API returns status false', () => {
    const component = createComponent();
    component.claimId = '301';
    component.$claimApi.getSingleClaim.and.returnValue(of({ status: false, message: 'not found' }));
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('not found', 'danger');
  });

  it('handles API error branch', () => {
    const component = createComponent();
    component.claimId = '301';
    component.$claimApi.getSingleClaim.and.returnValue(throwError(() => new Error('err')));
    component.getClaimDetails();
    expect(component.$common.hideLoader).toHaveBeenCalled();
  });

  it('formats helper outputs and goBack', () => {
    const component = createComponent();
    expect(component.display('')).toBe('-');
    expect(component.display('ok')).toBe('ok');
    expect(component.asDate(1700000000000)).toBe('2026-02-01');
    expect(component.asDate(null)).toBeNull();
    component.goBack();
    expect(component.location.back).toHaveBeenCalled();
  });

  it('uses claim-specific headings for FTE claim preview', () => {
    const component = createComponent();
    component.subFormId = 'FTE';
    expect(component.previewHeading).toBe('FTE Claim Preview');
    expect(component.detailHeading).toBe('FTE Claim Details');
  });
});


