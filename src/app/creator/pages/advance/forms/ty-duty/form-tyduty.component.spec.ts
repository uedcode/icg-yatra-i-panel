import { of, Subject, throwError } from 'rxjs';
import { FormTydutyComponent } from './form-tyduty.component';

describe('FormTydutyComponent', () => {
  const createComponent = () => {
    const component = Object.create(FormTydutyComponent.prototype) as any;
    component.codeClaim = { tyAdv: 'TYA' };
    component.codeClaimState = { draft: 'DR', outbox: 'OB' };
    component.codeSignType = { inkSign: 'IS', eSign: 'ES' };
    component.claimIdParam = null;
    component.supplementryId = null;
    component.activeFormKind = 'advance';
    component.activeSubFormId = 'T';
    component.gxUnitId = 2;
    component.userIdDetails = { userId: 42, unitId: 'U1' };
    component.claims = {
      claimId: null,
      signWith: 'ES',
      codeUnitDTO: { unit: 'U1', descr: 'Unit One' },
      gxFormFileUrl: '',
      yatDtsDetailDTOs: [],
      yatTempDutyAdvDTOs: [{
        arrFare: 100,
        isAvailFoodCharge: false,
        isAvailHotelAcc: false,
        isAvailArr: false,
        isAvailAcc: false,
        totalAmt: 0,
        dtsAmount: 0,
        advAmt: 0,
        totalBudgetedAmt: 0,
        stationProceedingTo: 'Mumbai',
        foodChargeDays: null,
        foodChargeRatePerDay: null,
        hotelAccDays: null,
        hotelAccRatePerDay: null,
        arrToDutyRate: null,
        arrToDutyKm: null,
        accHToDutyPerDay: null,
        accHToDutyDays: null
      }],
      yatClaimBankDetailDTO: { ifscCode: '' }
    };
    component.$common = jasmine.createSpyObj('CommonService', ['showMessage', 'parseResponse', 'checkForValidFile']);
    component.$common.parseResponse.and.callFake((r: any) => r);
    component.$common.checkForValidFile.and.returnValue(true);
    component.$claim = jasmine.createSpyObj('ClaimService', ['checkEsignAvailability', 'createOrUpdateIfsc', 'createOrUpdateClaim']);
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$claim.createOrUpdateIfsc.and.returnValue(of({ status: true, object: [{ ifscCode: 'SBIN0099' }] }));
    component.$claim.createOrUpdateClaim.and.returnValue(of({ object: [{ claimId: 321 }] }));
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

  it('calculates TY amounts with ARR, food, hotel, and DTS split', () => {
    const component = createComponent();
    const adv = component.claims.yatTempDutyAdvDTOs[0];
    adv.isAvailFoodCharge = true;
    adv.foodChargeDays = 2;
    adv.foodChargeRatePerDay = 100;
    adv.foodChargePerc = 10;
    adv.isAvailHotelAcc = true;
    adv.hotelAccDays = 1;
    adv.hotelAccRatePerDay = 200;
    adv.hotelChargePerc = 10;
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: 50 }, { isDts: 'No', tempAmount: 25 }];

    component.calculateAmount('TYA');

    expect(adv.totalAmt).toBeGreaterThan(0);
    expect(adv.dtsAmount).toBe(50);
    expect(adv.totalBudgetedAmt).toBeGreaterThanOrEqual(adv.dtsAmount);
  });

  it('keeps preview disabled without claim id and enables with claim id', () => {
    const component = createComponent();
    component.claims.claimId = null;
    component.checkForPreviewBtn();
    expect(component.isPreviewDisabled).toBeTrue();
    component.claims.claimId = 100;
    component.checkForPreviewBtn();
    expect(component.isPreviewDisabled).toBeFalse();
  });

  it('navigates TY preview with supplementary id', () => {
    const component = createComponent();
    component.claims.claimId = 555;
    component.supplementryId = 'SUP-TY-1';
    component.navigatePreview('TYA', 555);
    expect(component.router.navigate).toHaveBeenCalledWith(['../form-tyduty-detail'], {
      queryParams: { claimId: 555, subFormId: 'T', supId: 'SUP-TY-1' }
    });
  });

  it('uses legacy TY claim title and preview route in claim mode', () => {
    const component = createComponent();
    component.activeFormKind = 'claim';
    component.activeSubFormId = 'TYD';
    component.claims.claimId = 556;
    component.supplementryId = 'SUP-TY-2';

    expect(component.pageTitle).toBe('Supplementary TY Duty Claim');

    component.navigatePreview('', 556);
    expect(component.router.navigate).toHaveBeenCalledWith(['../preview-ty-duty-claim'], {
      queryParams: { claimId: 556, subFormId: 'TYD', supId: 'SUP-TY-2' }
    });
  });

  it('falls back to ink sign when eSign is unavailable', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: false, message: 'disabled' }));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe('IS');
    expect(component.$common.showMessage).toHaveBeenCalledWith('disabled', 'danger');
  });

  it('falls back to ink sign when eSign check errors', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.$claim.checkEsignAvailability.and.returnValue(throwError(() => new Error('down')));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe('IS');
  });

  it('blocks IFSC update when input is empty', () => {
    const component = createComponent();
    component.newIfscCode = ' ';
    component.submitIFSCUpdate();
    expect(component.$claim.createOrUpdateIfsc).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please enter IFSC code.', 'danger');
  });

  it('updates IFSC value on successful API response', () => {
    const component = createComponent();
    component.newIfscCode = 'SBIN7777';
    component.submitIFSCUpdate();
    expect(component.$claim.createOrUpdateIfsc).toHaveBeenCalled();
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('SBIN0099');
  });

  it('handles GX upload success and delete flow', () => {
    const component = createComponent();
    component.uploadGxForm({ target: { files: [{ size: 1024 }], value: '' } } as any);
    component.$formManage.docFileUrl.next('gx-ty.pdf');
    expect(component.claims.gxFormFileUrl).toBe('gx-ty.pdf');

    component.claims.gxFormFileUrl = 'gx-ty.pdf';
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteGxForm();
    component.$formManage.docFileUrlDeleted.next(true);
    expect(component.$formManage.deleteByUrl).toHaveBeenCalledWith('gx-ty.pdf');
    expect(component.claims.gxFormFileUrl).toBeNull();
  });

  it('rejects submit when section validation fails', () => {
    const component = createComponent();
    component.validateSection.and.returnValues(true, false, true, true);
    component.submitTy();
    expect(component.$claim.createOrUpdateClaim).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please fill required fields.', 'danger');
  });

  it('rejects submit when business validation fails', () => {
    const component = createComponent();
    component.claims.codeUnitDTO = { unit: '', descr: '' };
    component.submitTy();
    expect(component.$claim.createOrUpdateClaim).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please select the applied to unit.', 'danger');
  });

  it('submits TY claim when section and business validations pass', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: 100, modeOfTravel: 'Train' }];
    const saveSpy = spyOn(component, 'saveClaim');
    component.submitTy();
    expect(saveSpy).toHaveBeenCalledWith('TYA', 'OB', true);
  });
});

