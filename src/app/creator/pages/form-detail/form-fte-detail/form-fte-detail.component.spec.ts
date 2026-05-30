import { of, throwError } from 'rxjs';
import { FormFteDetailComponent } from './form-fte-detail.component';

describe('FormFteDetailComponent', () => {
  const createComponent = () => {
    const component = Object.create(FormFteDetailComponent.prototype) as any;
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.route = { queryParams: of({ claimId: '301', subFormId: 'FTE' }) };
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.returnValue('2026-02-01');
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    component.$claim = jasmine.createSpyObj('ClaimService', ['getSingleClaim']);
    component.$claim.getSingleClaim.and.returnValue(of({ status: true, object: [{ claimId: '301', yatDocsDTOs: [{ id: 1 }] }] }));
    component.$auth = {} as any;
    return component;
  };

  it('reads query params and fetches claim details on init', () => {
    const component = createComponent();
    spyOn(component, 'getClaimDetails');
    component.ngOnInit();
    expect(component.claimId).toBe('301');
    expect(component.subFormId).toBe('F');
    expect(component.getClaimDetails).toHaveBeenCalled();
  });

  it('shows missing claim message when claim id is absent', () => {
    const component = createComponent();
    component.claimId = null;
    component.getClaimDetails();
    expect(component.$claim.getSingleClaim).not.toHaveBeenCalled();
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
    component.$claim.getSingleClaim.and.returnValue(of({ status: false, message: 'not found' }));
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('not found', 'danger');
  });

  it('handles API error branch', () => {
    const component = createComponent();
    component.claimId = '301';
    component.$claim.getSingleClaim.and.returnValue(throwError(() => new Error('err')));
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
});

