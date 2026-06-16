import { of, throwError } from 'rxjs';
import { PreviewTyDutyComponent } from './preview-ty-duty.component';

describe('PreviewTyDutyComponent', () => {
  const createComponent = () => {
    const component = Object.create(PreviewTyDutyComponent.prototype) as any;
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.route = {
      snapshot: { data: { subFormId: 'TYA' } },
      queryParams: of({ claimId: '701', subFormId: 'TYA' })
    };
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.returnValue('2026-03-01');
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    component.$claim = jasmine.createSpyObj('ClaimService', ['getSingleClaim']);
    component.$claim.getSingleClaim.and.returnValue(of({ status: true, object: [{ claimId: '701', yatDocsDTOs: [{ id: 1 }] }] }));
    component.$auth = jasmine.createSpyObj('AuthService', ['viewFile']);
    return component;
  };

  it('reads query params and fetches TY Duty claim details', () => {
    const component = createComponent();
    spyOn(component, 'getClaimDetails');
    component.ngOnInit();
    expect(component.claimId).toBe('701');
    expect(component.subFormId).toBe('T');
    expect(component.getClaimDetails).toHaveBeenCalled();
  });

  it('shows message when claim id is missing', () => {
    const component = createComponent();
    component.claimId = null;
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Missing claim id for TY Duty preview.', 'danger');
  });

  it('maps API response into local form data', () => {
    const component = createComponent();
    component.claimId = '701';
    component.getClaimDetails();
    expect(component.formObj.claimId).toBe('701');
    expect(component.documentDtos.length).toBe(1);
  });

  it('handles non-success and error API branches', () => {
    const component = createComponent();
    component.claimId = '701';
    component.$claim.getSingleClaim.and.returnValue(of({ status: false, message: 'invalid' }));
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('invalid', 'danger');

    component.$claim.getSingleClaim.and.returnValue(throwError(() => new Error('err')));
    component.getClaimDetails();
    expect(component.$common.hideLoader).toHaveBeenCalled();
  });

  it('formats display/date helpers and goBack', () => {
    const component = createComponent();
    expect(component.display('')).toBe('-');
    expect(component.display('value')).toBe('value');
    expect(component.asDate(1700000000000)).toBe('2026-03-01');
    expect(component.asDate(undefined)).toBeNull();
    component.goBack();
    expect(component.location.back).toHaveBeenCalled();
  });

  it('uses legacy headings and exposes TY detail helpers', () => {
    const component = createComponent();
    component.formObj = {
      formId: 'F1',
      extendedAdvId: 'OLD',
      yatTempDutyAdvDTOs: [{ availedCategory: '1', accHToDutyKms: 50, accHToDutyPerDay: 10 }]
    };
    expect(component.previewHeading).toBe('Requisition for TY Duty Advance');
    expect(component.headingFormId).toBe('F1');
    expect(component.gxLabelPrefix).toBe('Authority');
    expect(component.accHToDutyRateLabel).toBe('50 per day(Kms)');
  });
});

