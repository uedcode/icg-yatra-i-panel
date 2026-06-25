import { of, throwError } from 'rxjs';
import { FormFteComponent } from './form-fte.component';

describe('FormFteComponent', () => {
  const createComponent = () => {
    const component = Object.create(FormFteComponent.prototype) as any;
    component.codeClaim = { fteAdv: 'F', fteClm: 'FTE' };
    component.codeClaimState = { draft: 'DR', outbox: 'OB' };
    component.codeSignType = { inkSign: 'IS', eSign: 'ES' };
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
    component.$common = jasmine.createSpyObj('CommonService', ['showMessage', 'parseResponse', 'checkForValidFile', 'showLoader', 'hideLoader']);
    component.$common.parseResponse.and.callFake((r: any) => r);
    component.$common.checkForValidFile.and.returnValue(true);
    component.$claimApi = jasmine.createSpyObj('ClaimApiService', [
      'checkEsignAvailability',
      'createOrUpdateAdvance',
      'getSingleClaim',
      'changeClaimStatusById',
      'prepareForESign',
      'notifyStatusCountRefresh',
    ]);
    component.$claimApi.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$claimApi.createOrUpdateAdvance.and.returnValue(of({ object: [{ claimId: 9001 }] }));
    component.$claimApi.getSingleClaim.and.returnValue(of({ status: true, object: [] }));
    component.$bankIfscApi = jasmine.createSpyObj('BankIfscApiService', ['createOrUpdate']);
    component.$bankIfscApi.createOrUpdate.and.returnValue(of({ status: true, object: [{ ifscCode: 'SBIN0001' }] }));
    component.$claimStateApi = jasmine.createSpyObj('ClaimStateApiService', ['changeStatusById', 'notifyStatusCountRefresh']);
    component.$claimStateApi.changeStatusById.and.returnValue(of({ status: true }));
    component.$esignApi = jasmine.createSpyObj('EsignApiService', ['checkEsignAvailability', 'prepareForESign']);
    component.$esignApi.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$esignApi.prepareForESign.and.returnValue(of({ status: true }));
    component.$formDocument = jasmine.createSpyObj('FormDocumentService', ['uploadSupportDoc', 'deleteSupportDocByUrl']);
    component.$formDocument.uploadSupportDoc.and.returnValue(of('gx-fte.pdf'));
    component.$formDocument.deleteSupportDocByUrl.and.returnValue(of(true));
    component.$tyDutyPurposeApi = jasmine.createSpyObj('TyDutyPurposeApiService', ['getAll']);
    component.$tyDutyPurposeApi.getAll.and.returnValue(of({
      status: true,
      object: [
        { descr: 'Other' },
        { descr: 'Investiture Ceremony' },
        { descr: 'Official Duty' },
      ],
    }));
    component.$auth = jasmine.createSpyObj('AuthService', ['getModuleName']);
    component.$auth.getModuleName.and.returnValue('/adv/creator');
    component.previewWindow = jasmine.createSpyObj('PreviewWindowService', ['openUrl']);
    component.router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    component.UtilService = jasmine.createSpyObj('UtilService', ['toMillis']);
    component.UtilService.toMillis.and.callFake((value: any) => value);
    component.activateTab = jasmine.createSpy('activateTab');
    component.validateSection = jasmine.createSpy('validateSection').and.returnValue(true);
    component.purposeType = {
      investive: 'Investiture Ceremony',
      other: 'Other',
    };
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

  it('defaults hidden claim-level DTS flag to Yes like legacy FTE init', () => {
    const component = createComponent();
    const adv = (component as any).createEmptyFteAdv();
    expect(adv.isDts).toBe('Yes');
    expect(adv.reasonDts).toBeNull();
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
    expect(component.activateTab).toHaveBeenCalledWith('ship2');
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

  it('matches legacy foreign travel amount and remark validation order', () => {
    const component = createComponent();
    component.tempForeignTravelDetail = { amount: '', descr: '' };

    component.addForeignTravelDetail();

    expect(component.$common.showMessage).toHaveBeenCalledWith('Amount Field is required', 'danger');
    expect(component.claims.yatForeignTravelDetailDTOs.length).toBe(0);

    component.$common.showMessage.calls.reset();
    component.tempForeignTravelDetail = { amount: '1000', descr: '' };

    component.addForeignTravelDetail();

    expect(component.$common.showMessage).toHaveBeenCalledWith('Remark Field is required', 'danger');
    expect(component.claims.yatForeignTravelDetailDTOs.length).toBe(0);
  });

  it('filters FTE travel source and destination like legacy alphabet-only inputs', () => {
    const component = createComponent();
    const sourceEvent = { target: { value: 'Delhi-123' } };
    const destinationEvent = { target: { value: 'Goa @ Port 45' } };

    component.allowOnlyTravelAlphabets(sourceEvent as any, 'source');
    component.allowOnlyTravelAlphabets(destinationEvent as any, 'destination');

    expect(sourceEvent.target.value).toBe('Delhi');
    expect(destinationEvent.target.value).toBe('Goa  Port ');
    expect(component.tempFteTravel.source).toBe('Delhi');
    expect(component.tempFteTravel.destination).toBe('Goa  Port ');
  });

  it('blocks empty IFSC update', () => {
    const component = createComponent();
    component.newIfscCode = '   ';
    component.submitIFSCUpdate();
    expect(component.$bankIfscApi.createOrUpdate).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please enter IFSC code.', 'danger');
  });

  it('updates IFSC and closes modal on successful IFSC API response', () => {
    const component = createComponent();
    component.showIfscModal = true;
    component.newIfscCode = 'SBIN1234';
    component.submitIFSCUpdate();
    expect(component.$bankIfscApi.createOrUpdate).toHaveBeenCalled();
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('SBIN0001');
    expect(component.showIfscModal).toBeFalse();
  });

  it('falls back to ink sign when eSign check fails', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.$esignApi.checkEsignAvailability.and.returnValue(of({ status: false, message: 'down' }));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe('IS');
    expect(component.$common.showMessage).toHaveBeenCalledWith('down', 'danger');
  });

  it('falls back to ink sign when eSign check throws error', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.$esignApi.checkEsignAvailability.and.returnValue(throwError(() => new Error('err')));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe('IS');
  });

  it('loads FTE purpose types and removes Investiture Ceremony like legacy', () => {
    const component = createComponent();

    component.loadFtePurposeTypes();

    expect(component.$dropdownManage.getPurposeTypes).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ subFormId: 'F' }),
    }));
    expect(component.purposeTypes).toEqual([
      { descr: 'Other' },
      { descr: 'Official Duty' },
    ]);
  });

  it('clears stale FTE purpose and guest details when purpose type changes', () => {
    const component = createComponent();
    component.claims.yatForeignDutyAdvDTOs[0] = {
      ...component.claims.yatForeignDutyAdvDTOs[0],
      purposeType: 'Official Duty',
      purpose: 'Old purpose',
      personName: 'Guest',
      relation: 'Cousin',
      age: 25,
      gender: 'M',
    };

    component.clearChangeData();

    expect(component.claims.yatForeignDutyAdvDTOs[0]).toEqual(jasmine.objectContaining({
      purpose: null,
      personName: null,
      relation: null,
      age: null,
      gender: null,
    }));
  });

  it('handles GX upload success and delete confirmation flow', () => {
    const component = createComponent();
    component.uploadGxForm({ target: { files: [{ size: 1024 }], value: '' } } as any);
    expect(component.claims.gxFormFileUrl).toBe('gx-fte.pdf');

    component.claims.gxFormFileUrl = 'gx-fte.pdf';
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteGxForm();
    expect(component.$formDocument.deleteSupportDocByUrl).not.toHaveBeenCalled();
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

  it('maps legacy claim/single FTE response into personal, bank, and travel details', () => {
    const component = createComponent();
    component.claimIdParam = 'C_ID_FTE_1';
    component.supplementaryId = 'SUP-FTE-1';
    component.$claimApi.getSingleClaim.and.returnValue(
      of({
        status: true,
        object: [{
          claimId: 'C_ID_FTE_1',
          signWith: 'ES',
          gxFormFileUrl: 'gx-form.pdf',
          yatForeignDutyAdvDTOs: [{
            pno: '01361-T',
            name: 'M Kalai',
            rank: 'P/ADH(P)',
            payLevel: 'L08',
            basicPay: 64100,
            videPresentUnit: 'ICGS Delhi',
            tempTransTo: 'FOREIGN',
            stationProceedingTo: 'Station X',
            arrFare: 200,
            totalAmt: 500,
            advAmt: 500,
            dtsAmount: 100,
            totalBudgetedAmt: 600,
          }],
          yatForeignTravelDetailDTOs: [{
            id: 'TRV-1',
            fromPlace: 'Delhi',
            toPlace: 'Mumbai',
            amount: '300',
          }],
          yatDtsDetailDTOs: [{
            fromPlace: 'Delhi',
            toPlace: 'Mumbai',
            amount: 300,
            tempAmount: 250,
          }],
          yatClaimBankDetailDTO: {
            bankName: 'HDFC BANK LTD',
            ifscCode: 'HDFC0000013',
            accountNo: '00131150000656',
          },
        }],
      }) as any
    );

    component.getFormDetails();

    const config = component.$claimApi.getSingleClaim.calls.mostRecent().args[0];
    expect(config.headers).toEqual(jasmine.objectContaining({
      claimId: 'C_ID_FTE_1',
      subFormId: 'F',
      isPreview: 'false',
      isFetch: 'true',
      userId: 42,
      supCLaimId: 'SUP-FTE-1',
    }));
    expect(component.$common.showLoader).toHaveBeenCalled();
    expect(component.$common.hideLoader).toHaveBeenCalled();

    const adv = component.claims.yatForeignDutyAdvDTOs[0];
    expect(adv.name).toBe('M Kalai');
    expect(adv.pno).toBe('01361-T');
    expect(adv.rank).toBe('P/ADH(P)');
    expect(adv.payLevel).toBe('L08');
    expect(adv.basicPay).toBe(64100);
    expect(adv.videPresentUnit).toBe('ICGS Delhi');
    expect(adv.isDts).toBe('Yes');
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect(component.claims.yatForeignTravelDetailDTOs[0].id).toBe('TRV-1');
    expect(component.claims.yatForeignTravelDetailDTOs[0].amount).toBe(300);
    expect(component.claims.yatDtsDetailDTOs[0].tempAmount).toBe(250);
    expect(component.showGxFileBrowse).toBeFalse();
    expect(component.isPreviewDisabled).toBeFalse();
  });

  it('normalizes saved string and empty FTE travel amounts from legacy response', () => {
    const component = createComponent();
    component.$claimApi.getSingleClaim.and.returnValue(
      of({
        status: true,
        object: [{
          claimId: 'C_ID_FTE_AMT',
          yatForeignDutyAdvDTOs: [{ pno: '01361-T', name: 'M Kalai' }],
          yatForeignTravelDetailDTOs: [
            { id: 'FOREIGN-1', descr: 'Ticket', amount: '1,200' },
            { id: 'FOREIGN-2', descr: 'Blank row', amount: '' },
          ],
          yatDtsDetailDTOs: [
            { fromPlace: 'Delhi', toPlace: 'Mumbai', amount: '400' },
            { fromPlace: 'Mumbai', toPlace: 'Goa', amount: '500', tempAmount: '' },
          ],
        }],
      }) as any
    );

    component.getFormDetails();

    expect(component.claims.yatForeignTravelDetailDTOs[0].amount).toBe(1200);
    expect(component.claims.yatForeignTravelDetailDTOs[1].amount).toBeNull();
    expect(component.claims.yatDtsDetailDTOs[0].amount).toBe(400);
    expect(component.claims.yatDtsDetailDTOs[0].tempAmount).toBe(400);
    expect(component.claims.yatDtsDetailDTOs[1].amount).toBe(500);
    expect(component.claims.yatDtsDetailDTOs[1].tempAmount).toBe(500);
  });

  it('saves FTE draft through advance endpoint, strips UI row keys, and merges saved response', () => {
    const component = createComponent();
    component.claims.claimId = null;
    component.claims.deleteGxFileUrl = 'old-gx.pdf';
    component.claims.gxFormFileUrl = 'new-gx.pdf';
    component.claims.yatForeignDutyAdvDTOs[0] = {
      ...component.claims.yatForeignDutyAdvDTOs[0],
      advAmt: 900,
      gxDate: '2026-01-01',
      date: '2026-01-02',
      wefDate: '2026-01-03',
    };
    component.claims.yatDtsDetailDTOs = [{
      fromPlace: 'Delhi',
      toPlace: 'Mumbai',
      amount: 500,
      tempAmount: 350,
      _reasonError: true,
      ltcTravelPrimaryKey: 12,
    }, {
      fromPlace: 'Mumbai',
      toPlace: 'Goa',
      amount: 500,
      tempAmount: '',
      _reasonError: false,
      ltcTravelPrimaryKey: 13,
    }];
    component.claims.yatForeignTravelDetailDTOs = [{
      id: 'LOCAL-ROW',
      descr: 'Air fare',
      amount: '1,250',
      ltcTravelPrimaryKey: 'UI-ONLY',
    }];
    component.$claimApi.createOrUpdateAdvance.and.returnValue(
      of({
        status: true,
        message: 'Saved',
        object: [{
          claimId: 'C_ID_SAVE_FTE',
          gxFormFileUrl: 'new-gx.pdf',
          yatForeignDutyAdvDTOs: [{ advAmt: 950, totalAmt: 950 }],
          yatDtsDetailDTOs: [{ fromPlace: 'Delhi', toPlace: 'Mumbai', amount: 350 }],
          yatForeignTravelDetailDTOs: [{ id: 'DB-ROW', descr: 'Air fare', amount: 550 }],
          yatClaimBankDetailDTO: { accountNo: '00131150000656', ifscCode: 'HDFC0000013' },
        }],
      }) as any
    );

    component.saveClaim('F', 'DR');

    expect(component.$claimApi.createOrUpdateAdvance).toHaveBeenCalled();
    const formData = component.$claimApi.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimAmt).toBe(payload.yatForeignDutyAdvDTOs[0].advAmt);
    expect(payload.yatDtsDetailDTOs[0].amount).toBe(350);
    expect(payload.yatDtsDetailDTOs[1].amount).toBe(500);
    expect(payload.yatDtsDetailDTOs[0].tempAmount).toBeUndefined();
    expect(payload.yatDtsDetailDTOs[0]._reasonError).toBeUndefined();
    expect(payload.yatDtsDetailDTOs[0].ltcTravelPrimaryKey).toBeUndefined();
    expect(payload.yatForeignTravelDetailDTOs[0].amount).toBe(1250);
    expect(payload.yatForeignTravelDetailDTOs[0].ltcTravelPrimaryKey).toBeUndefined();
    expect(payload.yatDocsDTOs).toEqual([]);

    expect(component.claims.claimId).toBe('C_ID_SAVE_FTE');
    expect(component.claims.yatForeignDutyAdvDTOs[0].advAmt).toBe(950);
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect(component.claims.yatForeignTravelDetailDTOs[0].id).toBe('DB-ROW');
    expect((component.claims as any).deleteGxFileUrl).toBeUndefined();
    expect(component.$claimStateApi.changeStatusById).toHaveBeenCalled();
    expect(component.$claimStateApi.notifyStatusCountRefresh).toHaveBeenCalled();
    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
  });

  it('submits eSign FTE through prepareForESign after advance save', () => {
    const component = createComponent();
    component.claims.signWith = 'ES';
    component.userIdDetails = {
      ...component.userIdDetails,
      financialYear: '2026',
      moduleId: 'ADV',
    };
    component.$claimApi.createOrUpdateAdvance.and.returnValue(
      of({
        status: true,
        message: 'Submitted',
        object: [{
          claimId: 'C_ID_SUBMIT_FTE',
          yatForeignDutyAdvDTOs: [{ advAmt: 1200, totalAmt: 1200 }],
          yatDtsDetailDTOs: [],
          yatForeignTravelDetailDTOs: [],
          yatClaimBankDetailDTO: { accountNo: '00131150000656' },
        }],
      }) as any
    );

    component.saveClaim('F', 'OB');

    const formData = component.$claimApi.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('OB');

    expect(component.$esignApi.prepareForESign).toHaveBeenCalledWith(jasmine.objectContaining({
      claimId: 'C_ID_SUBMIT_FTE',
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR',
      financialYear: '2026',
      moduleId: 'ADV',
    }));
    expect(component.$claimStateApi.changeStatusById).not.toHaveBeenCalled();
    expect(component.eSignTempFormObj).toEqual(jasmine.objectContaining({
      id: 'C_ID_SUBMIT_FTE',
      claimId: 'C_ID_SUBMIT_FTE',
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR',
    }));
    expect(component.$claimStateApi.notifyStatusCountRefresh).toHaveBeenCalled();
    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
  });

  it('navigates to FTE preview with supplementary id when available', () => {
    const component = createComponent();
    component.claims.claimId = 777;
    component.supplementaryId = 'SUP-77';
    component.navigatePreview('', 777);
    expect(component.previewWindow.openUrl).toHaveBeenCalledWith('/adv/creator/preview-fte-advance?id=777&supId=SUP-77');
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('keeps FTE advance title and preview route ownership', () => {
    const component = createComponent();
    component.claims.claimId = 778;

    expect(component.pageTitle).toBe('REQUISITION FOR FTE ADVANCE');

    component.navigatePreview('', 778);
    expect(component.previewWindow.openUrl).toHaveBeenCalledWith('/adv/creator/preview-fte-advance?id=778');
    expect(component.router.navigate).not.toHaveBeenCalled();
  });
});


