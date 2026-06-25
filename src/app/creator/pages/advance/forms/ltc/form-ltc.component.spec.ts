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
    component.showIfscModal = false;
    component.newIfscCode = '';
    component.showLtcEntitledModal = false;
    component.ltcEntitled = { singleBlockYear: [], listYearsAvailed: [] };
    component.showLtcAvailedHistoryModal = false;
    component.ltcAvailedHistory = { singleBlockYear: [], listYearsAvailed: [] };
    component.presentUnitStatus = null;
    component.claims = {
      claimId: null,
      claimState: null,
      signWith: component.codeSignType.eSign,
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
        isDts: 'Yes',
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
    component.previewWindow = jasmine.createSpyObj('PreviewWindowService', ['openUrl']);
    component.$common = jasmine.createSpyObj('CommonService', [
      'showLoader', 'hideLoader', 'showMessage', 'checkForValidFile', 'parseResponse'
    ]);
    component.$common.checkForValidFile.and.returnValue(true);
    component.$common.parseResponse.and.callFake((response: any) => response);
    component.$claimApi = jasmine.createSpyObj('ClaimApiService', [
      'createOrUpdateAdvance',
      'checkEsignAvailability',
      'getSingleClaim',
      'changeClaimStatusById',
      'prepareForESign',
      'notifyStatusCountRefresh',
      'getLtcBlockYears',
      'getLtcTypes',
      'getLtcDoeDifference',
      'getLtcFamilyDetails',
      'getLtcEntitled',
      'getLtcAvailedEntitledHistory',
      'getPresentUnitStatus',
      'validateAdditionalLtc'
    ]);
    component.$claimApi.createOrUpdateAdvance.and.returnValue(of({ object: [{ claimId: 2002 }] }));
    component.$bankIfscApi = jasmine.createSpyObj('BankIfscApiService', ['createOrUpdate']);
    component.$bankIfscApi.createOrUpdate.and.returnValue(of({
      status: true,
      message: 'IFSC Code updated successfully.',
      object: [{ ifscCode: 'HDFC0000013' }]
    }));
    component.$claimApi.getSingleClaim.and.returnValue(of({ status: true, object: [] }));
    component.$claimStateApi = jasmine.createSpyObj('ClaimStateApiService', ['changeStatusById', 'notifyStatusCountRefresh']);
    component.$claimStateApi.changeStatusById.and.returnValue(of({ status: true }));
    component.$esignApi = jasmine.createSpyObj('EsignApiService', ['checkEsignAvailability', 'prepareForESign']);
    component.$esignApi.checkEsignAvailability.and.returnValue(of({ status: true }));
    component.$esignApi.prepareForESign.and.returnValue(of({ status: true, object: { transactionId: 'ES-LTC-1' } }));
    component.$claimApi.getLtcBlockYears.and.returnValue(of({ status: true, object: ['2026-2027'] }));
    component.$claimApi.getLtcTypes.and.returnValue(of({ status: true, object: [{ ltcTypeId: 'PAI', descr: 'Place Anywhere in India' }] }));
    component.$claimApi.getLtcDoeDifference.and.returnValue(of({ status: true, object: 2 }));
    component.$claimApi.getLtcFamilyDetails.and.returnValue(of({ status: true, object: [] }));
    component.$claimApi.getLtcEntitled.and.returnValue(of({
      status: true,
      object: { singleBlockYear: ['2026'], listYearsAvailed: [] }
    }));
    component.$claimApi.getLtcAvailedEntitledHistory.and.returnValue(of({
      status: true,
      object: { singleBlockYear: ['2026'], listYearsAvailed: [] }
    }));
    component.$claimApi.getPresentUnitStatus.and.returnValue(of({ status: true, object: true }));
    component.$claimApi.validateAdditionalLtc.and.returnValue(of({ status: true, object: 'Yes' }));
    component.$formDocument = jasmine.createSpyObj('FormDocumentService', ['uploadSupportDoc', 'deleteSupportDocByUrl']);
    component.$formDocument.uploadSupportDoc.and.returnValue(of('gx-ltc.pdf'));
    component.$formDocument.deleteSupportDocByUrl.and.returnValue(of(true));
    component.$codeDocInfo = jasmine.createSpyObj('CodeDocInfoApiService', ['setDocument']);
    component.$codeDocInfo.documentDtos = new Subject<any>();
    component.UtilService = jasmine.createSpyObj('UtilService', ['toMillis']);
    component.UtilService.toMillis.and.returnValue(1700000000000);
    component.datePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    component.datePipe.transform.and.callFake((value: any) => {
      if (!value) return '';
      if (value === 1700000000000) return '2023-11-14';
      if (typeof value === 'string') return value;
      return '2026-01-01';
    });
    component.router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    component.setTab = jasmine.createSpy('setTab');
    component.checkForPreviewBtn = jasmine.createSpy('checkForPreviewBtn');

    return component;
  };

  it('should default hidden claim-level DTS flag to Yes like legacy LTC init', () => {
    const component = createComponent();
    const adv = (component as any).defaultLtcAdv();
    expect(adv.isDts).toBe('Yes');
  });

  it('should default LTC sign type to eSign like legacy init', () => {
    const component = createComponent();
    const claims = (component as any).defaultClaims();
    expect(claims.signWith).toBe(component.codeSignType.eSign);
  });

  it('should ignore old claimId query key for LTC advance routes but keep it for claim wrappers', () => {
    const component = createComponent();
    component.route = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => ({ claimId: 'OLD_ADVANCE_ID' }[key] || null),
        },
      },
    };
    component.activeFormKind = 'advance';

    (component as any).initFromRoute();

    expect(component.claimIdParam).toBeNull();

    component.route = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => ({ claimId: 'CLAIM_ID_1' }[key] || null),
        },
      },
    };
    component.activeFormKind = 'claim';

    (component as any).initFromRoute();

    expect(component.claimIdParam).toBe('CLAIM_ID_1');
  });

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

  it('should cap edited LTC travel amount to original row amount', () => {
    const component = createComponent();
    const row = { isDts: 'Yes', tempAmount: '1500', amount: '1000' } as any;
    component.claims.yatDtsDetailDTOs = [row];

    component.onSavedTravelAmountChange(row);

    expect(row.tempAmount).toBe('1000');
    expect(component.claims.yatLtcAdvDTOs[0].totalAmt).toBe('1000');
    expect(component.claims.yatLtcAdvDTOs[0].advAmt).toBe('900');
  });

  it('should confirm before deleting LTC travel row', () => {
    const component = createComponent();
    component.claims.yatDtsDetailDTOs = [
      { isDts: 'Yes', tempAmount: '1000', amount: '1000' }
    ];
    spyOn(window, 'confirm').and.returnValues(false, true);

    component.deleteLtcTravelDetails(0);
    expect(component.claims.yatDtsDetailDTOs.length).toBe(1);

    component.deleteLtcTravelDetails(0);
    expect(component.claims.yatDtsDetailDTOs.length).toBe(0);
  });

  it('should uppercase LTC financial place like legacy uppercase-only input', () => {
    const component = createComponent();
    component.claims.yatLtcAdvDTOs[0].place = 'new delhi';

    component.normalizeFinancialPlace();

    expect(component.claims.yatLtcAdvDTOs[0].place).toBe('NEW DELHI');
  });

  it('should uppercase conditional LTC place of visit like legacy uppercase-only input', () => {
    const component = createComponent();
    component.claims.yatLtcAdvDTOs[0].ltcPlace = 'leh ladakh';

    component.normalizeLtcPlace();

    expect(component.claims.yatLtcAdvDTOs[0].ltcPlace).toBe('LEH LADAKH');
  });

  it('should evaluate and reset conditional LTC place of visit using legacy type matching', () => {
    const component = createComponent();
    component.yatLtcTypes.placeAnywhereInIndia = '1';
    component.yatLtcTypes.specialPlace = '2';
    component.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO.ltcTypeId = 1;
    expect(component.isPlaceVisitRequired()).toBeTrue();

    component.claims.yatLtcAdvDTOs[0].ltcPlace = 'ANYWHERE';
    component.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO.ltcTypeId = 'HOMETOWN';
    component.changeLtcType();

    expect(component.isPlaceVisitRequired()).toBeFalse();
    expect(component.claims.yatLtcAdvDTOs[0].ltcPlace).toBe('');
  });

  it('should block special island LTC types when present unit status is false', () => {
    const component = createComponent();
    component.presentUnitStatus = false;
    component.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO.ltcTypeId = 'AFSP';
    component.claims.yatLtcAdvDTOs[0].ltcPlace = 'ISLAND';

    component.changeLtcType();

    expect(component.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO.ltcTypeId).toBeNull();
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Person borne in Island unit can avail this',
      'danger'
    );
  });

  it('should call legacy additional LTC validation when ALTC and block year are selected', () => {
    const component = createComponent();
    component.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO.ltcTypeId = 'ALTC';
    component.claims.yatLtcAdvDTOs[0].blockYear = '2026-2027';

    component.changeLtcType();

    expect(component.$claimApi.validateAdditionalLtc).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({
        userId: 42,
        blockYear: '2026-2027',
        ltcType: 'ALTC',
      })
    }));
  });

  it('should load LTC block years and types using legacy ltcChange headers', () => {
    const component = createComponent();
    component.claims.yatLtcAdvDTOs[0].ltcType = component.yatLtcSubTypes.partial;
    component.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO.ltcTypeId = 'PAI';

    component.ltcChange('f', true);

    expect(component.$claimApi.getLtcBlockYears).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({
        type: 'f',
        userId: 42,
        calledFrom: 'L',
        ltcTypeId: 'PAI',
        isDropdown: '1',
      })
    }));
    expect(component.$claimApi.getLtcTypes).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ type: 'f' })
    }));
    expect(component.blockYears).toEqual(['2026-2027']);
    expect(component.allCodeLtcType).toEqual([
      { ltcTypeId: 'PAI', descr: 'Place Anywhere in India' }
    ]);
  });

  it('should load DOE difference during LTC master initialization', () => {
    const component = createComponent();
    component.$claimApi.getLtcDoeDifference.and.returnValue(of({ status: true, object: '3' }));

    component.loadInitialMasterData();

    expect(component.$claimApi.getPresentUnitStatus).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ presentUnit: 'U1', pid: 42 })
    }));
    expect(component.$claimApi.getLtcDoeDifference).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ userId: 42 })
    }));
    expect(component.doe).toBe(3);
    expect(component.$claimApi.getLtcBlockYears).toHaveBeenCalled();
    expect(component.$claimApi.getLtcTypes).toHaveBeenCalled();
  });

  it('should load family details during LTC master initialization', () => {
    const component = createComponent();
    component.$claimApi.getLtcFamilyDetails.and.returnValue(of({
      status: true,
      object: [{ memberName: 'M Kalai', relation: 'Self' }]
    }));

    component.loadInitialMasterData();

    expect(component.$claimApi.getLtcFamilyDetails).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ userId: 42 })
    }));
    expect(component.claims.yatFamilyDetailDTOs).toEqual([
      { memberName: 'M Kalai', relation: 'Self' }
    ] as any);
    expect(component.claims.yatLtcAdvDTOs[0].codeHrPincodeVillageDTOs).toBeUndefined();
    expect(component.claims.yatClaimBankDetailDTO.bankName).toBe('');
  });

  it('should load LTC entitlement using legacy headers and open entitlement modal', () => {
    const component = createComponent();
    component.$claimApi.getLtcEntitled.and.returnValue(of({
      status: true,
      object: {
        singleBlockYear: ['2026', '2027'],
        listYearsAvailed: [{ firstYearAvailed: 1, firstListMember: [] }]
      }
    }));

    component.getLtcEntitled();

    expect(component.$common.showLoader).toHaveBeenCalled();
    expect(component.$claimApi.getLtcEntitled).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ userId: 42, unitId: 'U1' })
    }));
    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.ltcEntitled.singleBlockYear).toEqual(['2026', '2027']);
    expect(component.showLtcEntitledModal).toBeTrue();
  });

  it('should show message and keep LTC entitlement modal closed on false response', () => {
    const component = createComponent();
    component.$claimApi.getLtcEntitled.and.returnValue(of({
      status: false,
      message: 'No entitlement'
    }));

    component.getLtcEntitled();

    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('No entitlement', 'danger');
    expect(component.showLtcEntitledModal).toBeFalse();
  });

  it('should hide loader and show message when LTC entitlement API fails', () => {
    const component = createComponent();
    component.$claimApi.getLtcEntitled.and.returnValue(throwError(() => new Error('down')));

    component.getLtcEntitled();

    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Unable to load LTC entitlement.',
      'danger'
    );
  });

  it('should map LTC entitlement year cells using legacy first to fourth keys', () => {
    const component = createComponent();
    const row = {
      firstYearAvailed: 1,
      firstListMember: [{ memberName: 'Self', relation: 'Self' }],
      secondYearAvailed: 0,
      secondListMember: []
    };

    expect(component.getEntitlementCell(row, 0)).toEqual({
      availed: 1,
      members: [{ memberName: 'Self', relation: 'Self' }]
    });
    expect(component.getEntitlementCell(row, 1)).toEqual({
      availed: 0,
      members: []
    });
  });

  it('should load LTC availed history using legacy headers and open availed history modal', () => {
    const component = createComponent();
    component.$claimApi.getLtcAvailedEntitledHistory.and.returnValue(of({
      status: true,
      object: {
        singleBlockYear: ['2026', '2027'],
        listYearsAvailed: [{ firstYearAvailed: 1, firstListMember: [] }]
      }
    }));

    component.getLtcAvailedHistory();

    expect(component.$common.showLoader).toHaveBeenCalled();
    expect(component.$claimApi.getLtcAvailedEntitledHistory).toHaveBeenCalledWith(jasmine.objectContaining({
      headers: jasmine.objectContaining({ userId: 42, unitId: 'U1' })
    }));
    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.ltcAvailedHistory.singleBlockYear).toEqual(['2026', '2027']);
    expect(component.showLtcAvailedHistoryModal).toBeTrue();
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('should show message and keep LTC availed history modal closed on false response', () => {
    const component = createComponent();
    component.$claimApi.getLtcAvailedEntitledHistory.and.returnValue(of({
      status: false,
      message: 'No history'
    }));

    component.getLtcAvailedHistory();

    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('No history', 'danger');
    expect(component.showLtcAvailedHistoryModal).toBeFalse();
  });

  it('should hide loader and show message when LTC availed history API fails', () => {
    const component = createComponent();
    component.$claimApi.getLtcAvailedEntitledHistory.and.returnValue(throwError(() => new Error('down')));

    component.getLtcAvailedHistory();

    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Unable to load LTC availed history.',
      'danger'
    );
  });

  it('should format LTC availed history dates through the shared date pipe', () => {
    const component = createComponent();

    expect(component.formatDisplayDate(1700000000000)).toBe('2023-11-14');
    expect(component.formatDisplayDate(null)).toBe('-');
  });

  it('should store newly married flag as legacy Yes/No and clear spouse details when unchecked', () => {
    const component = createComponent();
    component.claims.yatLtcAdvDTOs[0].yatSpouseDetailDTO = {
      memberName: 'Spouse',
      age: '27',
      relation: 'Spouse',
      occupation: 'NA'
    };

    component.onNewlyMarriedChange({ target: { checked: true } } as any);
    expect(component.claims.yatLtcAdvDTOs[0].isNewlyMarried).toBe('Yes');

    component.onNewlyMarriedChange({ target: { checked: false } } as any);
    expect(component.claims.yatLtcAdvDTOs[0].isNewlyMarried).toBe('No');
    expect(component.claims.yatLtcAdvDTOs[0].yatSpouseDetailDTO).toEqual({
      memberName: '',
      age: '',
      relation: '',
      occupation: ''
    });
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
    expect(component.$formDocument.uploadSupportDoc).not.toHaveBeenCalled();

    component.$common.checkForValidFile.and.returnValue(true);
    component.uploadGxForm({ target: { files: [{ size: 1024 }], value: '' } } as any);
    expect(component.$formDocument.uploadSupportDoc).toHaveBeenCalled();
    expect(component.claims.gxFormFileUrl).toBe('gx-ltc.pdf');
    expect(component.showGxFileBrowse).toBeFalse();
  });

  it('should mark gx form for deletion only after confirmation', () => {
    const component = createComponent();
    component.claims.gxFormFileUrl = 'old-gx.pdf';
    component.gxFile = { name: 'new-gx.pdf' } as any;
    component.gxFileName = 'new-gx.pdf';
    component.gxFilePreviewUrl = 'blob:gx-preview';
    spyOn(URL, 'revokeObjectURL');
    spyOn(window, 'confirm').and.returnValues(false, true);

    component.deleteGxForm();
    expect(component.$formDocument.deleteSupportDocByUrl).not.toHaveBeenCalled();
    expect(component.claims.gxFormFileUrl).toBe('old-gx.pdf');

    component.deleteGxForm();

    expect(component.$formDocument.deleteSupportDocByUrl).not.toHaveBeenCalled();
    expect(component.claims.deleteGxFileUrl).toBe('old-gx.pdf');
    expect(component.claims.gxFormFileUrl).toBeNull();
    expect(component.gxFile).toBeNull();
    expect(component.gxFileName).toBe('');
    expect(component.gxFilePreviewUrl).toBe('');
    expect(component.showGxFileBrowse).toBeTrue();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:gx-preview');
  });

  it('should block submit when form invalid', () => {
    const component = createComponent();
    component.submit({ invalid: true } as any);
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please fill all required fields.', 'danger');
    expect(component.$claimApi.createOrUpdateAdvance).not.toHaveBeenCalled();
  });

  it('should block submit when gx upload missing', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(true);
    component.showGxFileBrowse = true;
    component.gxFile = null;
    component.submit({ invalid: false } as any);
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please upload GX Form PDF.', 'danger');
    expect(component.$claimApi.createOrUpdateAdvance).not.toHaveBeenCalled();
  });

  it('should submit valid form to outbox', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(true);
    component.showGxFileBrowse = false;
    component.claims.signWith = component.codeSignType.inkSign;
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: '1000', amount: '1000' }];
    component.submit({ invalid: false } as any);
    const formData = component.$claimApi.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('OB');
    expect(component.$claimStateApi.changeStatusById).toHaveBeenCalledWith(jasmine.objectContaining({
      claimId: 2002,
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR'
    }));
    expect(component.$claimStateApi.notifyStatusCountRefresh).toHaveBeenCalled();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/creator/new');
  });

  it('should prepare eSign status handoff after outbox save', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(true);
    component.showGxFileBrowse = false;
    component.claims.signWith = component.codeSignType.eSign;
    component.userIdDetails = {
      ...component.userIdDetails,
      financialYear: '2026',
      moduleId: 'ADV',
    };
    component.$claimApi.createOrUpdateAdvance.and.returnValue(of({
      status: true,
      object: [{ claimId: 404 }],
    }) as any);

    component.submit({ invalid: false } as any);

    expect(component.$esignApi.prepareForESign).toHaveBeenCalledWith(jasmine.objectContaining({
      claimId: 404,
      status: 'OB',
      userId: 42,
      roleTypeId: 'CR',
      financialYear: '2026',
      moduleId: 'ADV',
    }));
    expect(component.$claimStateApi.changeStatusById).not.toHaveBeenCalled();
    expect(component.$claimStateApi.notifyStatusCountRefresh).toHaveBeenCalled();
    expect(component.eSignTempFormObj).toEqual({ transactionId: 'ES-LTC-1' });
    expect(component.disableBtn).toBeFalse();
  });

  it('should save draft payload with normalized fields', () => {
    const component = createComponent();
    component.claims.codeUnitDTO = { unit: 'U1', descr: 'Unit One' };
    component.claims.deleteGxFileUrl = 'old-gx.pdf';
    component.claims.yatLtcAdvDTOs[0].place = 'new delhi';
    component.claims.yatLtcAdvDTOs[0].ltcPlace = 'leh ladakh';
    component.claims.yatLtcAdvDTOs[0].isNewlyMarried = 'Yes';
    component.claims.yatDtsDetailDTOs = [
      { isDts: 'Yes', amount: '1000', tempAmount: '800' },
      { isDts: 'No', amount: '1,200', tempAmount: '' }
    ];
    component.documentDtos = [{ codeDocInfoDTO: { id: 8, docName: 'GX Form' }, otherDocName: 'GX Other' }];
    component.claims.internalRemarks = 'LTC remarks 🚢';
    component.$claimApi.createOrUpdateAdvance.and.returnValue(of({
      status: true,
      object: [{
        claimId: 303,
        gxFormFileUrl: 'gx-ltc.pdf',
        yatLtcAdvDTOs: [{ advAmt: '1200', totalAmt: '1500' }],
        yatDtsDetailDTOs: [{ isDts: 'Yes', amount: '1000' }],
        yatFamilyDetailDTOs: [{ memberName: 'Self' }],
        yatDocsDTOs: [{ docName: 'Saved LTC Doc' }],
        yatClaimBankDetailDTO: {
          accountNo: '00131150000656',
          ifscCode: 'HDFC0000013',
        },
      }],
    }) as any);

    component.saveDraft();
    const formData = component.$claimApi.createOrUpdateAdvance.calls.mostRecent().args[0] as FormData;
    const payload = JSON.parse(formData.get('yatClaimDTO') as string);
    expect(payload.claimState).toBe('DR');
    expect(payload.roleTypeId).toBe('CR');
    expect(payload.aclUserDTO.userId).toBe(42);
    expect(payload.codeSubFormDTO.subFormId).toBe('L');
    expect(payload.codeUnitDTO).toEqual({ unit: 'U1' });
    expect(payload.deleteGxFileUrl).toBe('old-gx.pdf');
    expect(payload.internalRemarks).toBe('LTC remarks ');
    expect(payload.yatLtcAdvDTOs[0].place).toBe('NEW DELHI');
    expect(payload.yatLtcAdvDTOs[0].ltcPlace).toBe('LEH LADAKH');
    expect(payload.yatLtcAdvDTOs[0].isNewlyMarried).toBe('Yes');
    expect(payload.yatDtsDetailDTOs[0].amount).toBe('800');
    expect(payload.yatDtsDetailDTOs[1].amount).toBe('1200');
    expect(payload.yatDtsDetailDTOs[0].tempAmount).toBeUndefined();
    expect(payload.yatDocsDTOs).toEqual([]);
    expect(component.claims.claimId).toBe(303);
    expect(component.claims.yatLtcAdvDTOs[0].advAmt).toBe('900');
    expect(component.claims.yatDtsDetailDTOs[0].tempAmount).toBe('1000');
    expect(component.claims.yatFamilyDetailDTOs[0].memberName).toBe('Self');
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect(component.documentDtos).toEqual([{ docName: 'Saved LTC Doc' }] as any);
    expect(component.$codeDocInfo.setDocument).toHaveBeenCalledWith(component.documentDtos as any);
    expect(component.claims.deleteGxFileUrl).toBeUndefined();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/creator/draft');
  });

  it('should map legacy claim/single LTC response into personal, bank, documents, and travel details', () => {
    const component = createComponent();
    component.claimIdParam = 'C_ID_LTC_1';
    component.supplementaryId = 'SUP-LTC-1';
    component.$claimApi.getSingleClaim.and.returnValue(of({
      status: true,
      object: [{
        claimId: 'C_ID_LTC_1',
        occDate: 1700000000000,
        gxFormFileUrl: 'gx-ltc.pdf',
        yatLtcAdvDTOs: [{
          name: 'M Kalai',
          rank: 'P/ADH(P)',
          pno: '01361-T',
          payLevel: 'L08',
          basicPay: 64100,
          gxDate: 1700000000000,
          ltcType: 'SELF',
          blockYear: '2026-2027',
          totalAmt: '1500',
          advAmt: '1350',
          codeHrPincodeVillageDTOs: [
            { village: 'KANNUR', isSelected: '0' },
            { village: 'KOCHI', isSelected: '1' },
          ],
        }],
        yatFamilyDetailDTOs: [{ memberName: 'Self' }],
        yatDtsDetailDTOs: [
          { isDts: 'Yes', amount: '1,000' },
          { isDts: 'No', amount: '500', tempAmount: '' },
          { isDts: 'NA', amount: '' },
        ],
        yatDocsDTOs: [{ docName: 'Existing LTC Doc' }],
        yatClaimBankDetailDTO: {
          bankName: 'HDFC BANK LTD',
          ifscCode: 'HDFC0000013',
          accountNo: '00131150000656',
        },
      }],
    }) as any);

    component.getFormDetails();

    const config = component.$claimApi.getSingleClaim.calls.mostRecent().args[0];
    expect(config.headers).toEqual(jasmine.objectContaining({
      claimId: 'C_ID_LTC_1',
      subFormId: 'L',
      isPreview: 'false',
      isFetch: 'true',
      userId: 42,
      supCLaimId: 'SUP-LTC-1',
    }));

    const adv = component.claims.yatLtcAdvDTOs[0];
    expect(adv.name).toBe('M Kalai');
    expect(adv.pno).toBe('01361-T');
    expect(adv.rank).toBe('P/ADH(P)');
    expect(adv.payLevel).toBe('L08');
    expect(adv.isDts).toBe('Yes');
    expect(component.claims.yatClaimBankDetailDTO.bankAccNo).toBe('00131150000656');
    expect(adv.placeOfVisit).toBe('KOCHI');
    expect(component.disableHomeTown).toBeTrue();
    expect(component.claims.yatDtsDetailDTOs[0].amount).toBe('1000');
    expect(component.claims.yatDtsDetailDTOs[0].tempAmount).toBe('1000');
    expect(component.claims.yatDtsDetailDTOs[1].amount).toBe('500');
    expect(component.claims.yatDtsDetailDTOs[1].tempAmount).toBe('500');
    expect(component.claims.yatDtsDetailDTOs[2].amount).toBe('');
    expect(component.claims.yatDtsDetailDTOs[2].tempAmount).toBe('');
    expect(component.documentDtos).toEqual([{ docName: 'Existing LTC Doc' }] as any);
    expect(component.$codeDocInfo.setDocument).toHaveBeenCalledWith(component.documentDtos as any);
    expect(component.showGxFileBrowse).toBeFalse();
    expect(component.checkForPreviewBtn).toHaveBeenCalled();
  });

  it('should open IFSC modal with the current IFSC code', () => {
    const component = createComponent();
    component.claims.yatClaimBankDetailDTO.ifscCode = 'HDFC0000013';

    component.openIfscModal();

    expect(component.newIfscCode).toBe('HDFC0000013');
    expect(component.showIfscModal).toBeTrue();
  });

  it('should block empty and invalid IFSC updates', () => {
    const component = createComponent();

    component.newIfscCode = '   ';
    component.submitIFSCUpdate();
    expect(component.$bankIfscApi.createOrUpdate).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please enter IFSC code.', 'danger');

    component.newIfscCode = 'BADIFSC';
    component.submitIFSCUpdate();
    expect(component.$bankIfscApi.createOrUpdate).not.toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Please enter valid IFSC code.', 'danger');
  });

  it('should update IFSC through the legacy bankIfsc flow and close modal on success', () => {
    const component = createComponent();
    component.claims.claimId = 303;
    component.claims.aclUserDTO = { userId: 'ACL-1' };
    component.showIfscModal = true;
    component.newIfscCode = 'hdfc0000013';

    component.submitIFSCUpdate();

    expect(component.$common.showLoader).toHaveBeenCalled();
    expect(component.$bankIfscApi.createOrUpdate).toHaveBeenCalledWith(
      { ifscCode: 'HDFC0000013', userId: 'ACL-1' },
      { headers: { claimId: 303 } }
    );
    expect(component.claims.yatClaimBankDetailDTO.ifscCode).toBe('HDFC0000013');
    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'IFSC Code updated successfully.',
      'success'
    );
    expect(component.showIfscModal).toBeFalse();
  });

  it('should keep modal open and hide loader on false IFSC response', () => {
    const component = createComponent();
    component.showIfscModal = true;
    component.newIfscCode = 'HDFC0000013';
    component.$bankIfscApi.createOrUpdate.and.returnValue(of({
      status: false,
      message: 'Invalid branch'
    }));

    component.submitIFSCUpdate();

    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith('Invalid branch', 'danger');
    expect(component.showIfscModal).toBeTrue();
  });

  it('should hide loader and show error when IFSC API fails', () => {
    const component = createComponent();
    component.newIfscCode = 'HDFC0000013';
    component.$bankIfscApi.createOrUpdate.and.returnValue(throwError(() => new Error('down')));

    component.submitIFSCUpdate();

    expect(component.$common.hideLoader).toHaveBeenCalled();
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Error while updating IFSC code.',
      'danger'
    );
  });

  it('should fallback to ink sign on esign unavailability and error', () => {
    const component = createComponent();
    component.claims.claimId = 999;
    component.claims.signWith = component.codeSignType.eSign;
    component.$esignApi.checkEsignAvailability.and.returnValue(of({ status: false, message: 'eSign unavailable' }));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe(component.codeSignType.inkSign);
    expect(component.$common.showMessage).toHaveBeenCalledWith('eSign unavailable', 'danger');

    component.claims.signWith = component.codeSignType.eSign;
    component.$esignApi.checkEsignAvailability.and.returnValue(throwError(() => new Error('down')));
    component.checkEsignAvailability();
    expect(component.claims.signWith).toBe(component.codeSignType.inkSign);
    expect(component.$common.showMessage).toHaveBeenCalledWith('Unable to verify eSign availability.', 'danger');
  });

  it('should fallback to ink sign when checking eSign before initial save', () => {
    const component = createComponent();
    component.claims.claimId = null;
    component.claims.signWith = component.codeSignType.eSign;

    component.checkEsignAvailability();

    expect(component.$esignApi.checkEsignAvailability).not.toHaveBeenCalled();
    expect(component.claims.signWith).toBe(component.codeSignType.inkSign);
    expect(component.$common.showMessage).toHaveBeenCalledWith(
      'Please save the LTC advance before checking eSign availability.',
      'danger'
    );
  });

  it('should stop submit when LTC client validation fails', () => {
    const component = createComponent();
    spyOn(component, 'runLtcClientValidationOnly' as any).and.returnValue(false);
    component.showGxFileBrowse = false;
    component.claims.yatDtsDetailDTOs = [{ isDts: 'Yes', tempAmount: '1000', amount: '1000' }];

    component.submit({ invalid: false } as any);

    expect(component.$claimApi.createOrUpdateAdvance).not.toHaveBeenCalled();
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
    component.$auth.getModuleName.and.returnValue('/adv/creator');

    component.navigatePreview();

    expect(component.previewWindow.openUrl).toHaveBeenCalledWith('/adv/creator/preview-ltc-advance?id=222&supId=SUP-LTC-1');
    expect(component.router.navigate).not.toHaveBeenCalled();
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
    expect((component as any).getCurrentFormRoute()).toBe('form-ltc-advance');
    expect((component as any).getPreviewRoute()).toBe('preview-ltc-advance');

    component.activeFormKind = 'claim';
    expect((component as any).getCurrentFormRoute()).toBe('form-ltc-claim');
    expect((component as any).getPreviewRoute()).toBe('preview-ltc-claim');
  });

  it('should show legacy LTC claim title in claim mode', () => {
    const component = createComponent();
    component.activeFormKind = 'claim';

    expect(component.pageTitle).toBe('LTC Claim');

    component.supplementaryId = 'SUP-LTC-1';
    expect(component.pageTitle).toBe('Supplementary LTC Claim');
  });
});


