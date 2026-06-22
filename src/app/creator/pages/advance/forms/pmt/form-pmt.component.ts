import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/service/core/util.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { EsignApiService } from 'src/app/service/api/security/esign-api.service';
import { BankIfscApiService } from 'src/app/service/api/code/bank-ifsc-api.service';
import { FormDocumentService } from 'src/app/service/core/form-document.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { PayLevelApiService } from 'src/app/service/api/masters/pay-level-api.service';
import { CommonDialogService } from 'src/app/service/core/common-dialog.service';
import {
  clearLegacyInvalidFromEvent,
  validateLegacyRequiredSection,
} from '../shared/helpers/legacy-form-validation.helper';

declare var $: any;

/* ========= DTOs ========= */

interface YatDtsDetailDTO {
  _reasonForNoDtsError?: boolean;
  source?: string;
  destination?: string;
  modeOfTravel?: string;
  otherModeOfTravel?: string;
  classOfTravel?: string;
  distance?: string | number | null;
  amount?: string | number | null;
  tempAmount?: string | number | null;
  isDts?: string | null;
  reasonForNoDts?: string;
  remarks?: string;
}

interface YatClaimBankDetailDTO {
  claimBankId?: number | null;
  bankAccNo?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  micrCode?: string | null;
  branch?: string | null;
  accountNo?: string | null;
}

interface YatFamilyDetailDTO {
  familyId?: string | null;
  memberName?: string | null;
  age?: string | null;
  relation?: string | null;
  occupation?: string | null;
  checkedIndicator?: boolean;
}

interface YatPermDutyAdvDTO {
  permDutyAdvId?: string | null;

  name?: string | null;
  rank?: string | null;
  pno?: string | null;
  payLevel?: string | null;
  basicPay?: string | null;

  permTransTo?: string | null;
  wefDate?: any;
  videPresentUnit?: string | null;

  gxUnit?: string | null;
  gxNumber?: string | null;
  gxDate?: any;

  appliedTo?: string | null;
  unitList?: string[] | null;
  fromUnitList?: string[] | null;

  otherUnit?: string | null;

  stnFrom?: string | null;
  stnTo?: string | null;
  distance?: string | null;

  pmtType?: string | null;
  familyType?: string | null;
  pmtTypeClaimId?: string | null;

  isDts?: string | null;
  reasonDts?: string | null;

  arrPerson?: number | string | null;
  arrFare?: string | null;

  transPerEffectKg?: string | null;
  transPerEffectKgRs?: string | null;
  transPerEffectKms?: string | null;
  transPerEffectKmsRs?: string | null;

  transPerEffectShipKg?: string | null;
  transPerEffectShipKgRs?: string | null;
  transPerEffectShipKms?: string | null;
  transPerEffectShipKmsRs?: string | null;

  transChargeRs?: string | null;
  transChargeShipRs?: string | null;

  shipFare?: string | null;
  //entitled: any;
  entitledAmount?: string | null;

  totalAmt?: string | null;
  advAmt?: string | null;
  totalBudgetedAmt?: string | null;
  dtsAmount?: string | null;

  authNo?: string | null;
  authDate?: any;
  place?: string | null;
  date?: any;
  areaType?: string | null;
  compositeGrant?: string | null;
  compositeGrantIsland?: string | null;
  isAvailComposite?: string | null;
  compositeGrantAmt?: string | null;

  maxTransEffectKg?: string | null;
  maxTransEffectShipKg?: string | null;
}

interface Claims {
  claimId?: number | null;
  codeSubFormDTO: any;
  codeUnitDTO: any;

  gxUnitId?: string | null;
  signWith?: string | null;
  gxFormFileUrl?: string | null;
  deleteGxFileUrl?: string | null;

  occDate?: any;
  subDate?: any;

  aclUserDTO?: any;
  roleTypeId?: any;
  claimState?: string | null;
  claimMode?: string | null;
  advClaimId?: string | number | null;
  supClaimId?: string | number | null;

  pno?: string | null;
  name?: string | null;

  internalRemarks?: string | null;

  yatPermDutyAdvDTOs: YatPermDutyAdvDTO[];
  yatFamilyDetailDTOs: YatFamilyDetailDTO[];
  yatClaimBankDetailDTO: YatClaimBankDetailDTO;
  yatDtsDetailDTOs: YatDtsDetailDTO[];
  yatDocsDTOs?: any[];

  ifscnull?: boolean;
}

@Component({
  selector: 'app-form-pmt',
  templateUrl: './form-pmt.component.html',
  styleUrls: ['./form-pmt.component.css'],
  standalone: false,
})
export class FormPmtDutyComponent implements OnInit {
  activeTab: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6' = 'ship';
  payLevels: any[] = [];
  isDutyLessTwenty = false;
  selectClaim: any = null;
  //entitledList: any[];
  landInfoTooltip: string;
  shipInfoTooltip: string;
  partValueLand = 1;
  partValueShip = 1;
  entitledAmount = 0;
  entitledList: string[] = [];
  trackByValue = (_: number, v: any) => v;

  onlyNumberKey(event: KeyboardEvent): boolean {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowed.includes(event.key)) return true;

    // Allow digits only
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  codeClaim = { pmtAdv: 'P', resettleClm: 'RS' } as const;

  codeClaimState = {
    draft: 'DR',
    outbox: 'OB',
  } as const;

  codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
  } as const;

  userIdDetails: any;
  today: any;
  config: any;

  claims: Claims = this.createEmptyClaims();

  showIfscModal = false;
  newIfscCode: string = '';
  claimId: any;
  eSignTempFormObj: any = null;

  isPreviewDisabled = true;
  disableBtn = false;
  showErrors = false;

  gxUnitId: number | null = null;
  claimIdParam: string | null = null;
  resubClaimId: string | null = null;
  supplementaryId: string | null = null;
  activeSubFormId = 'P';
  activeFormKind: 'advance' | 'claim' = 'advance';

  allUnits: any[] = [];

  tempTravel: YatDtsDetailDTO = {};
  selectedTravelIndex: number | null = null;
  travelBtnName = 'Add';
  boolIsDts = false;
  otherMode = false;
  isDtsDisabled = false;

  gxFormModel: any;
  gxFormUploading = false;
  documentDtos: any[] = [];

  isCompositeChecked(): boolean {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    return (adv?.isAvailComposite || '').toUpperCase() === 'Y';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private UtilService: UtilService,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $common: CommonService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $esignApi: EsignApiService,
    private $bankIfscApi: BankIfscApiService,
    private $formDocument: FormDocumentService,
    private http: HttpClient,
    private $codeDocInfo: CodeDocInfoApiService,
    private $codeUnitApi: CodeUnitApiService,
    private $payLevelApi: PayLevelApiService,
    private $dialog: CommonDialogService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.activeFormKind = this.resolveFormKind(this.route.snapshot.data?.['formKind']);
    this.activeSubFormId = this.resolveSubFormId(this.route.snapshot.data?.['subFormId']);
    this.claims.codeSubFormDTO = {
      ...(this.claims.codeSubFormDTO || {}),
      subFormId: this.activeSubFormId,
    };

    const qp = this.route.snapshot.queryParamMap;
    this.claimIdParam =
      qp.get('id') ||
      (this.activeFormKind === 'claim' ? qp.get('claimId') : null) ||
      qp.get('resubId');
    this.resubClaimId = qp.get('resubId');
    this.supplementaryId = qp.get('supId');

    const gxUnitIdStr = qp.get('gxUnitId');
    this.gxUnitId = gxUnitIdStr ? +gxUnitIdStr : null;

    this.getUnits();
    this.getFormDetails();
    this.loadPayLevels();
    this.$codeDocInfo.documentDtos.subscribe((docs: any) => {
      this.documentDtos = Array.isArray(docs) ? docs : [];
    });
  }

  /* ===================== INIT EMPTY ===================== */

  private createEmptyClaims(): Claims {
    return {
      signWith: this.codeSignType.eSign,
      codeSubFormDTO: { subFormId: this.activeSubFormId } as any,
      codeUnitDTO: { unit: '', descr: '' } as any,

      yatPermDutyAdvDTOs: [this.createEmptyPmtAdv()],
      yatFamilyDetailDTOs: [],
      yatDtsDetailDTOs: [],
      yatDocsDTOs: [],
      yatClaimBankDetailDTO: {
        claimBankId: null,
        bankAccNo: null,
        bankName: null,
        ifscCode: null,
        micrCode: null,
      },
      internalRemarks: null,
    };
  }

  private createEmptyPmtAdv(): YatPermDutyAdvDTO {
    return {
      permDutyAdvId: null,
      name: null,
      rank: null,
      pno: null,
      payLevel: null,
      basicPay: null,

      videPresentUnit: null,
      appliedTo: null,
      unitList: [],
      fromUnitList: [],

      permTransTo: null,
      otherUnit: null,

      stnFrom: null,
      stnTo: null,
      distance: null,

      gxUnit: null,
      gxNumber: null,
      gxDate: null,

      wefDate: null,

      pmtType: 'F',
      familyType: 'SF',
      areaType: 'M',
      isAvailComposite: 'N',
      entitledAmount: null,
      pmtTypeClaimId: null,
      compositeGrantAmt: '0',

      isDts: 'Yes',
      reasonDts: null,

      arrPerson: 0,
      arrFare: null,

      transPerEffectKg: null,
      transPerEffectKgRs: null,
      transPerEffectKms: null,
      transPerEffectKmsRs: null,

      transPerEffectShipKg: null,
      transPerEffectShipKgRs: null,
      transPerEffectShipKms: null,
      transPerEffectShipKmsRs: null,

      transChargeRs: null,
      transChargeShipRs: null,
      shipFare: null,

      totalAmt: null,
      advAmt: null,
      totalBudgetedAmt: null,
      dtsAmount: null,

      authNo: null,
      authDate: null,
      place: null,
      date: null,
    };
  }

  /* ===================== UTIL ===================== */

  isNullOrEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private sumOfColumn(arr: any[], key: string): number {
    return (arr || []).reduce(
      (sum, item) => sum + this.toNumber(item?.[key]),
      0
    );
  }

  private fromMillisToDateInput(ms: any): string | null {
    const n = this.toNumber(ms);
    if (!n) return null;
    return this.datePipe.transform(new Date(n), 'yyyy-MM-dd');
  }

  private normalizeBankDetail(bank: any): YatClaimBankDetailDTO {
    const current = this.claims?.yatClaimBankDetailDTO || {};
    const merged = {
      ...current,
      ...(bank || {}),
    };
    const accountValue =
      merged.bankAccNo ??
      merged.accountNo ??
      current.bankAccNo ??
      current.accountNo ??
      null;

    return {
      ...merged,
      bankAccNo: accountValue,
      accountNo: merged.accountNo ?? accountValue,
    };
  }

  private normalizePmtDtsRows(rows: any[]): YatDtsDetailDTO[] {
    return (rows || []).map((row: any) => ({
      ...row,
      amount: this.normalizeAmountValue(row?.amount, null) ?? (row?.amount ?? ''),
      tempAmount:
        this.normalizeAmountValue(row?.tempAmount, null) ??
        this.normalizeAmountValue(row?.amount, null) ??
        '',
    }));
  }

  private mergeSavedPmtResponse(obj: any): void {
    if (!obj) return;

    const currentAdv = this.claims?.yatPermDutyAdvDTOs?.[0] || this.createEmptyPmtAdv();
    const savedAdv = Array.isArray(obj.yatPermDutyAdvDTOs)
      ? obj.yatPermDutyAdvDTOs[0]
      : null;
    const savedDtsRows = Array.isArray(obj.yatDtsDetailDTOs)
      ? this.normalizePmtDtsRows(obj.yatDtsDetailDTOs)
      : this.claims.yatDtsDetailDTOs;
    const savedFamilyRows = Array.isArray(obj.yatFamilyDetailDTOs)
      ? obj.yatFamilyDetailDTOs
      : this.claims.yatFamilyDetailDTOs;
    const savedDocs = Array.isArray(obj.yatDocsDTOs)
      ? obj.yatDocsDTOs
      : this.documentDtos;

    this.claims = {
      ...this.claims,
      ...obj,
      yatPermDutyAdvDTOs: [{ ...currentAdv, ...(savedAdv || {}) }],
      yatDtsDetailDTOs: savedDtsRows,
      yatFamilyDetailDTOs: savedFamilyRows,
      yatDocsDTOs: savedDocs,
      yatClaimBankDetailDTO: this.normalizeBankDetail(obj.yatClaimBankDetailDTO),
    };

    this.claimId = this.claims.claimId;
    this.documentDtos = this.claims.yatDocsDTOs || [];
    this.$codeDocInfo.setDocument(this.documentDtos as []);
    this.ensureDefaultPmtValues();
    delete (this.claims as any).deleteGxFileUrl;
    this.refreshEntitledUi();
    this.checkForPreviewBtn();
  }

  private buildClaimRemarkPayload(
    status: string,
    claimId: string,
    remark: string = ''
  ): any {
    return {
      claimId,
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status,
      remark,
      financialYear: this.userIdDetails?.financialYear,
      moduleId: this.userIdDetails?.moduleId,
    };
  }

  private completeSubmitStatusTransition(claimId: string): void {
    if (!claimId) {
      this.$common.showMessage(
        `Unable to update ${this.getFormDisplayName()} status.`,
        'danger'
      );
      this.$common.hideLoader();
      this.disableBtn = false;
      return;
    }

    const status = this.codeClaimState.outbox;
    const payload = this.buildClaimRemarkPayload(status, claimId);
    const isESignSubmit = this.claims?.signWith === this.codeSignType.eSign;
    const statusRequest = isESignSubmit
      ? this.$esignApi.prepareForESign(payload)
      : this.$claimStateApi.changeStatusById(payload);

    statusRequest.subscribe(
      (res: any) => {
        if (res?.status === false) {
          this.$common.showMessage(
            res?.message || `Unable to update ${this.getFormDisplayName()} status.`,
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
          return;
        }

        this.$claimStateApi.notifyStatusCountRefresh();
        if (isESignSubmit) {
          this.eSignTempFormObj = {
            id: claimId,
            claimId,
            roleTypeId: this.userIdDetails?.roleTypeId,
            userId: this.userIdDetails?.userId,
            status,
            remark: '',
            financialYear: this.userIdDetails?.financialYear,
            moduleId: this.userIdDetails?.moduleId,
          };
          if (typeof $ !== 'undefined') {
            $('#esign_modal').modal('show');
          }
        } else {
          const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
          if (moduleUrl) this.router.navigateByUrl(moduleUrl + '/new');
        }

        this.$common.hideLoader();
        this.disableBtn = false;
      },
      (err: any) => {
        console.error('Error while updating PMT status', err);
        this.$common.showMessage('Error while updating PMT status.', 'danger');
        this.$common.hideLoader();
        this.disableBtn = false;
      }
    );
  }

  /* ===================== LOAD SINGLE ===================== */

  getFormDetails(): void {
    try {
      this.$common.showLoader();

      const headers: any = {
        isPreview: 'false',
        gxUnitId: String(this.gxUnitId || this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || ''),
        userId: this.userIdDetails?.userId ?? '',
        subFormId: this.activeSubFormId,
        isFetch: 'true',
        claimId: this.claimIdParam || '',
      };
      if (this.supplementaryId) {
        headers.supCLaimId = this.supplementaryId;
      }

      this.config = { headers };

      this.$claimApi.getSingleClaim(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.$common.showMessage(
              response?.message || `Unable to load ${this.getFormDisplayName()} details.`,
              'danger'
            );
            return;
          }

          let obj: any = response.object;
          if (Array.isArray(obj)) obj = obj[0] || null;
          if (!obj) {
            this.$common.showMessage('No data returned from server.', 'danger');
            return;
          }

          const existingAdv = this.claims?.yatPermDutyAdvDTOs?.[0] || {};
          const dto =
            Array.isArray(obj.yatPermDutyAdvDTOs) &&
            obj.yatPermDutyAdvDTOs.length > 0
              ? obj.yatPermDutyAdvDTOs[0]
              : null;

          if (dto) {
            dto.gxDate = this.fromMillisToDateInput(dto.gxDate);
            dto.wefDate = this.fromMillisToDateInput(dto.wefDate);
            dto.authDate = this.fromMillisToDateInput(dto.authDate);
            dto.date = this.fromMillisToDateInput(dto.date);
          }
          obj.occDate = this.fromMillisToDateInput(obj.occDate);

          this.claims = {
            ...this.claims,
            ...obj,
            yatPermDutyAdvDTOs: [{ ...existingAdv, ...(dto || {}) }],
            yatDtsDetailDTOs: Array.isArray(obj.yatDtsDetailDTOs)
              ? this.normalizePmtDtsRows(obj.yatDtsDetailDTOs)
              : [],
            yatFamilyDetailDTOs: obj.yatFamilyDetailDTOs || [],
            yatDocsDTOs: obj.yatDocsDTOs || [],
            yatClaimBankDetailDTO: this.normalizeBankDetail(obj.yatClaimBankDetailDTO),
          };
          if (this.resubClaimId) {
            (this.claims as any).refAdvanceId = this.resubClaimId;
          }
          this.claimId = this.claims.claimId;
          this.documentDtos = this.claims.yatDocsDTOs || [];
          this.$codeDocInfo.setDocument(this.documentDtos as []);

          this.ensureDefaultPmtValues();

          this.claims.signWith =
            obj.signWith || this.claims.signWith || this.codeSignType.eSign;

          const adv = this.claims.yatPermDutyAdvDTOs[0];
          adv.unitList = adv.unitList || [];
          adv.fromUnitList = adv.fromUnitList || [];

          const dtoEntitled = Number(
            dto?.entitledAmount ?? dto?.entitled ?? dto?.entitledKg ?? 0
          );
          this.entitledAmount = !isNaN(dtoEntitled) ? dtoEntitled : 0;
          this.refreshEntitledUi();
          this.onAreaTypeChange();
          this.onFamilyTypeChange();
          this.calculateAmount(this.codeClaim.pmtAdv);
          this.checkForPreviewBtn();
        },
        (error) => {
          this.$common.hideLoader();
          console.error(`Error while loading ${this.getFormDisplayName()} details.`, error);
          this.$common.showMessage(
            `Error while loading ${this.getFormDisplayName()} details.`,
            'danger'
          );
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      console.error('Error while loading PMT Advance', e);
      this.$common.showMessage('Error while loading PMT Advance.', 'danger');
    }
  }

  checkForPreviewBtn(): void {
    this.isPreviewDisabled = !this.claims?.claimId;
  }

  goBack(): void {
    this.location.back();
  }

  /* ===================== UNITS ===================== */

  getUnits(): void {
    try {
      this.$common.showLoader();
      const config = { headers: {} };
      this.$codeUnitApi.getAllUnits(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) {
            this.allUnits = response.object || [];
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.error('Error while loading PMT units.', err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.error('Error while loading PMT units.', error);
    }
  }

  /* ===================== CALCULATION ===================== */

  private isEmpty(v: any): boolean {
    return (
      v === null ||
      v === undefined ||
      (typeof v === 'string' && v.trim() === '')
    );
  }

  private n(v: any): number {
    return this.normalizeAmountValue(v, 0) ?? 0;
  }

  calculateAmount(type: string): void {
    if (type !== this.codeClaim.pmtAdv) return;

    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    let calPmtAmt = 0;

    if (!this.isEmpty(adv.compositeGrant))
      calPmtAmt += this.n(adv.compositeGrant);
    if (!this.isEmpty(adv.compositeGrantIsland))
      calPmtAmt += this.n(adv.compositeGrantIsland);

    if (!this.isEmpty(adv.arrFare)) calPmtAmt += this.n(adv.arrFare);
    if (!this.isEmpty(adv.shipFare)) calPmtAmt += this.n(adv.shipFare);
    if (!this.isEmpty(adv.transChargeRs))
      calPmtAmt += this.n(adv.transChargeRs);
    if (!this.isEmpty(adv.transChargeShipRs))
      calPmtAmt += this.n(adv.transChargeShipRs);

    if (
      !this.isEmpty(adv.transPerEffectShipKms) &&
      !this.isEmpty(adv.transPerEffectShipKgRs)
    ) {
      let shipAmt =
        this.n(adv.transPerEffectShipKms) * this.n(adv.transPerEffectShipKgRs);
      shipAmt = Math.round(shipAmt * this.partValueShip);
      adv.transPerEffectShipKmsRs = String(shipAmt);
      calPmtAmt += shipAmt;
    } else {
      adv.transPerEffectShipKmsRs = null;
    }
    if (
      !this.isEmpty(adv.transPerEffectKgRs) &&
      !this.isEmpty(adv.transPerEffectKms)
    ) {
      let kmsRs =
        this.n(adv.transPerEffectKgRs) * this.n(adv.transPerEffectKms);
      kmsRs = Math.round(kmsRs * this.partValueLand);
      adv.transPerEffectKmsRs = String(kmsRs);
      calPmtAmt += kmsRs;
    } else {
      adv.transPerEffectKmsRs = null;
    }

    adv.totalAmt = String(Math.round(calPmtAmt));

    const dtsRows = (this.claims.yatDtsDetailDTOs || []).filter(
      (e) => e.isDts !== 'NA' && e.isDts !== 'No'
    );
    const nonDtsRows = (this.claims.yatDtsDetailDTOs || []).filter(
      (e) => e.isDts === 'NA' || e.isDts === 'No'
    );

    let dtsAmount = dtsRows.reduce(
      (s, r) => s + this.n((r as any).tempAmount ?? r.amount),
      0
    );
    let nonDtsAmount = nonDtsRows.reduce(
      (s, r) => s + this.n((r as any).tempAmount ?? r.amount),
      0
    );

    adv.dtsAmount = String(Math.round(dtsAmount));
    adv.totalAmt = String(Math.round(this.n(adv.totalAmt) + nonDtsAmount));

    this.calculateNintyAmount(this.codeClaim.pmtAdv);

    adv.totalBudgetedAmt = String(Math.round(this.n(adv.advAmt) + dtsAmount));
  }

  private getCompositeGrantAmount(): number {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return 0;

    const isChecked = adv.isAvailComposite === 'Y';
    if (!isChecked) return 0;

    const basicPay = this.toNumber(adv.basicPay);

    if (adv.areaType === 'I') return basicPay;
    return Math.round(basicPay * 0.8);
  }

  checkLessTwenty(distance: any): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    if (this.isNullOrEmpty(distance)) {
      this.isDutyLessTwenty = false;
      return;
    }

    if (this.int(distance) < 20) {
      adv.pmtType = 'F';
      this.isDutyLessTwenty = true;

      adv.pmtTypeClaimId = '';
      this.selectClaim = null;

      this.filterEntitledList(adv.pmtType, adv.familyType);
    } else {
      this.isDutyLessTwenty = false;
    }

    this.funcBasicPayChange();

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  filterEntitledList(
    pmtType: any,
    familyType: any,
    getCalled: boolean = false
  ): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    if (this.isNullOrEmpty(pmtType)) return;

    const entitledVal = this.round(this.entitledAmount);
    this.entitledList = [];

    if (!entitledVal || entitledVal <= 0) {
      adv.maxTransEffectKg = '';
      adv.maxTransEffectShipKg = '';
      return;
    }

    if (pmtType === 'P') {
      const base = [2000, 4000, 6000];
      this.entitledList = base.filter((x) => x <= entitledVal).map(String);

      if (this.entitledList.length === 0) {
        adv.maxTransEffectKg = '';
        adv.maxTransEffectShipKg = '';
        this.onMaxKgChange();
        this.calculateAmount(this.codeClaim.pmtAdv);
        return;
      }

      const curLand = String(this.int(adv.maxTransEffectKg));
      if (!curLand || !this.entitledList.includes(curLand)) {
        adv.maxTransEffectKg = this.entitledList[this.entitledList.length - 1];
      }

      const curShip = String(this.int(adv.maxTransEffectShipKg));
      if (!curShip || !this.entitledList.includes(curShip)) {
        adv.maxTransEffectShipKg =
          this.entitledList[this.entitledList.length - 1];
      }
    } else {
      this.entitledList = [String(entitledVal)];
      adv.maxTransEffectKg = String(entitledVal);
      adv.maxTransEffectShipKg = String(entitledVal);
    }

    if (this.int(adv.transPerEffectKg) > this.int(adv.maxTransEffectKg)) {
      adv.transPerEffectKg = String(this.int(adv.maxTransEffectKg));
    }
    if (
      this.int(adv.transPerEffectShipKg) > this.int(adv.maxTransEffectShipKg)
    ) {
      adv.transPerEffectShipKg = String(this.int(adv.maxTransEffectShipKg));
    }

    this.onMaxKgChange();

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  private refreshEntitledUi(): void {
    const adv = this.adv;
    if (!adv) return;

    const entitledVal = this.round(this.entitledAmount || 0);
    if (!entitledVal || entitledVal <= 0) {
      this.entitledList = [];
      adv.maxTransEffectKg = '';
      return;
    }

    this.filterEntitledList(adv.pmtType, adv.familyType);

    if (adv.pmtType === 'F') {
      adv.maxTransEffectKg = String(entitledVal);
    } else {
      if (this.entitledList.length > 0) {
        const cur = String(adv.maxTransEffectKg || '');
        if (!this.entitledList.includes(cur)) {
          adv.maxTransEffectKg =
            this.entitledList[this.entitledList.length - 1];
        }
      } else {
        adv.maxTransEffectKg = '';
      }
    }

    this.onMaxKgChange();
  }

  onPmtTypeChange(): void {
    this.refreshEntitledUi();
  }

  setTitle(value: any, type: 'landInfo' | 'shipInfo'): void {
    const entitledVal = this.round(this.entitledAmount);
    const chosen = this.int(value);

    if (type === 'landInfo') this.landInfoTooltip = '';
    if (type === 'shipInfo') this.shipInfoTooltip = '';

    if (!entitledVal || !chosen) {
      if (type === 'landInfo') this.partValueLand = 1;
      if (type === 'shipInfo') this.partValueShip = 1;
      this.calculateAmount(this.codeClaim.pmtAdv);
      return;
    }

    const oneByThree = Math.round(entitledVal / 3);
    const twoByThree = Math.round((entitledVal * 2) / 3);

    let factor = 1;

    if (chosen !== entitledVal) {
      if (chosen === oneByThree) {
        factor = 1 / 3;
        if (type === 'landInfo')
          this.landInfoTooltip =
            'PMT type taken is PART and 1/3rd of the entitled amount is selected hence, amount permitted will also be 1/3rd of the total amount';
        else
          this.shipInfoTooltip =
            'PMT type taken is PART and 1/3rd of the entitled amount is selected hence, amount permitted will also be 1/3rd of the total amount';
      } else {
        factor = 2 / 3;
        if (type === 'landInfo')
          this.landInfoTooltip =
            'PMT type taken is PART and 2/3rd of the entitled amount is selected hence, amount permitted will also be 2/3rd of the total amount';
        else
          this.shipInfoTooltip =
            'PMT type taken is PART and 2/3rd of the entitled amount is selected hence, amount permitted will also be 2/3rd of the total amount';
      }
    }

    if (type === 'landInfo') this.partValueLand = factor;
    if (type === 'shipInfo') this.partValueShip = factor;

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  funcBasicPayChange(): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    const check = adv.isAvailComposite;
    const basicPay = Number(adv.basicPay || 0);

    adv.compositeGrant = '';
    adv.compositeGrantIsland = '';

    if (!basicPay) {
      this.calculateAmount(this.codeClaim.pmtAdv);
      return;
    }

    if (check !== 'Y') {
      this.calculateAmount(this.codeClaim.pmtAdv);
      return;
    }

    if (adv.areaType === 'M') {
      let eighty = basicPay * 0.8;
      if (this.isDutyLessTwenty) eighty = this.round(eighty / 3);
      adv.compositeGrant = String(this.round(eighty));
      adv.compositeGrantIsland = '';

      adv.shipFare = '';
      adv.transPerEffectShipKg = '';
      adv.transPerEffectShipKgRs = '';
      adv.transPerEffectShipKms = '';
      adv.transPerEffectShipKmsRs = '';
      adv.transChargeShipRs = '';
    } else if (adv.areaType === 'I') {
      let hundred = basicPay;
      if (this.isDutyLessTwenty) hundred = this.round(hundred / 3);
      adv.compositeGrantIsland = String(this.round(hundred));
      adv.compositeGrant = '';
    }

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  private computeCompositeGrantAmount(): number {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return 0;

    const basicPay = this.toNumber(adv.basicPay);

    if (adv.isAvailComposite !== 'Y') {
      adv.compositeGrantAmt = '0';
      return 0;
    }

    const factor = adv.areaType === 'I' ? 1 : 0.8;

    const ctg = Math.round(basicPay * factor);
    adv.compositeGrantAmt = String(ctg);

    return ctg;
  }

  calculateNintyAmount(type: string): void {
    if (type !== this.codeClaim.pmtAdv) return;

    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    if (!this.isEmpty(adv.totalAmt)) {
      adv.advAmt = String(Math.round(this.n(adv.totalAmt)));
    } else {
      adv.advAmt = '0';
    }
  }

  private int(n: any): number {
    const x = parseInt(String(n ?? ''), 10);
    return isNaN(x) ? 0 : x;
  }

  private toNum(v: any): number {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  round(n: number): number {
    const x = Number(n || 0);
    return Math.round(x);
  }

  private getPmtAdv() {
    return this.claims?.yatPermDutyAdvDTOs?.[0];
  }

  private ensureDefaultPmtValues(): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    if (!adv.pmtType) adv.pmtType = 'F';
    if (!adv.familyType) adv.familyType = 'SF';
    if (!adv.areaType) adv.areaType = 'M';
    if (!adv.isAvailComposite) adv.isAvailComposite = 'N';
    if (this.isNullOrEmpty(adv.isDts)) adv.isDts = 'Yes';
    if (this.isNullOrEmpty(adv.arrPerson)) adv.arrPerson = 0;
  }

  onCompositeToggle(): void {
    const adv = this.getPmtAdv();
    if (!adv) return;

    if (adv.isAvailComposite !== 'Y') {
      adv.compositeGrant = '';
      adv.compositeGrantIsland = '';
      this.calculateAmount(this.codeClaim.pmtAdv);
      return;
    }

    this.applyCompositeGrant();
  }

  onAreaTypeChange(): void {
    const adv = this.getPmtAdv();
    if (!adv) return;

    if (adv.isAvailComposite === 'Y') {
      this.applyCompositeGrant();
    } else {
      adv.compositeGrant = '';
      adv.compositeGrantIsland = '';
      this.calculateAmount(this.codeClaim.pmtAdv);
    }
  }

  private applyCompositeGrant(): void {
    const adv = this.getPmtAdv();
    if (!adv) return;

    const basicPay = this.toNum(adv.basicPay);

    if (basicPay <= 0) {
      adv.compositeGrant = '';
      adv.compositeGrantIsland = '';
      this.calculateAmount(this.codeClaim.pmtAdv);
      return;
    }

    const isLessTwenty = !!this.isDutyLessTwenty;

    if (adv.areaType === 'M') {
      let eighty = basicPay * 0.8;
      if (isLessTwenty) eighty = this.round(eighty / 3);

      adv.compositeGrant = String(this.round(eighty));
      adv.compositeGrantIsland = '';

      adv.shipFare = '';
      adv.transPerEffectShipKg = '';
      adv.transPerEffectShipKgRs = '';
      adv.transPerEffectShipKms = '';
      adv.transPerEffectShipKmsRs = '';
      adv.transChargeShipRs = '';
    } else if (adv.areaType === 'I') {
      let full = basicPay;
      if (isLessTwenty) full = this.round(full / 3);

      adv.compositeGrantIsland = String(this.round(full));
      adv.compositeGrant = '';
    } else {
      adv.compositeGrant = '';
      adv.compositeGrantIsland = '';
    }

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  /* ===================== TRAVEL DETAILS ===================== */

  validateTravel(detail: any, field: string): void {
    if (!detail) return;

    if (field === 'modeOfTravel') {
      const mode = (detail.modeOfTravel || '').trim();
      this.otherMode = mode === 'Others';
      this.boolIsDts = mode === 'Air' || mode === 'Train';
      this.isDtsDisabled = !!mode && !this.boolIsDts;

      if (!this.otherMode) {
        detail.otherModeOfTravel = '';
      }

      if (this.isDtsDisabled) {
        detail.isDts = 'NA';
        detail.reasonForNoDts = '';
        detail._reasonForNoDtsError = false;
      } else if (detail.isDts === 'NA') {
        detail.isDts = '';
      }
    }

    if (field === 'isDts') {
      if (detail.isDts === 'No') {
        detail._reasonForNoDtsError =
          !detail.reasonForNoDts || !detail.reasonForNoDts.trim();
      } else {
        detail.reasonForNoDts = '';
        detail._reasonForNoDtsError = false;
      }
    }

    if (field === 'reasonForNoDts') {
      detail._reasonForNoDtsError =
        detail.isDts === 'No' &&
        (!detail.reasonForNoDts || !detail.reasonForNoDts.trim());
    }
  }

  onIsDtsChange(detail: any): void {
    if (!detail) return;
    const value = detail.isDts;
    if (value === 'Yes' || value === 'DTS' || value === 'NA') {
      detail.reasonForNoDts = '';
    }
    this.validateTravel(detail, 'isDts');
  }

  addTravelDetails(detail: YatDtsDetailDTO): void {
    if (!detail) return;

    this.validateTravel(detail, 'modeOfTravel');

    if (this.isNullOrEmpty(detail.source)) {
      this.$common.showMessage('Please fill travel From.', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.destination)) {
      this.$common.showMessage('Please fill travel To.', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.modeOfTravel)) {
      this.$common.showMessage('Please select Mode of Travel.', 'danger');
      return;
    }

    if ((detail.modeOfTravel || '').trim() === 'Others' && this.isNullOrEmpty(detail.otherModeOfTravel)) {
      this.$common.showMessage('Please fill Other Mode of Travel when mode is Others.', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.isDts)) {
      this.$common.showMessage('Please select DTS.', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.tempAmount)) {
      this.$common.showMessage('Please fill Total Amount.', 'danger');
      return;
    }

    if (detail.isDts === 'No') {
      const reason = detail.reasonForNoDts ? detail.reasonForNoDts.trim() : '';
      if (!reason) {
        detail._reasonForNoDtsError = true;
        this.$common.showMessage(
          'Reason is required when DTS is No.',
          'danger'
        );
        return;
      }
    } else {
      detail.reasonForNoDts = '';
      detail._reasonForNoDtsError = false;
    }

    if (this.isNullOrEmpty(detail.tempAmount)) {
      detail.tempAmount = detail.amount as any;
    }

    if (this.isNullOrEmpty(detail.amount)) {
      detail.amount = detail.tempAmount as any;
    }

    if (this.selectedTravelIndex !== null) {
      this.claims.yatDtsDetailDTOs[this.selectedTravelIndex] = { ...detail };
    } else {
      this.claims.yatDtsDetailDTOs.push({ ...detail });
    }

    this.resetTempTravel();
    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  editTravelDetails(index: number): void {
    this.selectedTravelIndex = index;
    this.tempTravel = { ...this.claims.yatDtsDetailDTOs[index] };
    this.validateTravel(this.tempTravel, 'modeOfTravel');
    this.travelBtnName = 'Update';
  }

  async deleteTravel(index: number): Promise<void> {
    const ok = await this.$dialog.confirm({
      message: 'Do you really want to delete this row?',
      type: 'delete',
    });
    if (!ok) return;
    this.claims.yatDtsDetailDTOs.splice(index, 1);
    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  resetTempTravel(): void {
    this.tempTravel = {} as YatDtsDetailDTO;
    this.selectedTravelIndex = null;
    this.otherMode = false;
    this.boolIsDts = false;
    this.isDtsDisabled = false;
    this.travelBtnName = 'Add';
  }

  /* ===================== GX UPLOAD ===================== */

  uploadGxForm(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!file) return;

    const isValidExtension = this.$common.checkForValidFile(event);
    if (!isValidExtension) {
      this.claims.gxFormFileUrl = null;
      input.value = '';
      return;
    }

    const maxSizeBytes = 512 * 1024;
    if (file.size > maxSizeBytes) {
      this.$common.showMessage('File size must be 512 KB or less.', 'danger');
      this.claims.gxFormFileUrl = null;
      input.value = '';
      return;
    }

    this.gxFormUploading = true;

    this.$formDocument.uploadSupportDoc(file).subscribe(
      (res) => {
        this.gxFormUploading = false;
        if (res) {
        this.claims.gxFormFileUrl = res as string;
      } else {
        this.$common.showMessage('Unable to upload GX Form.', 'danger');
        this.claims.gxFormFileUrl = null;
        input.value = '';
      }
      },
      (error) => {
        this.gxFormUploading = false;
        this.$common.showMessage('Unable to upload GX Form.', 'danger');
        this.claims.gxFormFileUrl = null;
        input.value = '';
        console.log(error);
      }
    );
  }

  async deleteGxForm(): Promise<void> {
    if (!this.claims?.gxFormFileUrl) return;
    const ok = await this.$dialog.confirm({
      message: 'Do you really want to delete this GX Form?',
      type: 'delete',
    });
    if (!ok) return;

    this.claims.deleteGxFileUrl = this.claims.gxFormFileUrl;
    this.claims.gxFormFileUrl = null;
    this.gxFormModel = null;
  }

  removeEmoji(): void {
    if (this.claims.internalRemarks) {
      this.claims.internalRemarks = this.claims.internalRemarks.replace(
        /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        ''
      );
    }
  }

  /* ===================== SAVE ===================== */

  saveClaim(type: string, status: string, showToast: boolean = true): void {
    if (type !== this.codeClaim.pmtAdv && type !== this.codeClaim.resettleClm) return;

    this.calculateAmount(this.codeClaim.pmtAdv);
    this.removeEmoji();
    this.disableBtn = true;
    this.$common.showLoader();

    try {
      const tempClaim: any = JSON.parse(JSON.stringify(this.claims));

      tempClaim.yatPermDutyAdvDTOs = Array.isArray(tempClaim.yatPermDutyAdvDTOs)
        ? tempClaim.yatPermDutyAdvDTOs
        : [tempClaim.yatPermDutyAdvDTOs];

      if (Array.isArray(tempClaim.yatDtsDetailDTOs)) {
        tempClaim.yatDtsDetailDTOs.forEach((elem: any) => {
          elem.amount =
            this.normalizeAmountValue(elem.tempAmount, null) ??
            this.normalizeAmountValue(elem.amount, 0);
          delete elem.tempAmount;
        });
      }

      if (status === this.codeClaimState.outbox) {
        tempClaim.claimState = this.codeClaimState.outbox;
      } else {
        tempClaim.claimState = this.codeClaimState.draft;
      }

      if (this.userIdDetails?.roleTypeId)
        tempClaim.roleTypeId = this.userIdDetails.roleTypeId;
      if (!tempClaim.aclUserDTO && this.userIdDetails?.userId)
        tempClaim.aclUserDTO = { userId: this.userIdDetails.userId };
      tempClaim.codeSubFormDTO = {
        ...(tempClaim.codeSubFormDTO || {}),
        subFormId: this.activeSubFormId,
      };
      if (tempClaim.codeUnitDTO?.unit) {
        tempClaim.codeUnitDTO = { unit: tempClaim.codeUnitDTO.unit };
      }
      if (!tempClaim.signWith) tempClaim.signWith = 'ES';
      if (this.supplementaryId) tempClaim.supClaimId = this.supplementaryId;
      if (this.resubClaimId) tempClaim.refAdvanceId = this.resubClaimId;
      tempClaim.yatDocsDTOs = this.mapClaimDocumentsForSave(this.documentDtos);

      tempClaim.ifscnull = !tempClaim.yatClaimBankDetailDTO?.ifscCode;

      if ('occDate' in tempClaim)
        tempClaim.occDate = this.UtilService.toMillis(tempClaim.occDate);
      if ('subDate' in tempClaim)
        tempClaim.subDate = this.UtilService.toMillis(tempClaim.subDate);

      tempClaim.yatPermDutyAdvDTOs.forEach((adv: any) => {
        adv.gxDate = this.UtilService.toMillis(adv.gxDate);
        adv.wefDate = this.UtilService.toMillis(adv.wefDate);
        adv.authDate = this.UtilService.toMillis(adv.authDate);
        adv.date = this.UtilService.toMillis(adv.date);
      });

      const formData = new FormData();
      formData.append('yatClaimDTO', JSON.stringify(tempClaim));

      this.$claimApi.createOrUpdateAdvance(formData, null).subscribe(
        (res: any) => {
          const obj = Array.isArray(res?.object)
            ? res.object[0]
            : res?.object || res?.obj || res;
          if (obj?.claimId) {
            this.claims.claimId = obj.claimId;
            this.claimId = obj.claimId;
          }
          this.mergeSavedPmtResponse(obj);

          if (showToast) {
            const successMsg =
              status === this.codeClaimState.outbox
                ? res?.message || `${this.getFormDisplayName()} submitted successfully.`
                : res?.message || `${this.getFormDisplayName()} draft saved successfully.`;
            this.$common.showMessage(successMsg, 'success');
          }

          const savedClaimId = obj.claimId || obj.id || this.claimId;
          if (status === this.codeClaimState.outbox) {
            this.completeSubmitStatusTransition(savedClaimId);
          } else {
            this.$common.hideLoader();
            this.disableBtn = false;
            this.navigateAfterSave(status, savedClaimId);
          }
          this.checkForPreviewBtn();
        },
        (err: any) => {
          console.error(`Error while saving ${this.getFormDisplayName()}`, err);
          this.$common.showMessage(
            `Error while saving ${this.getFormDisplayName()}.`,
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error(`Error while saving ${this.getFormDisplayName()}`, err);
      this.$common.showMessage(`Error while saving ${this.getFormDisplayName()}.`, 'danger');
      this.$common.hideLoader();
      this.disableBtn = false;
    }
  }

  saveDraft(): void {
    this.saveClaim(this.currentFormCode, this.codeClaimState.draft);
  }

  submitPmt(): void {
    this.showErrors = true;

    const okSections = this.runPmtClientValidationOnly();
    if (!okSections) return;

    const okBusiness = this.validatePmtBusinessFields();
    if (!okBusiness) return;

    if (!this.claims?.gxFormFileUrl) {
      this.$common.showMessage('Please upload Gx Form (PDF).', 'danger');
      return;
    }

    this.saveClaim(this.currentFormCode, this.codeClaimState.outbox);
  }

  /* ===================== VALIDATE ===================== */

  isInvalidRadio(name: string): boolean {
    if (!this.showErrors) return false;

    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return false;

    if (name === 'pmtType') return this.isNullOrEmpty(adv.pmtType);
    if (name === 'familyType') return this.isNullOrEmpty(adv.familyType);

    return false;
  }

  private validateRadioGroup(section: HTMLElement, radioName: string): boolean {
    const radios = Array.from(
      section.querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${radioName}"]`
      )
    );

    if (radios.length === 0) return true;

    const isAnyChecked = radios.some((r) => r.checked);

    const wrapper = section.querySelector<HTMLElement>(
      `[data-radio-wrapper="${radioName}"]`
    );
    if (wrapper) {
      wrapper.style.border = '';
      wrapper.style.borderRadius = '';
      wrapper.style.padding = '';
      if (!isAnyChecked) {
        wrapper.style.border = '1px solid red';
        wrapper.style.borderRadius = '4px';
        wrapper.style.padding = '6px 10px';
      }
    }

    return isAnyChecked;
  }

  validateSection(sectionId: string): boolean {
    const section = document.getElementById(sectionId);
    if (!section) return true;

    return validateLegacyRequiredSection(section);
  }

  clearLegacyInvalid(event: Event): void {
    clearLegacyInvalidFromEvent(event);
  }

  setTab(tab: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6'): void {
    if (this.getTabOrder().includes(tab)) {
      this.activeTab = tab;
    }
  }

  private activateTab(sectionId: string): void {
    this.setTab(sectionId as 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6');
  }

  validatePmt(type?: string): void {
    if (type && type !== this.codeClaim.pmtAdv && type !== this.codeClaim.resettleClm) return;

    try {
      const okSections = this.runPmtClientValidationOnly();
      if (!okSections) return;

      const okBusiness = this.validatePmtBusinessFields(false);
      if (!okBusiness) return;

      this.$common.showMessage(
        'Validation successful. Please submit the form to proceed.',
        'success'
      );
    } catch (err) {
      console.error('Error during PMT validation', err);
    }
  }

  private runPmtClientValidationOnly(): boolean {
    const sectionIds = ['ship', 'ship2', 'ship3', 'ship4'];
    let firstInvalid: string | null = null;
    let allValid = true;

    for (const id of sectionIds) {
      const ok = this.validateSection(id);
      if (!ok) {
        allValid = false;
        if (!firstInvalid) firstInvalid = id;
      }
    }

    if (!allValid) {
      if (firstInvalid) this.activateTab(firstInvalid);
      this.$common.showMessage('Please fill required fields.', 'danger');
      return false;
    }

    return true;
  }

  private validatePmtBusinessFields(showSuccessMessage = false): boolean {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) {
      this.$common.showMessage('PMT details are missing.', 'danger');
      this.activateTab('ship');
      return false;
    }

    if (!this.claims?.codeUnitDTO?.unit) {
      this.$common.showMessage('Please select the applied to unit.', 'danger');
      this.activateTab('ship');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxUnit)) {
      this.$common.showMessage('Please select Gx Unit.', 'danger');
      this.activateTab('ship');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxNumber)) {
      this.$common.showMessage('Please fill Gx Number.', 'danger');
      this.activateTab('ship');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxDate)) {
      this.$common.showMessage('Please select Gx Date.', 'danger');
      this.activateTab('ship');
      return false;
    }

    if (!this.claims?.gxFormFileUrl) {
      this.showErrors = true;
      this.$common.showMessage('Please upload Gx Form (PDF).', 'danger');
      this.activateTab('ship');
      return false;
    }

    if (this.isNullOrEmpty(adv.stnFrom) || this.isNullOrEmpty(adv.stnTo)) {
      this.$common.showMessage(
        'Please fill both Station From and Station To.',
        'danger'
      );
      this.activateTab('ship');
      return false;
    }

    if ((adv.isDts || '').trim() === 'No' && this.isNullOrEmpty(adv.reasonDts)) {
      this.$common.showMessage(
        'Please fill the reason for not taking DTS.',
        'danger'
      );
      this.activateTab('ship');
      return false;
    }

    if (
      !this.isEmpty(adv.transPerEffectKg) &&
      this.toNumber(adv.maxTransEffectKg) > 0 &&
      this.toNumber(adv.transPerEffectKg) > this.toNumber(adv.maxTransEffectKg)
    ) {
      this.$common.showMessage(
        `Transportation of personal effects weight cannot exceed ${adv.maxTransEffectKg} Kg.`,
        'danger'
      );
      this.activateTab('ship2');
      return false;
    }

    if (
      !this.isEmpty(adv.transPerEffectShipKg) &&
      this.toNumber(adv.maxTransEffectShipKg) > 0 &&
      this.toNumber(adv.transPerEffectShipKg) > this.toNumber(adv.maxTransEffectShipKg)
    ) {
      this.$common.showMessage(
        `Ship transportation weight cannot exceed ${adv.maxTransEffectShipKg} Kg.`,
        'danger'
      );
      this.activateTab('ship2');
      return false;
    }

    const hasLandRate = !this.isEmpty(adv.transPerEffectKgRs);
    const hasLandKm = !this.isEmpty(adv.transPerEffectKms);
    if (hasLandRate !== hasLandKm) {
      this.$common.showMessage(
        'Please fill both rate and kilometers for land transportation of personal effects.',
        'danger'
      );
      this.activateTab('ship2');
      return false;
    }

    const hasShipRate = !this.isEmpty(adv.transPerEffectShipKgRs);
    const hasShipKm = !this.isEmpty(adv.transPerEffectShipKms);
    if (hasShipRate !== hasShipKm) {
      this.$common.showMessage(
        'Please fill both rate and kilometers for ship transportation of personal effects.',
        'danger'
      );
      this.activateTab('ship2');
      return false;
    }

    if (!Array.isArray(this.claims.yatDtsDetailDTOs) || this.claims.yatDtsDetailDTOs.length === 0) {
      this.$common.showMessage('Please add at least one travel detail row.', 'danger');
      this.activateTab('ship4');
      return false;
    }

    const invalidTravelRow = (this.claims.yatDtsDetailDTOs || []).find((row: any) => {
      if ((row?.modeOfTravel || '').trim() === 'Others') {
        return this.isNullOrEmpty(row?.otherModeOfTravel);
      }
      if ((row?.isDts || '').trim() === 'No') {
        return this.isNullOrEmpty(row?.reasonForNoDts);
      }
      return false;
    });
    if (invalidTravelRow) {
      const message = (invalidTravelRow?.modeOfTravel || '').trim() === 'Others'
        ? 'Please fill Other Mode of Travel for all travel detail rows.'
        : 'Please fill Reason for not using DTS for all non-DTS travel detail rows.';
      this.$common.showMessage(message, 'danger');
      this.activateTab('ship4');
      return false;
    }

    if (showSuccessMessage) {
      this.$common.showMessage(
        'Validation successful. Please submit the form to proceed.',
        'success'
      );
    }

    return true;
  }

  navigatePreview(type: string, id: string): void {
    const route = this.getPreviewRoute();
    const previewId = id || this.claims.claimId || this.claimIdParam;
    if (!route || !previewId) return;

    const queryParams = this.activeFormKind === 'claim'
      ? {
          id: previewId,
          subFormId: this.activeSubFormId,
          ...(this.supplementaryId ? { supId: this.supplementaryId } : {}),
        }
      : {
          id: previewId,
          ...(this.supplementaryId ? { supId: this.supplementaryId } : {}),
        };

    const queryString = Object.entries(queryParams)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&');
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
    const previewUrl = `${String(moduleUrl || '').replace(/\/$/, '')}/${route}${queryString ? `?${queryString}` : ''}`;
    window.open(previewUrl, '_blank');
  }

  get isResettlementClaimMode(): boolean {
    return this.isResettlementMode();
  }

  openLinkedPreview(route: string, linkedClaimId?: any): void {
    const claimId = linkedClaimId || this.claims.claimId || this.claimIdParam;
    if (!route || !claimId) {
      this.$common.showMessage('Linked form is not available.', 'warning');
      return;
    }

    this.router.navigate([`../${route}`], {
      queryParams: {
        id: claimId,
        subFormId: this.activeSubFormId,
      },
    });
  }

  private navigateAfterSave(
    status: string,
    savedClaimId?: string | null
  ): void {
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
    if (!moduleUrl) return;

    if (status === this.codeClaimState.outbox) {
      this.router.navigateByUrl(
        moduleUrl + (this.activeFormKind === 'claim' ? `/claim-new` : `/new`)
      );
      return;
    }

    if (this.supplementaryId && savedClaimId) {
      this.router.navigate([moduleUrl + `/${this.getCurrentFormRoute()}`], {
        queryParams: {
          id: savedClaimId,
          supId: this.supplementaryId,
        },
      });
      return;
    }

    this.router.navigateByUrl(moduleUrl + `/draft`);
  }

  checkEsignAvailability(): void {
    if (this.claims?.signWith !== this.codeSignType.eSign) {
      return;
    }

    const config = {
      headers: {
        userId: this.userIdDetails?.userId || '',
        gxUnitId: String(this.gxUnitId || this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || ''),
      },
    };

    this.$esignApi.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status === false) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message || 'eSign is not available for this PMT claim.',
            'danger'
          );
        }
      },
      error: () => {
        this.claims.signWith = this.codeSignType.inkSign;
        this.$common.showMessage('Unable to verify eSign availability.', 'danger');
      },
    });
  }
  checkValidSignType(signWith: string | null, appliedTo: string | null): void {}

  goToTab(tabId: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6'): void {
    this.setTab(tabId);
  }

  private getTabOrder(): Array<'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6'> {
    return this.activeFormKind === 'claim'
      ? ['ship', 'ship2', 'ship3', 'ship4', 'ship5', 'ship6']
      : ['ship', 'ship2', 'ship3', 'ship4', 'ship5'];
  }

  openTab(tabId: string): void {
    this.setTab(tabId as 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6');
  }

  nextTabActive(): void {
    const tabOrder = this.getTabOrder();
    const idx = tabOrder.indexOf(this.activeTab);
    if (idx >= 0 && idx < tabOrder.length - 1) {
      this.activeTab = tabOrder[idx + 1];
    }
  }

  previousTabActive(): void {
    const tabOrder = this.getTabOrder();
    const idx = tabOrder.indexOf(this.activeTab);
    if (idx > 0) {
      this.activeTab = tabOrder[idx - 1];
    }
  }

  isSelfRow(f: any): boolean {
    const rel = (f?.relation || '').toLowerCase();
    return rel === 'self';
  }

  onFamilyTypeChange(): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    if (adv.familyType === 'S') {
      (this.claims.yatFamilyDetailDTOs || []).forEach((m) => {
        if (!this.isSelfMember(m)) m.checkedIndicator = false;
      });
    }
  }

  getFamilyRows(): YatFamilyDetailDTO[] {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    const list = this.claims?.yatFamilyDetailDTOs || [];

    if (!adv?.familyType || adv.familyType === 'SF') return list;
    return list.filter((m) => this.isSelfMember(m));
  }

  private isSelfMember(m: YatFamilyDetailDTO): boolean {
    const rel = (m?.relation || '').trim().toLowerCase();
    const fid = (m?.familyId || '').trim().toUpperCase();
    return rel === 'self' || fid === '00BV';
  }

  onFamilyMemberToggle(): void {
    this.recalculateArrPersons();
  }

  private recalculateArrPersons(): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    const list = this.claims?.yatFamilyDetailDTOs || [];
    const selected = list.filter((m) => !!m.checkedIndicator);

    adv.arrPerson = String(selected.length || 0);

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  getCodeYatAdvPayLevel(config?: any) {
    return this.http.get<any>(`payLevel/getAll`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  $(selector: string): any {
    return (window as any)?.$ ? (window as any).$(selector) : null;
  }

  private pickFirst(obj: any, keys: string[]): any {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '')
        return obj[k];
    }
    return null;
  }

  updateEntitlement(subFormId?: string): void {
    if (subFormId && subFormId !== this.codeClaim.pmtAdv && subFormId !== this.codeClaim.resettleClm) return;

    const adv = this.adv;
    if (!adv) return;

    const fromDto = this.toNumber(adv.entitledAmount);

    const payLevelId = (adv.payLevel || '').toString().trim();
    if (!payLevelId) {
      this.entitledAmount = fromDto;
      this.refreshEntitledUi();
      return;
    }

    if (!Array.isArray(this.payLevels) || this.payLevels.length === 0) return;

    const p = this.payLevels.find((x) => String(x.id) === String(payLevelId));
    const fromApi = this.toNumber(p?.entitled ?? p?.entitledKg ?? 0);

    this.entitledAmount = fromApi > 0 ? fromApi : fromDto;

    this.refreshEntitledUi();
  }

  private resolveSubFormId(rawSubFormId: any): string {
    const id = String(rawSubFormId || '').toUpperCase();
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return this.codeClaim.resettleClm;
    if (id === 'PMT' || id === 'PMTCLM') return this.activeFormKind === 'claim' ? 'PMT' : this.codeClaim.pmtAdv;
    if (id === 'PMTA' || id === 'P') return this.codeClaim.pmtAdv;
    return this.codeClaim.pmtAdv;
  }

  private resolveFormKind(rawFormKind: any): 'advance' | 'claim' {
    return String(rawFormKind || '').toLowerCase() === 'claim' ? 'claim' : 'advance';
  }

  private isResettlementMode(): boolean {
    return this.activeSubFormId === this.codeClaim.resettleClm;
  }

  get pageTitle(): string {
    if (this.isResettlementMode()) {
      return `${this.supplementaryId ? 'Supplementary ' : ''}Resettlement Claim`;
    }
    if (this.activeFormKind === 'claim') {
      return `${this.supplementaryId ? 'Supplementary ' : ''}Permanent Duty Claim`;
    }
    return 'REQUISITION FOR PMT DUTY ADVANCE';
  }

  get currentFormCode(): string {
    return this.activeSubFormId;
  }

  private getCurrentFormRoute(): string {
    if (this.isResettlementMode()) return 'form-resettlement-claim';
    if (this.activeFormKind === 'claim') return 'form-pmt-duty-claim';
    return 'form-pmt-duty';
  }

  private getPreviewRoute(): string {
    if (this.isResettlementMode()) {
      return this.activeFormKind === 'claim' ? 'preview-resettlement-claim' : 'preview-resettlement';
    }
    return this.activeFormKind === 'claim' ? 'preview-pmt-duty-claim' : 'preview-pmt-duty';
  }

  private getFormDisplayName(): string {
    if (this.isResettlementMode()) return 'Resettlement claim';
    return this.activeFormKind === 'claim' ? 'PMT Duty claim' : 'PMT advance';
  }

  loadPayLevels(): void {
    this.$payLevelApi.get().subscribe((res: any) => {
      if (res?.status === true) {
        this.payLevels = res.object || [];
        this.updateEntitlement(this.activeSubFormId);
      }
    });
  }

  private applyPmtDefaultsAfterMerge(): void {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    if (!adv.pmtType) adv.pmtType = 'F';
    if (!adv.familyType) adv.familyType = 'SF';
    if (!adv.areaType) adv.areaType = 'M';
    if (!adv.isAvailComposite) adv.isAvailComposite = 'N';

    this.onFamilyTypeChange();
  }

  get adv(): any {
    return this.claims?.yatPermDutyAdvDTOs?.[0] ?? null;
  }

  toNumber(v: any): number {
    return this.normalizeAmountValue(v, 0) ?? 0;
  }

  private normalizeAmountValue(value: any, emptyValue: number | null = null): number | null {
    const raw = (value ?? '').toString().trim().replace(/,/g, '');
    if (!raw) return emptyValue;

    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : emptyValue;
  }

  enforceKgLimit(mode: 'land' | 'ship'): void {
    const adv = this.adv;
    if (!adv) return;

    const max = this.toNumber(
      mode === 'land' ? adv.maxTransEffectKg : adv.maxTransEffectShipKg
    );

    const val = this.toNumber(
      mode === 'land' ? adv.transPerEffectKg : adv.transPerEffectShipKg
    );

    if (max > 0 && val > max) {
      if (mode === 'land') adv.transPerEffectKg = max;
      else adv.transPerEffectShipKg = max;
    }
  }

  onMaxKgChange() {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return;

    const selected = this.toNumber(adv.maxTransEffectKg);
    const entitled = this.toNumber(this.entitledAmount);

    this.partValueLand = 1;
    this.landInfoTooltip = '';

    if (!selected) {
      this.partValueLand = 1;
      this.landInfoTooltip = '';
      adv.transPerEffectKg = '';
      adv.transPerEffectKmsRs = null;
      this.calculateAmount(this.codeClaim.pmtAdv);
      return;
    }

    if (selected > 0 && entitled > 0) {
      this.partValueLand = selected / entitled;
    }

    const enteredKg = this.toNumber(adv.transPerEffectKg);
    if (enteredKg > selected) {
      adv.transPerEffectKg = String(selected);
    }

    if (selected > 0 && entitled > 0 && selected < entitled) {
      this.landInfoTooltip = `Amount will be calculated on prorata: ${selected}/${entitled}`;
    }

    this.calculateAmount(this.codeClaim.pmtAdv);
  }

  showLandInfoIcon(): boolean {
    const adv = this.claims?.yatPermDutyAdvDTOs?.[0];
    if (!adv) return false;

    const selected = this.toNumber(adv.maxTransEffectKg);
    const entitled = this.toNumber(this.entitledAmount);
    return selected > 0 && entitled > 0 && selected < entitled;
  }

  openIfscModal() {
    this.newIfscCode = this.claims?.yatClaimBankDetailDTO?.ifscCode || '';
    this.showIfscModal = true;
  }

  closeIfscModal() {
    this.showIfscModal = false;
  }

  submitIFSCUpdate(): void {
    if (this.isNullOrEmpty(this.newIfscCode)) {
      this.$common.showMessage('Please enter IFSC code.', 'danger');
      return;
    }

    const bankObj: any = {
      ifscCode: this.newIfscCode.trim(),
      userId:
        this.claims?.aclUserDTO?.userId || this.userIdDetails?.userId || null,
    };

    const config: any = { headers: {} };

    if (this.claimId) {
      config.headers.claimId = this.claimId;
    }

    this.$bankIfscApi.createOrUpdate(bankObj, config).subscribe({
      next: (response: any) => {
        const data: any = this.$common.parseResponse(response);

        if (data && data.status === true) {
          // update local IFSC in the claim
          if (this.claims?.yatClaimBankDetailDTO) {
            this.claims.yatClaimBankDetailDTO.ifscCode =
              data.object?.[0]?.ifscCode || this.newIfscCode;
          }

          const msg = data.message || 'IFSC updated successfully';
          this.$common.showMessage(msg, 'success');
          this.closeIfscModal();
        } else {
          this.$common.showMessage(
            data?.message || 'Failed to update IFSC.',
            'danger'
          );
        }
      },
      error: (err: any) => {
        console.error('Error while updating IFSC:', err);
        this.$common.showMessage('Error while updating IFSC code.', 'danger');
      },
    });
  }

  private mapClaimDocumentsForSave(documents: any[]): any[] {
    return (documents || []).map((doc) => {
      const codeDocInfoDTO = doc?.codeDocInfoDTO || null;
      return {
        ...doc,
        codeDocInfoDTO: codeDocInfoDTO
          ? {
              id: codeDocInfoDTO.id,
              docName: codeDocInfoDTO.docName,
            }
          : null,
        descr: doc?.otherDocName || doc?.descr || null,
      };
    });
  }
}


