import { of, throwError } from 'rxjs';
import { FormLtcDetailComponent } from './form-ltc-detail.component';

describe('FormLtcDetailComponent', () => {
  const createComponent = () => {
    const component = Object.create(FormLtcDetailComponent.prototype) as any;
    component.route = {
      snapshot: {
        data: { subFormId: 'LTC' },
        queryParamMap: {
          get: (key: string) => ({ claimId: '501', subFormId: 'LTC' } as any)[key] || null
        }
      }
    };
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.returnValue('10-Jan-2026');
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    component.$claim = jasmine.createSpyObj('ClaimService', ['getSingleClaim']);
    component.$claim.getSingleClaim.and.returnValue(of({ object: [{ claimId: '501', yatDocsDTOs: [{ id: 1 }] }] }));
    component.$auth = {} as any;
    return component;
  };

  it('initializes from route and fetches claim details', () => {
    const component = createComponent();
    spyOn(component, 'getClaimDetails');
    component.ngOnInit();
    expect(component.claimId).toBe('501');
    expect(component.subFormId).toBe('LTC');
    expect(component.getClaimDetails).toHaveBeenCalled();
  });

  it('maps claim details and documents on response', () => {
    const component = createComponent();
    component.claimId = '501';
    component.subFormId = 'L';
    component.getClaimDetails();
    expect(component.formObj.claimId).toBe('501');
    expect(component.documentDtos.length).toBe(1);
  });

  it('shows danger message on claim API error', () => {
    const component = createComponent();
    component.claimId = '501';
    component.$claim.getSingleClaim.and.returnValue(throwError(() => new Error('err')));
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Unable to load LTC preview details.', 'danger');
  });

  it('formats display and date helper outputs', () => {
    const component = createComponent();
    expect(component.display(null)).toBe('-');
    expect(component.display('  ')).toBe('-');
    expect(component.display('abc')).toBe('abc');
    expect(component.asDate(1700000000000)).toBe('10-Jan-2026');
    expect(component.asDate(null)).toBe('-');
  });

  it('goes back on goBack', () => {
    const component = createComponent();
    component.goBack();
    expect(component.location.back).toHaveBeenCalled();
  });

  it('uses claim-specific heading for LTC claim preview', () => {
    const component = createComponent();
    component.subFormId = 'LTC';
    expect(component.previewHeading).toBe('LTC Claim Preview');
  });
});

