import { of, Subject, throwError } from 'rxjs';
import { FormFteComponent } from './form-fte.component';

describe('FormFteComponent', () => {
  const createComponent = () => {
    const component = Object.create(FormFteComponent.prototype) as any;
    component.codeClaim = { fteAdv: 'F', fteClm: 'FTE' };
    component.codeClaimState = { draft: 'DR', outbox: 'OB' };
    component.codeSignType = { inkSign: 'IS', eSign: 'ES' };
    component.activeFormKind = 'advance';
    component.activeSubFormId = 'F';
    component.claimIdParam = null;
    component.supplementaryId = null;
    component.disableBtn = false;
    component.userIdDetails = { userId: 42, unitId: 'U1', roleTypeId: 'CR' };
    component.claims = {
      claimId: null,
      signWith: 'ES',
      codeSubFormDTO: { subFormId: 'F' },
      codeUnitDTO: { unit: 'U1', descr: 'Unit One' },
      yatForeignDutyAdvDTOs: [{ arrFare: 200, dtsAmount: 100, totalAmt: 0, advAmt: 0, totalBudgetedAmt: 0, isDts: 'Yes', reasonDts: '' }],
      yatForeignTravelDetailDTOs: [],
      yatDtsDetailDTOs: [],
      yatClaimBankDetailDTO: { ifscCode: '' },
      gxFormFileUrl: ''
    };
    component.$common = jasmine.createSpyObj('CommonService', ['showMessage', 'parseResponse', 'checkForValidFile']);
    component.$common.parseResponse.and.callFake((r: any) => r);
    component.$common.checkForValidFile.and.returnValue(true);
    component.$claim = jasmine.createSpyObj('ClaimService', ['checkEsignAvailability', 'createOrUpdateIfsc', 'createOrUpdateClaim']);
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$claim.createOrUpdateIfsc.and.returnValue(of({ status: true, object: [{ ifscCode: 'SBIN0001' }] }));
    component.$claim.createOrUpdateClaim.and.returnValue(of({ object: [{ claimId: 9001 }] }));
    component.$formManage = jasmine.createSpyObj('FormManageService', ['uploadImg', 'deleteByUrl']);
    component.$formManage.docFileUrl = new Subject<string>();
    component.$formManage.docFileUrlDeleted = new Subject<boolean>();
    component.$auth = jasmine.createSpyObj('AuthService', ['getModuleName']);
    component.$auth.getModuleName.and.returnValue('/creator');
    component.router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    component.activateTab = jasmine.createSpy('activateTab');
    component.validateSection = jasmine.createSpy('validateSection').and.returnValue(true);
    return component;
  };

  it('calculates FTE totals using travel amount plus ARR fare', () => {
    const component = createComponent();
    component.claims.yatForeignTravelDetailDTOs = [{ amount: 300 }, { amount: '200' }];
    component.calculateAmount('F');
    const adv = component.claims.yatForeignDutyAdvDTOs[0];
    expect(adv.totalAmt).toBe(700);
    expect(adv.advAmt).toBe(700);
    expect(adv.totalBudgetedAmt).toBe(800);
  });

  it('requires DTS reason when claim-level DTS is No', () => {
    const component = createComponent();
    component.claims.yatForeignDutyAdvDTOs[0].isDts = 'No';
    component.claims.yatForeignDutyAdvDTOs[0].reasonDts = '  ';
    expect(component.validateDtsFields()).toBeFalse();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Reason for not using DTS is required.', 'danger');
  });

  it('fails client validation when travel rows are missing', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [];
    const ok = (component as any).runClientValidationOnly();
    expect(ok).toBeFalse();
    expect(component.activateTab).toHaveBeenCalledWith('ship4');
  });

  it('fails client validation when Others mode row has no other mode text', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [{ modeOfTravel: 'Others', otherModeOfTravel: '', isDts: 'Yes' }];
    const ok = (component as any).runClientValidationOnly();
    expect(ok).toBeFalse();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please fill Other Mode of Travel for all travel detail rows.', 'danger');
  });

  it('submits FTE when client validation passes', () => {
    const component = createComponent();
    spyOn(component as any, 'runClientValidationOnly').and.returnValue(true);
    spyOn(component, 'saveClaim');
    component.submitFte();
    expect(component.saveClaim).toHaveBeenCalledWith('F', 'OB', true);
  });

  it('blocks empty IFSC update', () => {
    const component = createComponent();
    component.newIfscCode = '   ';
    component.submitIFSCUpdate();
    expect(component.$claim.createOrUpdateIfsc).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please enter IFSC code.', 'danger');
  });

  it('updates IFSC and closes modal on successful IFSC API response', () => {
    const component = createComponent();
    component.showIfscModal = true;
    component.newIfscCode = 'SBIN1234';
    component.submitIFSCUpdate();
    expect(component.$claim.createOrUpdateIfsc).toHaveBeenCalled();
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('SBIN0001');
    expect(component.showIfscModal).toBeFalse();
  });

  it('falls back to ink sign when eSign check fails', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: false, message: 'down' }));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe('IS');
    expect(component.$common.showMessage).toHaveBeenCalledWith('down', 'danger');
  });

  it('falls back to ink sign when eSign check throws error', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.$claim.checkEsignAvailability.and.returnValue(throwError(() => new Error('err')));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe('IS');
  });

  it('handles GX upload success and delete confirmation flow', () => {
    const component = createComponent();
    component.uploadGxForm({ target: { files: [{ size: 1024 }], value: '' } } as any);
    component.$formManage.docFileUrl.next('gx-fte.pdf');
    expect(component.claims.gxFormFileUrl).toBe('gx-fte.pdf');

    component.claims.gxFormFileUrl = 'gx-fte.pdf';
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteGxForm();
    component.$formManage.docFileUrlDeleted.next(true);
    expect(component.$formManage.deleteByUrl).toHaveBeenCalledWith('gx-fte.pdf');
    expect(component.claims.gxFormFileUrl).toBeNull();
  });

  it('keeps preview disabled without claim id and enables with claim id', () => {
    const component = createComponent();
    component.claims.claimId = null;
    component.checkForPreviewBtn();
    expect(component.isPreviewDisabled).toBeTrue();
    component.claims.claimId = 123;
    component.checkForPreviewBtn();
    expect(component.isPreviewDisabled).toBeFalse();
  });

  it('navigates to FTE preview with supplementary id when available', () => {
    const component = createComponent();
    component.claims.claimId = 777;
    component.supplementaryId = 'SUP-77';
    component.navigatePreview('F', 777);
    expect(component.router.navigate).toHaveBeenCalledWith(['../preview-fte-advance'], {
      queryParams: { id: 777, subFormId: 'F', supId: 'SUP-77' }
    });
  });

  it('uses legacy FTE claim title and preview route in claim mode', () => {
    const component = createComponent();
    component.activeFormKind = 'claim';
    component.activeSubFormId = 'FTE';
    component.claims.claimId = 778;
    component.supplementaryId = 'SUP-78';

    expect(component.pageTitle).toBe('FTE Claim');

    component.navigatePreview('', 778);
    expect(component.router.navigate).toHaveBeenCalledWith(['../preview-fte-claim'], {
      queryParams: { claimId: 778, subFormId: 'FTE', supId: 'SUP-78' }
    });
  });
});

