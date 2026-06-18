import { of, Subject, throwError } from 'rxjs';
import { FormTydutyComponent } from './form-tyduty.component';

describe('FormTydutyComponent', () => {
  const createComponent = () => {
    const component = Object.create(FormTydutyComponent.prototype) as any;
    component.codeClaim = { tyAdv: 'T' };
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
      gxFormFileUrl: 'gx-ty.pdf',
      yatDtsDetailDTOs: [],
      yatTempDutyAdvDTOs: [{
        gxUnit: 'GX',
        gxNumber: 'GX-1',
        gxDate: '2026-01-01',
        purposeType: 'Official',
        arrFare: 100,
        isAvailFoodCharge: false,
        isAvailHotelAcc: false,
        isAvailArr: false,
        isAvailAcc: false,
        totalAmt: 0,
        dtsAmount: 0,
        advAmt: 0,
        totalBudgetedAmt: 0,
        isDts: 'Yes',
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
      yatClaimBankDetailDTO: { ifscCode: 'SBIN0000001', bankAccNo: '1234567890' }
    };
    component.$common = jasmine.createSpyObj('CommonService', ['showMessage', 'parseResponse', 'checkForValidFile', 'showLoader', 'hideLoader']);
    component.$common.parseResponse.and.callFake((r: any) => r);
    component.$common.checkForValidFile.and.returnValue(true);
    component.$claim = jasmine.createSpyObj('ClaimService', [
      'checkEsignAvailability',
      'createOrUpdateIfsc',
      'createOrUpdateAdvance',
      'getSingleClaim',
      'changeClaimStatusById',
      'prepareForESign',
      'notifyStatusCountRefresh',
    ]);
    component.$claim.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$claim.createOrUpdateIfsc.and.returnValue(of({ status: true, object: [{ ifscCode: 'SBIN0099' }] }));
    component.$claim.createOrUpdateAdvance.and.returnValue(of({ object: [{ claimId: 321 }] }));
    component.$claim.getSingleClaim.and.returnValue(of({ status: false }));
    component.$claim.changeClaimStatusById.and.returnValue(of({ status: true }));
    component.$claim.prepareForESign.and.returnValue(of({ status: true }));
    component.$codeDocInfo = jasmine.createSpyObj('CodeDocInfoService', ['setDocument']);
    component.$formManage = jasmine.createSpyObj('FormManageService', ['uploadImg', 'deleteByUrl']);
    component.$formManage.docFileUrl = new Subject<string>();
    component.$formManage.docFileUrlDeleted = new Subject<boolean>();
    component.$auth = jasmine.createSpyObj('AuthService', ['getModuleName']);
    component.$auth.getModuleName.and.returnValue('/adv/creator');
    component.UtilService = { toMillis: (value: any) => value };
    component.router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    component.activateTab = jasmine.createSpy('activateTab');
    component.validateSection = jasmine.createSpy('validateSection').and.returnValue(true);
    return component;
  };

  it('defaults hidden claim-level DTS flag to Yes like legacy TY init', () => {
    const component = createComponent();
    const adv = (component as any).createEmptyTyAdv();
    expect(adv.isDts).toBe('Yes');
  });

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

    component.calculateAmount('T');

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
    spyOn(window, 'open');
    component.claims.claimId = 555;
    component.supplementryId = 'SUP-TY-1';
    component.navigatePreview('', 555);
    expect(window.open).toHaveBeenCalledWith(
      '/adv/creator/preview-ty-duty?id=555&supId=SUP-TY-1',
      '_blank'
    );
  });

  it('uses legacy TY claim title and preview route in claim mode', () => {
    const component = createComponent();
    component.activeFormKind = 'claim';
    component.activeSubFormId = 'TYD';
    component.claims.claimId = 556;
    component.supplementryId = 'SUP-TY-2';

    expect(component.pageTitle).toBe('Supplementary TY Duty Claim');

    component.$auth.getModuleName.and.returnValue('/claim/creator');
    spyOn(window, 'open');
    component.navigatePreview('', 556);
    expect(window.open).toHaveBeenCalledWith(
      '/claim/creator/preview-ty-duty-claim?id=556&subFormId=TYD&supId=SUP-TY-2',
      '_blank'
    );
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
    expect(component.$formManage.deleteByUrl).not.toHaveBeenCalled();
    expect((component.claims as any).deleteGxFileUrl).toBe('gx-ty.pdf');
    expect(component.claims.gxFormFileUrl).toBeNull();
    expect(component.showGxFileBrowse).toBeTrue();
  });

  it('rejects submit when section validation fails', () => {
    const component = createComponent();
    component.validateSection.and.returnValues(true, false, true, true);
    component.submitTy();
    expect(component.$claim.createOrUpdateAdvance).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please fill required fields.', 'danger');
  });

  it('rejects submit when business validation fails', () => {
    const component = createComponent();
    component.claims.codeUnitDTO = { unit: '', descr: '' };
    component.submitTy();
    expect(component.$claim.createOrUpdateAdvance).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please select the applied to unit.', 'danger');
  });

  it('rejects submit when legacy bank details are missing', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: 100, modeOfTravel: 'Train' }];
    component.claims.yatClaimBankDetailDTO.ifscCode = '';
    const saveSpy = spyOn(component, 'saveClaim');

    component.submitTy();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.tyBusinessInvalidSection).toBe('ship4');
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please fill IFSC Code.', 'danger');
  });

  it('keeps legacy Form Validate as validation-only and does not save', () => {
    const component = createComponent();
    const saveSpy = spyOn(component, 'saveClaim');

    component.validate('T', 'OB');

    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.$claim.createOrUpdateAdvance).not.toHaveBeenCalled();
  });

  it('submits TY claim when section and business validations pass', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: 100, modeOfTravel: 'Train' }];
    const saveSpy = spyOn(component, 'saveClaim');
    component.submitTy();
    expect(saveSpy).toHaveBeenCalledWith('T', 'OB', true);
  });

  it('updates an edited TY travel row by legacy primary key', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [
      { ltcTravelPrimaryKey: 'row-a', source: 'A', destination: 'B', modeOfTravel: 'Train', amount: 100, tempAmount: 100, isDts: 'Yes' },
      { ltcTravelPrimaryKey: 'row-b', source: 'C', destination: 'D', modeOfTravel: 'Air', amount: 200, tempAmount: 200, isDts: 'Yes' },
    ];
    component.selectedTravelIndex = 0;

    component.addLtcTravelDetails({
      ltcTravelPrimaryKey: 'row-b',
      source: 'C',
      destination: 'E',
      modeOfTravel: 'Air',
      amount: 250,
      tempAmount: 250,
      isDts: 'Yes',
    } as any, 'T');

    expect(component.claims.yatDtsDetailDTOs.length).toBe(2);
    expect(component.claims.yatDtsDetailDTOs[0].destination).toBe('B');
    expect(component.claims.yatDtsDetailDTOs[1].destination).toBe('E');
    expect(component.claims.yatDtsDetailDTOs[1].amount).toBe(250);
  });

  it('cleans TY travel UI-only fields from save payload', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [{
      ltcTravelPrimaryKey: 'row-a',
      source: 'A',
      destination: 'B',
      modeOfTravel: 'Train',
      amount: '1,200',
      tempAmount: '',
      isDts: 'Yes',
      _reasonForNoDtsError: true,
    }];

    component.saveClaim('T', 'DR', false);

    const formData = component.$claim.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.yatDtsDetailDTOs[0].amount).toBe(1200);
    expect(payload.yatDtsDetailDTOs[0].tempAmount).toBeUndefined();
    expect(payload.yatDtsDetailDTOs[0]._reasonForNoDtsError).toBeUndefined();
  });

  it('starts common eSign modal flow after eSign submit save', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';

    component.saveClaim('T', 'OB', true);

    expect(component.$claim.prepareForESign).toHaveBeenCalled();
    expect(component.eSignTempFormObj).toEqual(jasmine.objectContaining({
      id: 321,
      claimId: 321,
      status: 'OB',
      userId: 42,
    }));
    expect(component.router.navigateByUrl).not.toHaveBeenCalledWith('/adv/creator/new');
  });

  it('clears deferred GX delete marker after saved response merge', () => {
    const component = createComponent();
    component.claims.gxFormFileUrl = 'new-gx.pdf';
    (component.claims as any).deleteGxFileUrl = 'old-gx.pdf';

    component['mergeSavedTyResponse']({
      claimId: 321,
      gxFormFileUrl: 'new-gx.pdf',
      yatTempDutyAdvDTOs: [{}],
    });

    expect((component.claims as any).deleteGxFileUrl).toBeUndefined();
    expect(component.claims.gxFormFileUrl).toBe('new-gx.pdf');
  });

  it('loads TY details with legacy claim/single headers', () => {
    const component = createComponent();
    component.getFormDetails();

    expect(component.$claim.getSingleClaim).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({
        claimId: '',
        userId: 42,
        isFetch: 'true',
        subFormId: 'T',
        isPreview: 'false',
        gxUnitId: '2',
      }),
    });
  });

  it('syncs TY route state from current query params', () => {
    const component = createComponent();
    component.route = {
      snapshot: {
        data: { subFormId: 'T', formKind: 'advance' },
        routeConfig: { path: 'form-ty-duty' },
      },
    };
    const values: Record<string, string> = {
      id: 'C_ID_1',
      claimId: 'C_ID_ANGULAR_OLD',
      subFormId: 'T',
      gxUnitId: '226',
      supId: 'SUP_1',
      extnId: 'EXT_1',
    };

    component['syncRouteStateFromQuery']({
      get: (key: string) => values[key] || null,
    });

    expect(component.activeSubFormId).toBe('T');
    expect(component.claimIdParam).toBe('C_ID_1');
    expect(component.gxUnitId).toBe(226);
    expect(component.supplementryId).toBe('SUP_1');
    expect(component.extnClaimId).toBe('EXT_1');
    expect(component.claims.codeSubFormDTO.subFormId).toBe('T');
  });

  it('ignores old claimId query key for TY advance routes and keeps it only for claim wrappers', () => {
    const component = createComponent();
    component.route = {
      snapshot: {
        data: { subFormId: 'T', formKind: 'advance' },
        routeConfig: { path: 'form-ty-duty' },
      },
    };

    component['syncRouteStateFromQuery']({
      get: (key: string) => ({ claimId: 'C_ID_OLD', subFormId: 'T' }[key] || null),
    });

    expect(component.claimIdParam).toBeNull();

    component.route = {
      snapshot: {
        data: { subFormId: 'TYD', formKind: 'claim' },
        routeConfig: { path: 'form-ty-duty-claim' },
      },
    };

    component['syncRouteStateFromQuery']({
      get: (key: string) => ({ claimId: 'C_ID_CLAIM', subFormId: 'TYD' }[key] || null),
    });

    expect(component.claimIdParam).toBe('C_ID_CLAIM');
  });

  it('prefers legacy id query key over claimId for TY edit route state', () => {
    const component = createComponent();
    component.route = {
      snapshot: {
        data: { subFormId: 'T', formKind: 'advance' },
        routeConfig: { path: 'form-ty-duty' },
      },
    };

    component['syncRouteStateFromQuery']({
      get: (key: string) => ({
        id: 'C_ID_LEGACY',
        claimId: 'C_ID_ANGULAR_OLD',
        subFormId: 'T',
      }[key] || null),
    });

    expect(component.claimIdParam).toBe('C_ID_LEGACY');
    expect(component.formId).toBe('C_ID_LEGACY');
  });

  it('maps new TY form personal and bank details from claim/single response', () => {
    const component = createComponent();
    component.$claim.getSingleClaim.and.returnValue(of({
      status: true,
      object: [{
        yatTempDutyAdvDTOs: [{
          pno: '01361-T',
          name: 'M KalaiMurthy',
          rank: 'P/ADH(P)',
          payLevel: 'L08',
          basicPay: 64100,
          videPresentUnit: 'ICGS Delhi',
        }],
        yatClaimBankDetailDTO: {
          bankName: 'HDFC BANK LTD',
          ifscCode: 'HDFC0000013',
          bankAccNo: '00131150000656',
          micrCode: 'MICR1',
        },
        yatDtsDetailDTOs: [
          { isDts: 'Yes', amount: '1,200' },
          { isDts: 'No', amount: '500', tempAmount: '' },
          { isDts: 'NA', amount: '' },
        ],
      }],
    }));

    component.getFormDetails();

    const adv = component.claims.yatTempDutyAdvDTOs[0];
    expect(adv.name).toBe('M KalaiMurthy');
    expect(adv.rank).toBe('P/ADH(P)');
    expect(adv.pno).toBe('01361-T');
    expect(adv.payLevel).toBe('L08');
    expect(adv.basicPay).toBe(64100);
    expect(adv.videPresentUnit).toBe('ICGS Delhi');
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('HDFC0000013');
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect(component.claims.yatDtsDetailDTOs[0].amount).toBe(1200);
    expect(component.claims.yatDtsDetailDTOs[0].tempAmount).toBe(1200);
    expect(component.claims.yatDtsDetailDTOs[1].amount).toBe(500);
    expect(component.claims.yatDtsDetailDTOs[1].tempAmount).toBe(500);
    expect(component.claims.yatDtsDetailDTOs[2].amount).toBeNull();
    expect(component.claims.yatDtsDetailDTOs[2].tempAmount).toBeNull();
    expect(component.claims.claimId).toBeNull();
    expect(component.isPreviewDisabled).toBeTrue();
  });

  it('does not hydrate TY advance personal fields from non-legacy flattened roots', () => {
    const component = createComponent();
    component.claims.yatTempDutyAdvDTOs[0].name = null;
    component.claims.yatTempDutyAdvDTOs[0].rank = null;
    component.claims.yatTempDutyAdvDTOs[0].pno = null;
    component.$claim.getSingleClaim.and.returnValue(of({
      status: true,
      object: [{
        name: 'Flattened User',
        rank: 'Rank Root',
        pno: 'PNO-ROOT',
        userBasicDetailDTO: {
          name: 'User Root',
          rank: 'Root Rank',
          pno: 'PNO-USER',
        },
        bankDetailDTO: {
          ifscCode: 'IGNORED0001',
          bankAccNo: 'IGNORED',
        },
      }],
    }));

    component.getFormDetails();

    const adv = component.claims.yatTempDutyAdvDTOs[0];
    expect(adv.name).toBeNull();
    expect(adv.rank).toBeNull();
    expect(adv.pno).toBeNull();
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('SBIN0000001');
  });

  it('does not set fake claim id when new TY response is false', () => {
    const component = createComponent();
    component.$claim.getSingleClaim.and.returnValue(of({ status: false, message: 'No Record' }));

    component.getFormDetails();

    expect(component.claims.claimId).toBeNull();
    expect(component.isPreviewDisabled).toBeTrue();
  });
});

