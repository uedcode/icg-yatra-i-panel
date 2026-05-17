import { of, Subject } from 'rxjs';
import { PreviewDetailsComponent } from './preview-details.component';

describe('PreviewDetailsComponent', () => {
  const createComponent = () => {
    const component = Object.create(PreviewDetailsComponent.prototype) as any;
    component.location = jasmine.createSpyObj('Location', ['back']);
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.returnValue('2026-04-01');
    component.route = { queryParams: of({ id: '11', subFormId: 'P', state: 'NP' }) };
    component.$common = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage', 'getCurrentTimeStamp']);
    component.$common.getCurrentTimeStamp.and.returnValue('123');
    component.$auth = jasmine.createSpyObj('AuthService', ['getUserDetails', 'codeStatus', 'codeRoleType', 'getFormEditUrl', 'getModuleName']);
    component.$auth.getUserDetails.and.returnValue({ roleTypeId: 'CR', desigId: 'CO' });
    component.$auth.codeStatus.and.returnValue({ notPassed: 'NP' });
    component.$auth.codeRoleType.and.returnValue({ creator: 'CR' });
    component.$auth.getFormEditUrl.and.returnValue('/creator/form-pmt?id=11');
    component.$auth.getModuleName.and.returnValue('/creator');
    component.$form = jasmine.createSpyObj('FormService', ['getSingleForm', 'getFormDownloadLink', 'downloadFormFromResponse']);
    component.$form.getSingleForm.and.returnValue(of({ status: true, object: [{ formChildPilotageDTOs: [{ id: 1 }] }] }));
    component.$form.getFormDownloadLink.and.returnValue(of({ status: true, object: { fileUrl: '/a.pdf' } }));
    component.$formManage = jasmine.createSpyObj('FormManageService', ['getSingleForm']);
    component.$formManage.formDetail = new Subject<any>();
    component.$formState = jasmine.createSpyObj('FormStateService', ['moveToDraft']);
    component.$formState.moveToDraft.and.returnValue(of({ status: true, message: 'ok' }));
    component.$ship = jasmine.createSpyObj('MasterShipService', ['get']);
    component.$ship.get.and.returnValue(of({ status: true, object: [{ id: 1 }] }));
    component.router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    component.formObj = {};
    component.dataObj = { formUrl: '/form-pmt' };
    component.formId = '11';
    return component;
  };

  it('initializes, fetches list and resolves default claim type', () => {
    const component = createComponent();
    spyOn(component, 'getFormDetails');
    component.ngOnInit();
    expect(component.today).toBe('2026-04-01');
    expect(component.getFormDetails).toHaveBeenCalled();
    expect(component.$form.getSingleForm).toHaveBeenCalled();
  });

  it('maps form manager detail stream to form/document lists', () => {
    const component = createComponent();
    component.userIdDetails = { desigId: 'CO', roleTypeId: 'CR' };
    component.getFormDetails();
    component.$formManage.formDetail.next({
      refSupClaimId: 1,
      formDocsDTOs: [{ id: 1 }],
      formChildPilotageDTOs: [{ id: 2 }]
    });
    expect(component.supplementryClaim).toBe('Supplementary ');
    expect(Array.isArray(component.documentDtos)).toBeTrue();
    expect(Array.isArray(component.formChildMovementDTOs)).toBeTrue();
  });

  it('saves as draft and navigates to edit url when available', () => {
    const component = createComponent();
    component.saveAsDraft();
    expect(component.$formState.moveToDraft).toHaveBeenCalled();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/creator/form-pmt?id=11');
  });

  it('falls back to draft list when edit url is not available', () => {
    const component = createComponent();
    component.$auth.getFormEditUrl.and.returnValue(null);
    component.saveAsDraft();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/creator/draft');
  });

  it('shows save-as-draft error message for API failure response', () => {
    const component = createComponent();
    component.$formState.moveToDraft.and.returnValue(of({ status: false, message: 'fail' }));
    component.saveAsDraft();
    expect(component.$common.showMessage).toHaveBeenCalledWith('fail');
  });

  it('handles download link success and error branches', () => {
    const component = createComponent();
    component.getFormDownloadLink();
    expect(component.$form.downloadFormFromResponse).toHaveBeenCalled();

    component.$form.getFormDownloadLink.and.returnValue(of({ status: false }));
    component.getFormDownloadLink();
    expect(component.$common.hideLoader).toHaveBeenCalled();
  });

  it('computes save-as-draft eligibility for creator in not-passed state', () => {
    const component = createComponent();
    component.userIdDetails = { roleTypeId: 'CR' };
    component.codeStatus = { notPassed: 'NP' };
    component.currentState = 'NP';
    expect(component.canSaveAsDraft()).toBeTrue();
  });

  it('goes back on goBack', () => {
    const component = createComponent();
    const closeSpy = spyOn(window, 'close');
    component.goBack();
    expect(component.location.back.calls.count() + closeSpy.calls.count()).toBeGreaterThan(0);
  });
});
