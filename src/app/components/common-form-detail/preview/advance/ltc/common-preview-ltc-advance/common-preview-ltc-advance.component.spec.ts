import { of, throwError } from 'rxjs';
import { legacyDate, legacyValue } from 'src/app/shared/utils/legacy-display.util';
import { asArray, firstItem } from 'src/app/shared/utils/legacy-preview-data.util';
import { CommonPreviewLtcAdvanceComponent } from './common-preview-ltc-advance.component';

describe('CommonPreviewLtcAdvanceComponent', () => {
  const createComponent = () => {
    const component = Object.create(CommonPreviewLtcAdvanceComponent.prototype) as any;
    component.route = {
      snapshot: {
        data: { subFormId: 'LTC' },
        queryParamMap: {
          get: (key: string) => ({ claimId: '501', subFormId: 'LTC' } as any)[key] || null
        }
      }
    };
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    component.$claimApi = jasmine.createSpyObj('ClaimApiService', ['getSingleClaim']);
    component.$claimApi.getSingleClaim.and.returnValue(of({ object: [{ claimId: '501', yatFamilyDetailDTOs: [{ id: 1 }] }] }));
    component.$auth = {} as any;
    component.previewWindow = jasmine.createSpyObj('PreviewWindowService', ['closeOrBack', 'open']);
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
    expect(component.familyRows.length).toBe(1);
  });

  it('shows danger message on claim API error', () => {
    const component = createComponent();
    component.claimId = '501';
    component.$claimApi.getSingleClaim.and.returnValue(throwError(() => new Error('err')));
    component.getClaimDetails();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Unable to load LTC preview details.', 'danger');
  });

  it('uses shared display and preview data helpers', () => {
    const component = createComponent();
    expect(component.display(null)).toBe(legacyValue(null));
    expect(component.display('  ')).toBe(legacyValue('  '));
    expect(component.display('abc')).toBe(legacyValue('abc'));
    expect(legacyDate(1700000000000, 'previewDate')).toBeTruthy();
    expect(firstItem([{ id: 1 }])).toEqual({ id: 1 });
    expect(asArray({ id: 1 })).toEqual([{ id: 1 }]);
  });

  it('goes back on goBack', () => {
    const component = createComponent();
    component.goBack();
    expect(component.previewWindow.closeOrBack).toHaveBeenCalledWith(component.location);
  });

  it('maps LTC subtype labels like legacy', () => {
    const component = createComponent();
    component.preview = { ltc: { ltcType: 'PL' } };
    expect(component.ltcSubType).toBe('Self and Family');
  });
});


