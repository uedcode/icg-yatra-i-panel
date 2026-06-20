import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../../service/auth.service';
import { ClaimApiService } from '../../../../service/api/claim/claim-api.service';
import { ClaimStateApiService } from '../../../../service/api/claim-state/claim-state-api.service';
import { EsignApiService } from '../../../../service/api/esign/esign-api.service';
import { BankIfscApiService } from 'src/app/service/api/bank-ifsc/bank-ifsc-api.service';
import { CommonService } from '../../../../service/common.service';
import { FormManageService } from '../../../../service/form-manage.service';
import { CodeDocInfoApiService } from '../../../../service/api/code-doc-info/code-doc-info-api.service';
import { UtilService } from '../../../../service/util.service';
import { FormPmtDutyComponent } from './form-pmt.component';

describe('FormPmtDutyComponent', () => {
  let component: FormPmtDutyComponent;
  let fixture: ComponentFixture<FormPmtDutyComponent>;
  let route: { snapshot: { data: Record<string, unknown>; queryParamMap: { get: jasmine.Spy } } };
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let claimApiService: jasmine.SpyObj<ClaimApiService>;
  let claimStateApiService: jasmine.SpyObj<ClaimStateApiService>;
  let esignApiService: jasmine.SpyObj<EsignApiService>;
  let bankIfscApiService: jasmine.SpyObj<BankIfscApiService>;
  let formManageService: jasmine.SpyObj<FormManageService> & {
    docFileUrl: Subject<string>;
    docFileUrlDeleted: Subject<boolean>;
  };
  let codeDocInfoService: jasmine.SpyObj<CodeDocInfoApiService> & { documentDtos: Subject<any> };

  const userDetails = {
    userId: 42,
    unitId: 'U1',
    roleTypeId: 'CR',
    codeRoleTypeDTO: { roleTypeId: 'CR' },
    codeUnitDTO: { unit: 'U1', descr: 'Unit One' }
  };

  const setQueryParams = (params: Record<string, string | null> = {}) => {
    route.snapshot.queryParamMap.get.and.callFake((key: string) => params[key] ?? null);
  };

  const seedValidClaim = () => {
    component.claims.codeUnitDTO = { unit: 'U1', descr: 'Unit One' };
    component.claims.gxFormFileUrl = 'gx-form.pdf';
    component.claims.yatPermDutyAdvDTOs = [{
      pmtType: 'F',
      familyType: 'SF',
      areaType: 'M',
      stnFrom: 'Delhi',
      stnTo: 'Mumbai',
      isDts: 'Yes',
      transPerEffectKg: 50,
      maxTransEffectKg: 100,
      transPerEffectShipKg: 25,
      maxTransEffectShipKg: 50
    } as any];
    component.claims.yatDtsDetailDTOs = [{
      modeOfTravel: 'Train',
      isDts: 'Yes',
      amount: 1500,
      tempAmount: '1600'
    } as any];
  };

  beforeEach(() => {
    route = {
      snapshot: {
        data: { subFormId: 'PMT', formKind: 'advance' },
        queryParamMap: { get: jasmine.createSpy('get') }
      }
    };
    setQueryParams();

    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getUserDetails', 'getModuleName']);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage',
      'parseResponse',
      'checkForValidFile'
    ]);
    claimApiService = jasmine.createSpyObj<ClaimApiService>('ClaimApiService', [
      'getSingleClaim',
      'getUnits',
      'getPayLevels',
      'createOrUpdateAdvance',
    ]);
    claimStateApiService = jasmine.createSpyObj<ClaimStateApiService>('ClaimStateApiService', [
      'changeStatusById',
      'notifyStatusCountRefresh'
    ]);
    esignApiService = jasmine.createSpyObj<EsignApiService>('EsignApiService', [
      'checkEsignAvailability',
      'prepareForESign'
    ]);
    bankIfscApiService = jasmine.createSpyObj<BankIfscApiService>('BankIfscApiService', ['createOrUpdate']);
    formManageService = jasmine.createSpyObj<FormManageService>('FormManageService', [
      'uploadImg',
      'deleteByUrl'
    ]) as jasmine.SpyObj<FormManageService> & {
      docFileUrl: Subject<string>;
      docFileUrlDeleted: Subject<boolean>;
    };
    formManageService.docFileUrl = new Subject<string>();
    formManageService.docFileUrlDeleted = new Subject<boolean>();

    codeDocInfoService = jasmine.createSpyObj<CodeDocInfoApiService>('CodeDocInfoApiService', [
      'setDocument'
    ]) as jasmine.SpyObj<CodeDocInfoApiService> & { documentDtos: Subject<any> };
    codeDocInfoService.documentDtos = new Subject<any>();

    authService.getUserDetails.and.returnValue(userDetails as any);
    authService.getModuleName.and.returnValue('/creator');
    commonService.checkForValidFile.and.returnValue(true);
    commonService.parseResponse.and.callFake((response: unknown) => response as any);
    claimApiService.getSingleClaim.and.returnValue(of({
      status: true,
      object: [{
        claimId: 101,
        codeUnitDTO: { unit: 'U1', descr: 'Unit One' },
        yatPermDutyAdvDTOs: [{
          pmtType: 'F',
          familyType: 'SF',
          areaType: 'M',
          stnFrom: 'Delhi',
          stnTo: 'Mumbai',
          gxDate: 1700000000000
        }],
        yatDtsDetailDTOs: [{ modeOfTravel: 'Train', isDts: 'Yes', amount: 700 }],
        yatDocsDTOs: [{ docName: 'Existing Doc' }],
        yatClaimBankDetailDTO: {
          bankName: 'HDFC BANK LTD',
          ifscCode: 'HDFC0000013',
          accountNo: '00131150000656'
        }
      }]
    }) as any);
    claimApiService.getUnits.and.returnValue(of({ status: true, object: [{ unit: 'U1' }] }) as any);
    claimApiService.getPayLevels.and.returnValue(of({ status: true, object: [{ payLevel: '10' }] }) as any);
    claimApiService.createOrUpdateAdvance.and.returnValue(of({
      status: true,
      object: [{ claimId: 202 }]
    }) as any);
    esignApiService.checkEsignAvailability.and.returnValue(of({ status: true }) as any);
    esignApiService.prepareForESign.and.returnValue(of({ status: true }) as any);
    claimStateApiService.changeStatusById.and.returnValue(of({ status: true }) as any);
    bankIfscApiService.createOrUpdate.and.returnValue(of({
      status: true,
      object: [{ ifscCode: 'SBIN0001234' }]
    }) as any);

    return TestBed.configureTestingModule({
      declarations: [FormPmtDutyComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: Location, useValue: jasmine.createSpyObj<Location>('Location', ['back']) },
        {
          provide: UtilService,
          useValue: jasmine.createSpyObj<UtilService>('UtilService', {
            toMillis: 1700000000000
          })
        },
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: ClaimApiService, useValue: claimApiService },
        { provide: ClaimStateApiService, useValue: claimStateApiService },
        { provide: EsignApiService, useValue: esignApiService },
        { provide: BankIfscApiService, useValue: bankIfscApiService },
        { provide: FormManageService, useValue: formManageService },
        { provide: CodeDocInfoApiService, useValue: codeDocInfoService },
        { provide: HttpClient, useValue: jasmine.createSpyObj<HttpClient>('HttpClient', ['get']) }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPmtDutyComponent);
    component = fixture.componentInstance;
  });

  it('should create a PMT advance shell with default claim values', () => {
    expect(component).toBeTruthy();
    expect(component.pageTitle).toBe('REQUISITION FOR PMT DUTY ADVANCE');
    expect(component.claims.signWith).toBe('ES');
    expect(component.claims.yatPermDutyAdvDTOs[0].pmtType).toBe('F');
    expect(component.claims.yatPermDutyAdvDTOs[0].familyType).toBe('SF');
    expect(component.claims.yatPermDutyAdvDTOs[0].isDts).toBe('Yes');
    expect(component.claims.yatPermDutyAdvDTOs[0].arrPerson).toBe(0);
  });

  it('should show the legacy PMT claim title in claim mode', () => {
    component.activeFormKind = 'claim';
    expect(component.pageTitle).toBe('Permanent Duty Claim');

    component.supplementaryId = 'SUP-PMT-1';
    expect(component.pageTitle).toBe('Supplementary Permanent Duty Claim');
  });

  it('should show the legacy resettlement claim title in resettlement mode', () => {
    component.activeFormKind = 'claim';
    component.activeSubFormId = 'RS';
    expect(component.pageTitle).toBe('Resettlement Claim');

    component.supplementaryId = 'SUP-RS-1';
    expect(component.pageTitle).toBe('Supplementary Resettlement Claim');
  });

  it('should initialize route context, load reference data, repair defaults, and publish fetched documents', () => {
    setQueryParams({ id: '101', supId: '501', gxUnitId: '2' });

    component.ngOnInit();

    expect(component.claimIdParam).toBe('101');
    expect(component.supplementaryId).toBe('501');
    expect(component.gxUnitId).toBe(2);
    expect(claimApiService.getUnits).toHaveBeenCalled();
    expect(claimApiService.getPayLevels).toHaveBeenCalled();
    expect(claimApiService.getSingleClaim).toHaveBeenCalled();
    const config = claimApiService.getSingleClaim.calls.mostRecent().args[0] as any;
    expect(config.headers.claimId).toBe('101');
    expect(config.headers.supCLaimId).toBe('501');
    expect(component.claims.claimId).toBe(101);
    expect(component.claims.yatPermDutyAdvDTOs[0].isDts).toBe('Yes');
    expect(component.claims.yatPermDutyAdvDTOs[0].arrPerson).toBe(0);
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect((component.claims.yatDtsDetailDTOs[0] as any).tempAmount).toBe(700);
    expect(component.documentDtos.length).toBe(1);
    expect(codeDocInfoService.setDocument).toHaveBeenCalledWith(component.documentDtos as any);
  });

  it('should ignore old claimId query key for PMT advance routes but keep it for claim wrappers', () => {
    setQueryParams({ claimId: 'OLD_ADVANCE_ID' });
    component.ngOnInit();
    expect(component.claimIdParam).toBeNull();

    fixture = TestBed.createComponent(FormPmtDutyComponent);
    component = fixture.componentInstance;
    route.snapshot.data = { subFormId: 'PMT', formKind: 'claim' };
    setQueryParams({ claimId: 'CLAIM_ID_1' });

    component.ngOnInit();

    expect(component.claimIdParam).toBe('CLAIM_ID_1');
  });

  it('should normalize saved PMT DTS string, comma, and blank amount values', () => {
    claimApiService.getSingleClaim.and.returnValue(of({
      status: true,
      object: [{
        claimId: 909,
        codeUnitDTO: { unit: 'U1', descr: 'Unit One' },
        yatPermDutyAdvDTOs: [{ pmtType: 'F', familyType: 'SF', areaType: 'M' }],
        yatDtsDetailDTOs: [
          { modeOfTravel: 'Train', isDts: 'Yes', amount: '1,600' },
          { modeOfTravel: 'Road', isDts: 'No', amount: '500', tempAmount: '' },
          { modeOfTravel: 'Road', isDts: 'NA', amount: '' }
        ],
      }]
    }) as any);

    component.ngOnInit();

    expect((component.claims.yatDtsDetailDTOs[0] as any).amount).toBe(1600);
    expect((component.claims.yatDtsDetailDTOs[0] as any).tempAmount).toBe(1600);
    expect((component.claims.yatDtsDetailDTOs[1] as any).amount).toBe(500);
    expect((component.claims.yatDtsDetailDTOs[1] as any).tempAmount).toBe(500);
    expect((component.claims.yatDtsDetailDTOs[2] as any).amount).toBe('');
    expect((component.claims.yatDtsDetailDTOs[2] as any).tempAmount).toBe('');
  });

  it('should calculate PMT amount from composite, transport, land, ship, and DTS rows', () => {
    component.partValueLand = 1.5;
    component.partValueShip = 1.5;
    component.claims.yatPermDutyAdvDTOs = [{
      compositeGrant: 100,
      compositeGrantIsland: 50,
      arrFare: 200,
      shipFare: 300,
      transChargeRs: 400,
      transChargeShipRs: 500,
      transPerEffectKgRs: 2,
      transPerEffectKms: 10,
      transPerEffectShipKgRs: 3,
      transPerEffectShipKms: 20
    } as any];
    component.claims.yatDtsDetailDTOs = [
      { isDts: 'Yes', amount: 1000 },
      { isDts: 'No', tempAmount: '250' }
    ] as any;

    component.calculateAmount('P');

    const adv = component.claims.yatPermDutyAdvDTOs[0];
    expect(adv.totalAmt).toBe('1920');
    expect(adv.dtsAmount).toBe('1000');
    expect(adv.advAmt).toBe('1920');
    expect(adv.totalBudgetedAmt).toBe('2920');
  });

  it('should calculate island composite grant using compact legacy area type value', () => {
    component.claims.yatPermDutyAdvDTOs = [{
      basicPay: 64100,
      areaType: 'I',
      isAvailComposite: 'Y',
    } as any];

    component.onAreaTypeChange();

    const adv = component.claims.yatPermDutyAdvDTOs[0];
    expect(adv.compositeGrant).toBe('');
    expect(adv.compositeGrantIsland).toBe('64100');
    expect(adv.totalAmt).toBe('64100');
    expect(adv.advAmt).toBe('64100');
  });

  it('should require a reason before adding a non-DTS travel row', () => {
    component.addTravelDetails({
      source: 'Delhi',
      destination: 'Mumbai',
      modeOfTravel: 'Bus',
      isDts: 'No',
      tempAmount: 100
    } as any);

    expect(component.claims.yatDtsDetailDTOs.length).toBe(0);
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Reason is required when DTS is No.',
      'danger'
    );
  });

  it('should add and update travel rows while preserving editable temp amounts', () => {
    component.addTravelDetails({
      source: 'Delhi',
      destination: 'Mumbai',
      modeOfTravel: 'Train',
      isDts: 'Yes',
      tempAmount: 500
    } as any);

    expect(component.claims.yatDtsDetailDTOs.length).toBe(1);
    expect((component.claims.yatDtsDetailDTOs[0] as any).tempAmount).toBe(500);
    expect((component.claims.yatDtsDetailDTOs[0] as any).amount).toBe(500);

    component.editTravelDetails(0);
    expect(component.travelBtnName).toBe('Update');
    component.addTravelDetails({
      source: 'Delhi',
      destination: 'Mumbai',
      modeOfTravel: 'Flight',
      isDts: 'Yes',
      amount: 900,
      tempAmount: '950'
    } as any);

    expect(component.claims.yatDtsDetailDTOs.length).toBe(1);
    expect(component.claims.yatDtsDetailDTOs[0].modeOfTravel).toBe('Flight');
    expect(component.travelBtnName).toBe('Add');
  });

  it('should delete travel rows only after user confirmation', () => {
    component.claims.yatDtsDetailDTOs = [{ amount: 100 }, { amount: 200 }] as any;
    spyOn(window, 'confirm').and.returnValues(false, true);

    component.deleteTravel(0);
    expect(component.claims.yatDtsDetailDTOs.length).toBe(2);

    component.deleteTravel(0);
    expect(component.claims.yatDtsDetailDTOs.length).toBe(1);
    expect(component.claims.yatDtsDetailDTOs[0].amount).toBe(200);
  });

  it('should reject invalid GX uploads and accept a valid PDF upload callback', () => {
    component.uploadGxForm({ target: { files: [{ size: 1024 }] } } as any);
    formManageService.docFileUrl.next('gx-upload.pdf');

    expect(formManageService.uploadImg).toHaveBeenCalled();
    expect(component.claims.gxFormFileUrl).toBe('gx-upload.pdf');
    expect(component.gxFormUploading).toBeFalse();

    formManageService.uploadImg.calls.reset();
    commonService.showMessage.calls.reset();
    commonService.checkForValidFile.and.returnValue(false);
    component.uploadGxForm({ target: { files: [{ size: 1024 }] } } as any);

    expect(formManageService.uploadImg).not.toHaveBeenCalled();
    expect(component.claims.gxFormFileUrl).toBeNull();
    expect(commonService.showMessage).not.toHaveBeenCalled();
  });

  it('should mark GX upload for deletion after confirmation', () => {
    component.claims.gxFormFileUrl = 'old-gx.pdf';
    component.gxFormModel = 'old-model';
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteGxForm();

    expect(formManageService.deleteByUrl).not.toHaveBeenCalled();
    expect(component.claims.deleteGxFileUrl).toBe('old-gx.pdf');
    expect(component.claims.gxFormFileUrl).toBeNull();
    expect(component.gxFormModel).toBeNull();
  });

  it('should not delete GX upload when user cancels confirmation', () => {
    component.claims.gxFormFileUrl = 'old-gx.pdf';
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteGxForm();

    expect(formManageService.deleteByUrl).not.toHaveBeenCalled();
    expect(component.claims.gxFormFileUrl).toBe('old-gx.pdf');
  });

  it('should strip emoji from internal remarks like legacy PMT advance form', () => {
    component.claims.internalRemarks = 'Move household goods 🚢 by rail';

    component.removeEmoji();

    expect(component.claims.internalRemarks).toBe('Move household goods  by rail');
  });

  it('should save a draft with normalized claim payload and navigate to draft list', () => {
    component.userIdDetails = userDetails;
    seedValidClaim();
    component.claims.claimId = 55;
    component.claims.yatClaimBankDetailDTO = { ifscCode: '' } as any;
    component.claims.yatPermDutyAdvDTOs[0].gxDate = '2026-01-01';
    component.claims.yatPermDutyAdvDTOs[0].wefDate = '2026-01-02';
    component.claims.deleteGxFileUrl = 'old-gx.pdf';
    component.claims.internalRemarks = 'Draft remarks 🚢';
    component.documentDtos = [{
      codeDocInfoDTO: { id: 9, docName: 'GX Form' },
      otherDocName: 'Uploaded GX',
      fileUrl: 'gx-doc.pdf'
    } as any];
    claimApiService.createOrUpdateAdvance.and.returnValue(of({
      status: true,
      object: [{
        claimId: 303,
        yatPermDutyAdvDTOs: [{ advAmt: 3210, totalAmt: 3210 }],
        yatDtsDetailDTOs: [{ modeOfTravel: 'Train', isDts: 'Yes', amount: 1600 }],
        yatFamilyDetailDTOs: [{ name: 'Family Member' }],
        yatDocsDTOs: [{ docName: 'Saved Doc' }],
        yatClaimBankDetailDTO: {
          accountNo: '00131150000656',
          ifscCode: 'HDFC0000013'
        }
      }]
    }) as any);

    component.saveDraft();

    expect(claimApiService.createOrUpdateAdvance).toHaveBeenCalled();
    const formData = claimApiService.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('DR');
    expect(payload.roleTypeId).toBe('CR');
    expect(payload.aclUserDTO.userId).toBe(42);
    expect(payload.codeSubFormDTO.subFormId).toBe('P');
    expect(payload.codeUnitDTO).toEqual({ unit: 'U1' });
    expect(payload.ifscnull).toBeTrue();
    expect(payload.deleteGxFileUrl).toBe('old-gx.pdf');
    expect(payload.internalRemarks).toBe('Draft remarks ');
    expect(payload.yatDocsDTOs[0].codeDocInfoDTO).toEqual({ id: 9, docName: 'GX Form' });
    expect(payload.yatDtsDetailDTOs[0].amount).toBe(1600);
    expect((payload.yatDtsDetailDTOs[0] as any).tempAmount).toBeUndefined();
    expect(component.claims.claimId).toBe(303);
    expect((component.claims.yatPermDutyAdvDTOs[0] as any).advAmt).toBe(3210);
    expect((component.claims.yatDtsDetailDTOs[0] as any).amount).toBe(1600);
    expect((component.claims.yatDtsDetailDTOs[0] as any).tempAmount).toBe(1600);
    expect((component.claims.yatFamilyDetailDTOs[0] as any).name).toBe('Family Member');
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect(component.documentDtos).toEqual([{ docName: 'Saved Doc' }] as any);
    expect(codeDocInfoService.setDocument).toHaveBeenCalledWith(component.documentDtos as any);
    expect(component.claims.deleteGxFileUrl).toBeUndefined();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/creator/draft');
  });

  it('should preserve original PMT DTS amount when edited temp amount is blank before save', () => {
    component.userIdDetails = userDetails;
    seedValidClaim();
    component.claims.yatDtsDetailDTOs = [{
      modeOfTravel: 'Train',
      isDts: 'Yes',
      amount: '1,600',
      tempAmount: ''
    } as any];
    claimApiService.createOrUpdateAdvance.and.returnValue(of({
      status: true,
      object: [{ claimId: 404, yatDtsDetailDTOs: [{ modeOfTravel: 'Train', isDts: 'Yes', amount: 1600 }] }]
    }) as any);

    component.saveDraft();

    const formData = claimApiService.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.yatDtsDetailDTOs[0].amount).toBe(1600);
    expect((payload.yatDtsDetailDTOs[0] as any).tempAmount).toBeUndefined();
  });

  it('should block submit when GX form is missing after PMT validations pass', () => {
    seedValidClaim();
    component.claims.gxFormFileUrl = '';
    spyOn(component as any, 'runPmtClientValidationOnly').and.returnValue(true);
    spyOn(component as any, 'validatePmtBusinessFields').and.returnValue(true);

    component.submitPmt();

    expect(claimApiService.createOrUpdateAdvance).not.toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('Please upload Gx Form (PDF).', 'danger');
  });

  it('should stop submit when section validation fails before business validation', () => {
    seedValidClaim();
    const sectionSpy = spyOn(component as any, 'runPmtClientValidationOnly').and.returnValue(false);
    const businessSpy = spyOn(component as any, 'validatePmtBusinessFields').and.returnValue(true);

    component.submitPmt();

    expect(sectionSpy).toHaveBeenCalled();
    expect(businessSpy).not.toHaveBeenCalled();
    expect(claimApiService.createOrUpdateAdvance).not.toHaveBeenCalled();
  });

  it('should stop submit when business validation fails', () => {
    seedValidClaim();
    spyOn(component as any, 'runPmtClientValidationOnly').and.returnValue(true);
    const businessSpy = spyOn(component as any, 'validatePmtBusinessFields').and.returnValue(false);

    component.submitPmt();

    expect(businessSpy).toHaveBeenCalled();
    expect(claimApiService.createOrUpdateAdvance).not.toHaveBeenCalled();
  });

  it('should submit a valid PMT claim to outbox and navigate to new list', () => {
    seedValidClaim();
    spyOn(component as any, 'runPmtClientValidationOnly').and.returnValue(true);
    spyOn(component as any, 'validatePmtBusinessFields').and.returnValue(true);
    component.claims.signWith = 'IS';

    component.submitPmt();

    const formData = claimApiService.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('OB');
    expect(claimStateApiService.changeStatusById).toHaveBeenCalledWith(jasmine.objectContaining({
      claimId: 202,
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR'
    }));
    expect(claimStateApiService.notifyStatusCountRefresh).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/creator/new');
  });

  it('should submit eSign PMT through prepareForESign after advance save', () => {
    seedValidClaim();
    spyOn(component as any, 'runPmtClientValidationOnly').and.returnValue(true);
    spyOn(component as any, 'validatePmtBusinessFields').and.returnValue(true);
    component.claims.signWith = 'ES';
    component.userIdDetails = {
      ...userDetails,
      financialYear: '2026',
      moduleId: 'ADV'
    };
    claimApiService.createOrUpdateAdvance.and.returnValue(of({
      status: true,
      object: [{ claimId: 404 }]
    }) as any);

    component.submitPmt();

    expect(esignApiService.prepareForESign).toHaveBeenCalledWith(jasmine.objectContaining({
      claimId: 404,
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR',
      financialYear: '2026',
      moduleId: 'ADV'
    }));
    expect(claimStateApiService.changeStatusById).not.toHaveBeenCalled();
    expect(component.eSignTempFormObj).toEqual(jasmine.objectContaining({
      id: 404,
      claimId: 404,
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR'
    }));
    expect(claimStateApiService.notifyStatusCountRefresh).toHaveBeenCalled();
    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
  });

  it('should fall back to ink sign when eSign availability fails', () => {
    component.gxUnitId = 2;
    esignApiService.checkEsignAvailability.and.returnValue(of({
      status: false,
      message: 'eSign unavailable'
    }) as any);

    component.checkEsignAvailability();

    expect(component.claims.signWith).toBe('IS');
    expect(commonService.showMessage).toHaveBeenCalledWith('eSign unavailable', 'danger');

    component.claims.signWith = 'ES';
    esignApiService.checkEsignAvailability.and.returnValue(
      throwError(() => new Error('service down')) as any
    );
    component.checkEsignAvailability();

    expect(component.claims.signWith).toBe('IS');
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Unable to verify eSign availability.',
      'danger'
    );
  });

  it('should keep eSign selected when availability check succeeds', () => {
    component.gxUnitId = 2;
    component.claims.signWith = 'ES';
    esignApiService.checkEsignAvailability.and.returnValue(of({ status: true }) as any);

    component.checkEsignAvailability();

    expect(component.claims.signWith).toBe('ES');
    expect(commonService.showMessage).not.toHaveBeenCalledWith(
      jasmine.stringMatching(/eSign/i),
      'danger'
    );
  });

  it('should fail PMT business validation when applied unit is missing', () => {
    seedValidClaim();
    component.claims.codeUnitDTO = { unit: '' } as any;
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please select the applied to unit.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship');
  });

  it('should fail PMT business validation when station data is incomplete', () => {
    seedValidClaim();
    component.claims.yatPermDutyAdvDTOs[0].stnFrom = '';
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please fill both Station From and Station To.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship');
  });

  it('should fail PMT business validation when non-DTS reason is missing', () => {
    seedValidClaim();
    component.claims.yatPermDutyAdvDTOs[0].isDts = 'No';
    component.claims.yatPermDutyAdvDTOs[0].reasonDts = '';
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please fill the reason for not taking DTS.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship');
  });

  it('should fail PMT business validation when land rate/km pair is incomplete', () => {
    seedValidClaim();
    component.claims.yatPermDutyAdvDTOs[0].transPerEffectKgRs = '20';
    component.claims.yatPermDutyAdvDTOs[0].transPerEffectKms = '';
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please fill both rate and kilometers for land transportation of personal effects.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship2');
  });

  it('should fail PMT business validation when ship rate/km pair is incomplete', () => {
    seedValidClaim();
    component.claims.yatPermDutyAdvDTOs[0].transPerEffectShipKgRs = '10';
    component.claims.yatPermDutyAdvDTOs[0].transPerEffectShipKms = '';
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please fill both rate and kilometers for ship transportation of personal effects.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship2');
  });

  it('should fail PMT business validation when no travel rows are present', () => {
    seedValidClaim();
    component.claims.yatDtsDetailDTOs = [];
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please add at least one travel detail row.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship4');
  });

  it('should fail PMT business validation when travel mode is Others without detail', () => {
    seedValidClaim();
    component.claims.yatDtsDetailDTOs = [{
      modeOfTravel: 'Others',
      otherModeOfTravel: '',
      isDts: 'Yes'
    } as any];
    spyOn(component as any, 'activateTab');

    const isValid = (component as any).validatePmtBusinessFields(false);

    expect(isValid).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please fill Other Mode of Travel for all travel detail rows.',
      'danger'
    );
    expect((component as any).activateTab).toHaveBeenCalledWith('ship4');
  });

  it('should validate and submit IFSC updates for claim bank details', () => {
    component.newIfscCode = '   ';
    component.submitIFSCUpdate();

    expect(bankIfscApiService.createOrUpdate).not.toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('Please enter IFSC code.', 'danger');

    component.newIfscCode = ' SBIN0001234 ';
    component.claims.aclUserDTO = { userId: 84 } as any;
    component.claims.yatClaimBankDetailDTO = {} as any;
    component.submitIFSCUpdate();

    expect(bankIfscApiService.createOrUpdate).toHaveBeenCalledWith(
      { ifscCode: 'SBIN0001234', userId: 84 },
      { headers: {} }
    );
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('SBIN0001234');
    expect(component.showIfscModal).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith('IFSC updated successfully', 'success');
  });

  it('should recover UI state when save claim API fails', () => {
    seedValidClaim();
    claimApiService.createOrUpdateAdvance.and.returnValue(
      throwError(() => ({ status: 500 })) as any
    );

    component.saveDraft();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Error while saving PMT advance.',
      'danger'
    );
  });

  it('should call location back when PMT goBack is triggered', () => {
    const location = TestBed.inject(Location) as jasmine.SpyObj<Location>;

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('should disable preview button when claim id is not present', () => {
    component.claims.claimId = null;

    component.checkForPreviewBtn();

    expect(component.isPreviewDisabled).toBeTrue();
  });

  it('should enable preview button when claim id is present', () => {
    component.claims.claimId = 1001;

    component.checkForPreviewBtn();

    expect(component.isPreviewDisabled).toBeFalse();
  });

  it('should route to PMT preview with supplementary query params when available', () => {
    component.claims.claimId = 321;
    component.supplementaryId = 'SUP-7';
    component.activeSubFormId = 'P';
    authService.getModuleName.and.returnValue('/adv/creator');

    spyOn(window, 'open');
    component.navigatePreview('P', '321');

    expect(window.open).toHaveBeenCalledWith(
      '/adv/creator/preview-pmt-duty?id=321&supId=SUP-7',
      '_blank'
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should route linked PMT previews with legacy id query key', () => {
    component.activeSubFormId = 'RS';

    component.openLinkedPreview('preview-resettlement', 'C_ID_LINKED');

    expect(router.navigate).toHaveBeenCalledWith(
      ['../preview-resettlement'],
      {
        queryParams: {
          id: 'C_ID_LINKED',
          subFormId: 'RS'
        }
      }
    );
  });

  it('should preserve supplementary context in draft navigation after save', () => {
    seedValidClaim();
    component.supplementaryId = 'SUP-1';
    claimApiService.createOrUpdateAdvance.and.returnValue(
      of({ status: true, object: [{ claimId: 909 }] }) as any
    );

    component.saveDraft();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/creator/form-pmt-duty'],
      {
        queryParams: {
          id: 909,
          supId: 'SUP-1'
        }
      }
    );
  });

  it('should resolve PMT sub form ids and form kinds correctly', () => {
    expect((component as any).resolveSubFormId('PMT')).toBe('P');
    expect((component as any).resolveSubFormId('P')).toBe('P');
    expect((component as any).resolveSubFormId('')).toBe('P');

    expect((component as any).resolveFormKind('claim')).toBe('claim');
    expect((component as any).resolveFormKind('advance')).toBe('advance');
    expect((component as any).resolveFormKind(undefined)).toBe('advance');
  });

  it('should derive PMT routes from active form kind', () => {
    component.activeFormKind = 'advance';
    expect((component as any).getCurrentFormRoute()).toBe('form-pmt-duty');
    expect((component as any).getPreviewRoute()).toBe('preview-pmt-duty');

    component.activeFormKind = 'claim';
    expect((component as any).getCurrentFormRoute()).toBe('form-pmt-duty-claim');
    expect((component as any).getPreviewRoute()).toBe('preview-pmt-duty-claim');
  });

  it('should clear DTS reason when PMT row is switched to Yes', () => {
    const row: any = { isDts: 'Yes', reasonForNoDts: 'old reason' };

    component.onIsDtsChange(row);

    expect(row.reasonForNoDts).toBe('');
    expect(row._reasonForNoDtsError).toBeFalse();
  });

  it('should mark reason error when PMT row is No with empty reason', () => {
    const row: any = { isDts: 'No', reasonForNoDts: '' };

    component.onIsDtsChange(row);

    expect(row._reasonForNoDtsError).toBeTrue();
  });
});



