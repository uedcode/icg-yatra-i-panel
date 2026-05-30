import { of, Subject, throwError } from 'rxjs';
import { FormLtcAdvanceComponent } from './form-ltc.component';

describe('FormLtcAdvanceComponent', () => {
  const userDetails = { userId: 42, unitId: 'U1', roleTypeId: 'CR' };

  const createComponent = () => {
    const component = Object.create(FormLtcAdvanceComponent.prototype) as any;

    component.codeClaim = { ltcAdv: 'L' };
    component.codeClaimState = { draft: 'DR', outbox: 'OB' };
    component.codeSignType = { inkSign: 'INK_SIGN', eSign: 'E_SIGN' };
    component.activeSubFormId = 'L';
    component.activeFormKind = 'advance';
    component.supplementaryId = null;
    component.claimIdParam = null;
    component.disableBtn = false;
    component.showGxFileBrowse = true;
    component.gxFile = null;
    component.gxFormUploading = false;
    component.documentDtos = [];
    component.fileUrl = '';
    component.claims = {
      claimId: null,
      claimState: null,
      signWith: component.codeSignType.inkSign,
      occDate: '',
      gxFormFileUrl: '',
      internalRemarks: '',
      codeSubFormDTO: { subFormId: 'L' },
      codeUnitDTO: { unit: '', descr: '' },
      yatLtcAdvDTOs: [{
        totalAmt: '0',
        dtsAmount: '0',
        advAmt: '0',
        totalBudgetedAmt: '0',
        isDts: '',
        reasonForNoDts: ''
      }],
      yatFamilyDetailDTOs: [],
      yatDtsDetailDTOs: [],
      yatDocsDTOs: [],
      yatClaimBankDetailDTO: { ifscCode: '', bankName: '', bankAccNo: '', micrCode: '' }
    };

    component.userIdDetails = userDetails;
    component.$auth = jasmine.createSpyObj('AuthService', ['getModuleName']);
    component.$auth.getModuleName.and.returnValue('/creator');
    component.$common = jasmine.createSpyObj('CommonService', [
      'showLoader', 'hideLoader', 'showMessage', 'checkForValidFile'
    ]);
    component.$common.checkForValidFile.and.returnValue(true);
    component.$claim = jasmine.createSpyObj('ClaimService', [
      'createOrUpdateClaim', 'checkEsignAvailability'
    ]);
    component.$claim.createOrUpdateClaim.and.returnValue(of({ object: [{ claimId: 2002 }] }));
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$formManage = jasmine.createSpyObj('FormManageService', ['uploadImg', 'deleteByUrl']);
    component.$formManage.docFileUrl = new Subject<string>();
    component.$formManage.docFileUrlDeleted = new Subject<boolean>();
    component.UtilService = jasmine.createSpyObj('UtilService', ['toMillis']);
    component.UtilService.toMillis.and.returnValue(1700000000000);
    component.router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    component.setTab = jasmine.createSpy('setTab');
    component.checkForPreviewBtn = jasmine.createSpy('checkForPreviewBtn');

    return component;
  };

  it('should calculate LTC totals from travel rows', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [
      { isDts: 'Yes', tempAmount: '1000', amount: '1000' },
      { isDts: 'No', tempAmount: '500', amount: '500' }
    ];
    component.calculateAmount();
    const dto = component.claims.yatLtcAdvDTOs[0];
    expect(dto.totalAmt).toBe('1500');
    expect(dto.dtsAmount).toBe('1000');
    expect(dto.advAmt).toBe('1350');
    expect(dto.totalBudgetedAmt).toBe('1500');
  });

  it('should validate reason when DTS is No in travel rows', () => {
    const component = createComponent();
    const row: any = { isDts: 'No', reasonForNoDts: '' };
    component.validateLtcTravel(row, 'reasonForNoDts');
    expect(row._reasonForNoDtsError).toBeTrue();
  });

  it('should reject invalid gx extension and accept valid upload callback', () => {
    const component = createComponent();
    component.$common.checkForValidFile.and.returnValue(false);
    component.uploadGxForm({ target: { files: [{ size: 1024 }], value: 'x' } } as any);
    expect(component.$formManage.uploadImg).not.toHaveBeenCalled();

    component.$common.checkForValidFile.and.returnValue(true);
    component.uploadGxForm({ target: { files: [{ size: 1024 }], value: '' } } as any);
    component.$formManage.docFileUrl.next('gx-ltc.pdf');
    expect(component.$formManage.uploadImg).toHaveBeenCalled();
    expect(component.claims.gxFormFileUrl).toBe('gx-ltc.pdf');
    expect(component.showGxFileBrowse).toBeFalse();
  });

  it('should delete gx form only after confirmation', () => {
    const component = createComponent();
    component.claims.gxFormFileUrl = 'old-gx.pdf';
    spyOn(window, 'confirm').and.returnValues(false, true);
    component.deleteGxForm();
    expect(component.$formManage.deleteByUrl).not.toHaveBeenCalled();
    component.deleteGxForm();
    component.$formManage.docFileUrlDeleted.next(true);
    expect(component.$formManage.deleteByUrl).toHaveBeenCalledWith('old-gx.pdf');
    expect(component.claims.gxFormFileUrl).toBeNull();
  });

  it('should block submit when form invalid', () => {
    const component = createComponent();
    component.submit({ invalid: true } as any);
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please fill all required fields.', 'danger');
    expect(component.$claim.createOrUpdateClaim).not.toHaveBeenCalled();
  });

  it('should block submit when gx upload missing', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(true);
    component.showGxFileBrowse = true;
    component.gxFile = null;
    component.submit({ invalid: false } as any);
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please upload GX Form PDF.', 'danger');
    expect(component.$claim.createOrUpdateClaim).not.toHaveBeenCalled();
  });

  it('should submit valid form to outbox', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(true);
    component.showGxFileBrowse = false;
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: '1000', amount: '1000' }];
    component.submit({ invalid: false } as any);
    const formData = component.$claim.createOrUpdateClaim.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('OB');
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/creator/submitted');
  });

  it('should save draft payload with normalized fields', () => {
    const component = createComponent();
    component.claims.codeUnitDTO = { unit: 'U1', descr: 'Unit One' };
    component.documentDtos = [{ codeDocInfoDTO: { id: 8, docName: 'GX Form' }, otherDocName: 'GX Other' }];
    component.saveDraft();
    const formData = component.$claim.createOrUpdateClaim.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('DR');
    expect(payload.roleTypeId).toBe('CR');
    expect(payload.aclUserDTO.userId).toBe(42);
    expect(payload.codeSubFormDTO.subFormId).toBe('L');
    expect(payload.codeUnitDTO).toEqual({ unit: 'U1' });
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/creator/draft');
  });

  it('should fallback to ink sign on esign unavailability and error', () => {
    const component = createComponent();
    component.claims.claimId = 999;
    component.claims.signWith = component.codeSignType.eSign;
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: false, message: 'eSign unavailable' }));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe(component.codeSignType.inkSign);
    expect(component.$common.showMessage).toHaveBeenCalledWith('eSign unavailable', 'danger');

    component.claims.signWith = component.codeSignType.eSign;
    component.$claim.checkEsignAvailability.and.returnValue(throwError(() => new Error('down')));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe(component.codeSignType.inkSign);
    expect(component.$common.showMessage).toHaveBeenCalledWith('Unable to verify eSign availability.', 'danger');
  });

  it('should fallback to ink sign when checking eSign before initial save', () => {
    const component = createComponent();
    component.claims.claimId = null;
    component.claims.signWith = component.codeSignType.eSign;

    component.checkEsignAvailability();

    expect(component.$claim.checkEsignAvailability).not.toHaveBeenCalled();
    expect(component.claims.signWith).toBe(component.codeSignType.inkSign);
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please save the LTC claim before checking eSign availability.',
      'danger'
    );
  });

  it('should stop submit when LTC client validation fails', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(false);
    component.showGxFileBrowse = false;
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: '1000', amount: '1000' }];

    component.submit({ invalid: false } as any);

    expect(component.$claim.createOrUpdateClaim).not.toHaveBeenCalled();
  });

  it('runLtcClientValidationOnly should fail when required section validation fails', () => {
    const component = createComponent();
    spyOn(component, 'validateSection').and.returnValues(true, false, true, true, true);

    const isValid = (component as any).runLtcClientValidationOnly();

    expect(isValid).toBeFalse();
    expect(component.setTab).toHaveBeenCalledWith('ship2');
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please complete the required fields before proceeding.',
      'danger'
    );
  });

  it('runLtcClientValidationOnly should fail when no travel rows exist', () => {
    const component = createComponent();
    spyOn(component, 'validateSection').and.returnValue(true);
    component.claims.yatDtsDetailDTOs = [];

    const isValid = (component as any).runLtcClientValidationOnly();

    expect(isValid).toBeFalse();
    expect(component.setTab).toHaveBeenCalledWith('ship2');
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please add at least one travel detail row.',
      'danger'
    );
  });

  it('runLtcClientValidationOnly should fail when claim-level non-DTS reason is missing', () => {
    const component = createComponent();
    spyOn(component, 'validateSection').and.returnValue(true);
    component.claims.yatLtcAdvDTOs[0].isDts = 'No';
    component.claims.yatLtcAdvDTOs[0].reasonForNoDts = '';
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: '1000', amount: '1000' }];

    const isValid = (component as any).runLtcClientValidationOnly();

    expect(isValid).toBeFalse();
    expect(component.setTab).toHaveBeenCalledWith('ship');
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please fill the reason for not taking DTS.',
      'danger'
    );
  });

  it('runLtcClientValidationOnly should fail when Others mode row misses other mode value', () => {
    const component = createComponent();
    spyOn(component, 'validateSection').and.returnValue(true);
    component.claims.yatDtsDetailDTOs = [
      { modeOfTravel: 'Others', otherModeOfTravel: '', isDts: 'Yes', tempAmount: '500', amount: '500' }
    ];

    const isValid = (component as any).runLtcClientValidationOnly();

    expect(isValid).toBeFalse();
    expect(component.setTab).toHaveBeenCalledWith('ship2');
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please fill Other Mode of Travel for all travel detail rows.',
      'danger'
    );
  });

  it('runLtcClientValidationOnly should fail when non-DTS travel row misses reason', () => {
    const component = createComponent();
    spyOn(component, 'validateSection').and.returnValue(true);
    component.claims.yatDtsDetailDTOs = [
      { modeOfTravel: 'Train', isDts: 'No', reasonForNoDts: '', tempAmount: '500', amount: '500' }
    ];

    const isValid = (component as any).runLtcClientValidationOnly();

    expect(isValid).toBeFalse();
    expect(component.setTab).toHaveBeenCalledWith('ship2');
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please fill the reason for not taking DTS for all non-DTS travel detail rows.',
      'danger'
    );
  });

  it('runLtcClientValidationOnly should pass for a valid LTC input snapshot', () => {
    const component = createComponent();
    spyOn(component, 'validateSection').and.returnValue(true);
    component.claims.yatLtcAdvDTOs[0].isDts = 'Yes';
    component.claims.yatLtcAdvDTOs[0].reasonForNoDts = '';
    component.claims.yatDtsDetailDTOs = [
      { modeOfTravel: 'Train', isDts: 'Yes', tempAmount: '1000', amount: '1000', reasonForNoDts: '' }
    ];

    const isValid = (component as any).runLtcClientValidationOnly();

    expect(isValid).toBeTrue();
  });

  it('should disable preview when claim id is absent', () => {
    const component = createComponent();
    component.claims.claimId = null;
    FormLtcAdvanceComponent.prototype.checkForPreviewBtn.call(component);

    expect(component.isPreviewDisabled).toBeTrue();
  });

  it('should enable preview when claim id is present', () => {
    const component = createComponent();
    component.claims.claimId = 888;
    FormLtcAdvanceComponent.prototype.checkForPreviewBtn.call(component);

    expect(component.isPreviewDisabled).toBeFalse();
  });

  it('should block preview navigation when claim id is missing', () => {
    const component = createComponent();
    component.claims.claimId = null;
    component.claimIdParam = null;

    component.navigatePreview();

    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please save the LTC form first.',
      'danger'
    );
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to LTC preview with supplementary query params', () => {
    const component = createComponent();
    component.claims.claimId = 222;
    component.supplementaryId = 'SUP-LTC-1';
    component.activeSubFormId = 'L';

    component.navigatePreview();

    expect(component.router.navigate).toHaveBeenCalledWith(
      ['../preview-ltc-advance'],
      {
        relativeTo: undefined,
        queryParams: {
          claimId: 222,
          subFormId: 'L',
          supId: 'SUP-LTC-1'
        }
      }
    );
  });

  it('should resolve LTC form kind and sub form id helpers', () => {
    const component = createComponent();

    expect((component as any).resolveFormKind('claim')).toBe('claim');
    expect((component as any).resolveFormKind('advance')).toBe('advance');
    expect((component as any).resolveFormKind(undefined)).toBe('advance');

    expect((component as any).resolveSubFormId('LTC')).toBe('L');
    expect((component as any).resolveSubFormId('LC')).toBe('L');
    expect((component as any).resolveSubFormId(undefined)).toBe('L');
  });

  it('should derive LTC current and preview routes from form kind', () => {
    const component = createComponent();
    component.activeFormKind = 'advance';
    expect((component as any).getCurrentFormRoute()).toBe('form-ltc');
    expect((component as any).getPreviewRoute()).toBe('preview-ltc-advance');

    component.activeFormKind = 'claim';
    expect((component as any).getCurrentFormRoute()).toBe('form-ltc-claim');
    expect((component as any).getPreviewRoute()).toBe('preview-ltc-claim');
  });
});

