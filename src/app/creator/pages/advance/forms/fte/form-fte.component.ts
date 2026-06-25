import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TyDutyPurposeApiService } from 'src/app/service/api/masters/ty-duty-purpose-api.service';
import { UtilService } from 'src/app/service/core/util.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { FormDocumentService } from 'src/app/service/core/form-document.service';
import { FormStateApiService } from 'src/app/service/api/form/form-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { EsignApiService } from 'src/app/service/api/security/esign-api.service';
import { BankIfscApiService } from 'src/app/service/api/code/bank-ifsc-api.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { CommonDialogService } from 'src/app/service/core/common-dialog.service';
import { clearLegacyInvalidFromEvent, validateLegacyRequiredSection } from '../shared/helpers/legacy-form-validation.helper';

declare var $: any;

interface YatForeignTravelDetailDTO {
  id?: string | null;
  amount?: number | string | null;
  descr?: string | null;
  ltcTravelPrimaryKey?: string | null;
  yatClaimDTO?: any;
}

interface YatClaimBankDetailDTO {
  claimBankId?: number | null;
  bankName?: string | null;
  branch?: string | null;
  ifscCode?: string | null;
  accountNo?: string | null;
  micrCode?: string | null;
  bankAccNo?: string | null;
}

/** YatForeignDutyAdvDTO */
interface YatForeignDutyAdvDTO {
  foreignDutyAdvId?: string | null;

  name?: string | null;
  rank?: string | null;
  pno?: string | null;
  payLevel?: string | null;
  basicPay?: number | string | null;

  tempTransTo?: string | null;
  wefDate?: Date | number | null;
  videPresentUnit?: string | null;

  gxNumber?: string | null;
  gxDate?: Date | number | null;

  purpose?: string | null;
  duration?: number | string | null;

  stationProceedingTo?: string | null;

  isDts?: string | null; // Yes/No/NA (as per your backend)
  reasonDts?: string | null; // required when isDts = 'No'

  arrFare?: number | string | null;
  foodChargeDays?: number | string | null;
  hotelAccDays?: number | string | null;
  accHToDutyDays?: number | string | null;

  totalAmt?: number | string | null;
  advAmt?: number | string | null;
  totalBudgetedAmt?: number | string | null;
  dtsAmount?: number | string | null;
  travelDetailsFTEAmt?: number | string | null;
  nonDtsAmount?: number | string | null;

  tempTransferToType?: string | null;
  dutyStation?: string | null;
  otherUnit?: string | null;

  place?: string | null;
  date?: Date | number | null;

  availedCategory?: number | string | null;
  gxUnit?: string | null;

  purposeType?: string | null;
  personName?: string | null;
  relation?: string | null;
  age?: number | string | null;
  gender?: string | null;

  appliedTo?: string | null;
  unitList?: string[] | null;
}

interface ClaimsFteAdv {
  yatDtsDetailDTOs: any[];
  occDate?: Date | null;
  aclUserDTO?: any;
  codeSubFormDTO: any;
  codeUnitDTO: any;

  claimId?: number | null;
  signWith?: string | null;
  claimState?: string | null;

  gxFormFileUrl?: string | null;
  deleteGxFileUrl?: string | null;
  yatDocsDTOs?: any[];
  internalRemarks?: string | null;
  claimAmt: string | null;

  yatForeignDutyAdvDTOs: YatForeignDutyAdvDTO[];

  yatForeignTravelDetailDTOs: YatForeignTravelDetailDTO[];

  yatClaimBankDetailDTO: YatClaimBankDetailDTO;
}

@Component({
  selector: 'app-form-fte',
  templateUrl: './form-fte.component.html',
  styleUrls: ['./form-fte.component.css'],
  standalone: false,
})
export class FormFteComponent implements OnInit {
  activeTab: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' = 'ship';
  private readonly fteTabOrder: Array<'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5'> = [
    'ship',
    'ship2',
    'ship3',
    'ship4',
    'ship5',
  ];
  fteEditTravelIndex: number | null = null;
  fteOtherMode = false;
  fteBoolIsDts = false;
  fteIsDtsDisabled = false;
  fteTravelBtnName = 'Add';
  fteTravelDetailsBtn = false;

  tempFteTravel: any = {
    source: null,
    destination: null,
    modeOfTravel: null,
    otherModeOfTravel: null,
    isDts: null,
    amount: null,
    reasonForNoDts: null,
    remarks: null,
    _reasonError: false,
  };
  tempFteTravelDetails: any;
  editTravelIndex: number | null = null;
  row: any;
  noDtsAmount: 0;
  eSignTempFormObj: any = null;
  private fteTravelPrimaryKeyCounter = 0;

  onFteModeChange() {
    const mode = (this.tempFteTravel.modeOfTravel || '').trim();
    this.fteOtherMode = mode === 'Others';
    this.fteBoolIsDts = mode === 'Air' || mode === 'Train';
    this.fteIsDtsDisabled = !!mode && !this.fteBoolIsDts;

    if (!this.fteOtherMode) this.tempFteTravel.otherModeOfTravel = null;

    if (this.fteIsDtsDisabled) {
      this.tempFteTravel.isDts = 'NA';
      this.tempFteTravel.reasonForNoDts = null;
      this.tempFteTravel._reasonError = false;
    } else if (this.tempFteTravel.isDts === 'NA') {
      this.tempFteTravel.isDts = null;
    }
  }

  onFteIsDtsChange() {
    if (this.tempFteTravel.isDts === 'Yes' || this.tempFteTravel.isDts === 'NA') {
      this.tempFteTravel.reasonForNoDts = null;
      this.tempFteTravel._reasonError = false;
    } else {
      this.validateFteReason();
    }
  }

  validateFteReason() {
    this.tempFteTravel._reasonError =
      this.tempFteTravel.isDts === 'No' &&
      (!this.tempFteTravel.reasonForNoDts ||
        ('' + this.tempFteTravel.reasonForNoDts).trim() === '');
  }

  private ensureForeignTravelList() {
    if (!this.claims.yatForeignTravelDetailDTOs)
      this.claims.yatForeignTravelDetailDTOs = [];
  }

  private validateTempFteTravel(): boolean {
    this.onFteModeChange();
    const t = this.tempFteTravel;

    if (!t.source || !t.destination || !t.modeOfTravel || !t.isDts || !t.amount) {
      this.$common.showMessage('Please fill all mandatory travel details.', 'danger');
      return false;
    }

    if (
      t.modeOfTravel === 'Others' &&
      (!t.otherModeOfTravel || ('' + t.otherModeOfTravel).trim() === '')
    ) {
      this.$common.showMessage('Please fill Other Mode of Travel when mode is Others.', 'danger');
      return false;
    }

    if (t.isDts === 'No') {
      this.validateFteReason();
      if (t._reasonError) {
        this.$common.showMessage('Reason for not using DTS is required when DTS is No.', 'danger');
        return false;
      }
    }
    return true;
  }

  private buildDescr(t: any): string {
    const mode =
      t.modeOfTravel === 'Others'
        ? `Others(${t.otherModeOfTravel || ''})`
        : t.modeOfTravel;

    // keep it consistent; backend stores only descr anyway
    return `From:${t.source}; To:${t.destination}; Mode:${mode}; DTS:${
      t.isDts
    }; Reason:${t.reasonForNoDts || '-'}; Remarks:${t.remarks || '-'}`;
  }

  private ensureDtsList(): void {
    if (!this.claims.yatDtsDetailDTOs) this.claims.yatDtsDetailDTOs = [];
  }

  private nextFteTravelPrimaryKey(): number {
    this.fteTravelPrimaryKeyCounter += 1;
    return this.fteTravelPrimaryKeyCounter;
  }

  private nextForeignTravelId(): string {
    return Math.random().toString(36).substring(7);
  }

  private normalizeFteDtsRows(rows: any[] | null | undefined): any[] {
    return (rows || []).map((row: any) => ({
      ...row,
      ltcTravelPrimaryKey: row?.ltcTravelPrimaryKey ?? this.nextFteTravelPrimaryKey(),
      amount: this.normalizeAmountValue(row?.amount, null),
      tempAmount:
        this.normalizeAmountValue(row?.tempAmount, null) ??
        this.normalizeAmountValue(row?.amount, null),
      _reasonError: false,
    }));
  }

  private normalizeForeignTravelRows(rows: any[] | null | undefined): any[] {
    return (rows || []).map((row: any) => ({
      ...row,
      id: row?.id ?? this.nextForeignTravelId(),
      ltcTravelPrimaryKey: row?.ltcTravelPrimaryKey ?? this.nextForeignTravelId(),
      amount: this.normalizeAmountValue(row?.amount, null),
    }));
  }

  addFteTravelDetails(): void {
    this.ensureDtsList();
    if (!this.validateTempFteTravel()) return;

    const t = this.tempFteTravel;

    const row: any = {
      ltcTravelPrimaryKey: t.ltcTravelPrimaryKey || this.nextFteTravelPrimaryKey(),
      dtsDetailId: t.dtsDetailId ?? null,
      source: (t.source || '').trim(),
      destination: (t.destination || '').trim(),
      modeOfTravel: t.modeOfTravel,
      otherModeOfTravel:
        t.modeOfTravel === 'Others' ? (t.otherModeOfTravel || '').trim() : null,
      isDts: t.isDts,
      reasonForNoDts: t.isDts === 'No' ? (t.reasonForNoDts || '').trim() : null,
      remarks: (t.remarks || '').trim(),
      amount: (t.amount ?? '').toString().trim(),
      // ✅ keep amount editable like TY duty
      tempAmount: (t.amount ?? '').toString().trim(),
    };

    if (this.fteEditTravelIndex !== null) {
      this.claims.yatDtsDetailDTOs[this.fteEditTravelIndex] = row;
      this.fteEditTravelIndex = null;
      this.fteTravelBtnName = 'Add';
    } else {
      this.claims.yatDtsDetailDTOs.push(row);
    }

    this.resetTempFteTravelDetails();
    this.recalcFteTotals();
  }

  resetTempFteTravel() {
    this.resetTempFteTravelDetails();
  }

  editFteTravelDetails(i: number): void {
    const row: any = this.claims?.yatDtsDetailDTOs?.[i];
    if (!row) return;

    this.fteEditTravelIndex = i;
    this.fteTravelBtnName = 'Update';

    this.tempFteTravel = {
      source: row.source ?? null,
      dtsDetailId: row.dtsDetailId ?? null,
      destination: row.destination ?? null,
      modeOfTravel: row.modeOfTravel ?? null,
      otherModeOfTravel: row.otherModeOfTravel ?? null,
      isDts: row.isDts ?? null,
      amount: row.tempAmount ?? row.amount ?? null,
      reasonForNoDts: row.reasonForNoDts ?? null,
      remarks: row.remarks ?? null,
      ltcTravelPrimaryKey: row.ltcTravelPrimaryKey ?? null,
      _reasonError: false,
    };

    this.onFteModeChange();
  }

  deleteFteTravelDetails(i: number): void {
    if (!this.claims?.yatDtsDetailDTOs?.length) return;

    this.claims.yatDtsDetailDTOs.splice(i, 1);

    if (this.fteEditTravelIndex === i) this.resetTempFteTravelDetails();
    if (this.fteEditTravelIndex !== null && this.fteEditTravelIndex > i) {
      this.fteEditTravelIndex -= 1;
    }
    this.recalcFteTotals();
  }

  resetTempFteTravelDetails() {
    this.fteEditTravelIndex = null;
    this.fteTravelBtnName = 'Add';
    this.tempFteTravel = {
      source: null,
      dtsDetailId: null,
      destination: null,
      modeOfTravel: null,
      otherModeOfTravel: null,
      isDts: null,
      amount: null,
      reasonForNoDts: null,
      remarks: null,
      ltcTravelPrimaryKey: null,
      _reasonError: false,
    };
    this.fteOtherMode = false;
    this.fteBoolIsDts = false;
    this.fteIsDtsDisabled = false;
  }

  activatedRoute: ActivatedRoute;

  isIfscNull: boolean = false;
  gxFormModel: any;
  purposeTypes: any[] = [];
  // fteOtherMode: any;
  // tempFteTravel: any;
  // fteTravelDetailsBtn: any;
  // fteTravelBtnName: any;

  private normalizeFtePurposeTypes(list: any[]): any[] {
    return (list || []).filter(
      (item: any) => item?.descr !== this.purposeType.investive
    );
  }

  getPurposeTypes(): void {
    this.$common.showLoader();

    const config = { headers: { subFormId: 'F' } };

    this.$tyDutyPurposeApi.getAll(config).subscribe({
      next: (res: any) => {
        this.$common.hideLoader();
        if (res?.status !== true) {
          this.$common.showMessage(
            res?.message || 'Unable to load purpose types.',
            'danger'
          );
          this.purposeTypes = [];
          return;
        }

        this.purposeTypes = this.normalizeFtePurposeTypes(
          Array.isArray(res.object) ? res.object : []
        );
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.purposeTypes = [];
        this.$common.showMessage(
          'Error while loading purpose types.',
          'danger'
        );
      },
    });
  }

  loadFtePurposeTypes(): void {
    const config = {
      headers: {
        subFormId: this.codeClaim?.fteAdv || 'F', // ✅ MUST be F for FTE Adv
      },
    };

    this.$tyDutyPurposeApi.getAll(config).subscribe({
      next: (res: any) => {
        this.purposeTypes = this.normalizeFtePurposeTypes(
          Array.isArray(res?.object) ? res.object : []
        );
      },
      error: (e) => {
        console.error('Purpose types error', e);
        this.purposeTypes = [];
      },
    });
  }

  navigatePreview(route: string, id: any): void {
    const previewRoute = route || 'preview-fte-advance';
    const previewId = id || this.claims?.claimId || this.claimIdParam;
    if (!previewRoute || !previewId) return;

    const queryParams = {
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
    const moduleUrl = this.getModuleUrl();
    const previewUrl = `${moduleUrl}/${previewRoute}${queryString ? `?${queryString}` : ''}`;
    this.previewWindow.openUrl(previewUrl);
  }

  private getModuleUrl(): string {
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
    return String(moduleUrl || '').replace(/\/$/, '');
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
      moduleId:
        this.userIdDetails?.moduleId ||
        (this.$auth.getRuntimeModuleId ? this.$auth.getRuntimeModuleId() : undefined),
    };
  }

  private completeLegacyStatusTransition(status: string, claimId: string): void {
    if (!claimId) {
      this.$common.showMessage('Unable to update FTE Advance status.', 'danger');
      this.$common.hideLoader();
      this.disableBtn = false;
      return;
    }

    const payload = this.buildClaimRemarkPayload(status, claimId);
    const isESignSubmit =
      status === this.codeClaimState.outbox &&
      this.claims?.signWith === this.codeSignType.eSign;
    if (isESignSubmit) {
      this.eSignTempFormObj = {
        ...payload,
        id: claimId,
        claimId,
      };
      this.$common.hideLoader();
      this.disableBtn = false;
      return;
    }

    this.$claimStateApi.changeStatusById(payload).subscribe(
      (res: any) => {
        if (res?.status === false) {
          this.$common.showMessage(
            res?.message || 'Unable to update FTE Advance status.',
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
          return;
        }

        this.$claimStateApi.notifyStatusCountRefresh();
        if (status === this.codeClaimState.outbox) {
          const moduleUrl = this.getModuleUrl();
          if (moduleUrl) {
            this.router.navigateByUrl(moduleUrl + '/new');
          }
        }

        this.$common.hideLoader();
        this.disableBtn = false;
      },
      (err: any) => {
        console.error('Error while updating FTE Advance status', err);
        this.$common.showMessage(
          'Error while updating FTE Advance status.',
          'danger'
        );
        this.$common.hideLoader();
        this.disableBtn = false;
      }
    );
  }

  checkValidSignType(
    _signWith: string | null,
    _appliedTo: string | null
  ): void {
    // keep blank or implement your rules later
  }

  checkEsignAvailability(): void {
    if (this.claims?.signWith !== this.codeSignType.eSign) {
      return;
    }

    const config = {
      headers: {
        userId: this.userIdDetails?.userId || '',
        gxUnitId: String(this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || ''),
      },
    };

    this.$esignApi.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status === false) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message || 'eSign is not available for this FTE Advance.',
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

  /* ==== SUBFORM IDS (FROM YOUR ROOTSCOPE) ==== */
  codeClaim = {
    fteAdv: 'F',
    fteClm: 'FTE',
  } as const;

  codeClaimState = {
    draft: 'DR',
    outbox: 'OB',
  } as const;

  codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
  } as const;

  /* ==== ROUTE PARAMS ==== */
  claimIdParam: string | null = null;
  resubClaimId: string | null = null;
  supplementaryId: string | null = null;

  /* ==== COMMON STATE ==== */
  config: any;
  userIdDetails: any;
  today: any;
  codeStatus: any;

  allUnits: any[] = [];

  disableBtn = false;
  isPreviewDisabled = true;
  showGxFileBrowse = true;

  showErrors = false;

  // IFSC modal
  showIfscModal = false;
  newIfscCode: string = '';

  // Travel add/edit state
  // Claim model
  claims: ClaimsFteAdv = this.createEmptyClaims();
  //isIfscNull: any;
  activeSubFormId: string = this.codeClaim.fteAdv;

  get pageTitle(): string {
    return 'REQUISITION FOR FTE ADVANCE';
  }

  get currentFormCode(): string {
    return this.activeSubFormId;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private previewWindow: PreviewWindowService,
    private UtilService: UtilService,
    private datePipe: DatePipe,
    public $auth: AuthService,
    public $form: FormApiService,
    public $formState: FormStateApiService,
    private $formDocument: FormDocumentService,
    private $tyDutyPurposeApi: TyDutyPurposeApiService,
    private $common: CommonService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $esignApi: EsignApiService,
    private $bankIfscApi: BankIfscApiService,
    private $codeUnitApi: CodeUnitApiService,
    private $dialog: CommonDialogService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.codeStatus = this.$auth?.codeStatus();

    this.initFromRoute();
    this.getUnits();
    this.loadFtePurposeTypes();

    this.route.queryParams.subscribe(() => {
      this.getFormDetails();
    });
  }

  private initFromRoute(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.activeSubFormId = this.codeClaim.fteAdv;
    this.claims.codeSubFormDTO = { subFormId: this.activeSubFormId };
    this.claimIdParam = qp.get('id') || qp.get('resubId');
    this.resubClaimId = qp.get('resubId');
    this.supplementaryId = qp.get('supId');
  }

  private createEmptyClaims(): ClaimsFteAdv {
    return {
      signWith: this.codeSignType.eSign,
      codeSubFormDTO: { subFormId: 'F' } as any,
      codeUnitDTO: { unit: '', descr: '' } as any,

      yatForeignDutyAdvDTOs: [this.createEmptyFteAdv()],

      // ✅ MUST BE PRESENT (Travel Tab)
      yatDtsDetailDTOs: [],

      // ✅ Financial Terms Tab
      yatForeignTravelDetailDTOs: [],
      yatDocsDTOs: [],

      yatClaimBankDetailDTO: {
        claimBankId: null,
        bankName: null,
        branch: null,
        ifscCode: null,
        accountNo: null,
        micrCode: null,
        bankAccNo: null,
      },

      internalRemarks: null,
      claimAmt: null,
    };
  }

  private createEmptyFteAdv(): YatForeignDutyAdvDTO {
    return {
      foreignDutyAdvId: null,
      pno: null,
      name: null,
      rank: null,
      payLevel: null,
      basicPay: null,

      tempTransTo: null,
      wefDate: null,
      videPresentUnit: null,

      gxNumber: null,
      gxDate: null,

      purposeType: null,
      purpose: null,
      personName: null,
      relation: null,
      age: null,
      gender: null,

      duration: null,
      stationProceedingTo: null,

      isDts: 'Yes',
      reasonDts: null,

      arrFare: null,

      totalAmt: 0,
      advAmt: 0,
      dtsAmount: 0,
      totalBudgetedAmt: 0,

      tempTransferToType: null,
      dutyStation: null,
      otherUnit: null,

      place: null,
      date: null,

      availedCategory: null,
      gxUnit: null,

      appliedTo: null,
      unitList: [],
    };
  }

  /* ======================
   *  UTILS
   * ====================== */
  public isNullOrEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  /* ======================
   *  LOAD FTE ADV CLAIM
   * ====================== */
  getFormDetails(): void {
    try {
      this.$common.showLoader();

      const headers: any = {
        isPreview: 'false',
        gxUnitId: String(this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || ''),
        userId: this.userIdDetails?.userId ?? '',
        subFormId: this.activeSubFormId,
        isFetch: 'true',
        claimId: '',
      };

      if (this.claimIdParam) headers.claimId = this.claimIdParam;
      if (this.supplementaryId) headers.supCLaimId = this.supplementaryId;

      const config = { headers };

      this.$claimApi.getSingleClaim(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.$common.showMessage(
              response?.message || 'Unable to load FTE Advance details.',
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

          const adv = this.claims.yatForeignDutyAdvDTOs[0];

          const dto =
            Array.isArray(obj.yatForeignDutyAdvDTOs) &&
            obj.yatForeignDutyAdvDTOs.length > 0
              ? obj.yatForeignDutyAdvDTOs[0]
              : null;

          if (dto) {
            // ---------- PERSONAL ----------
            adv.pno = dto.pno ?? obj.pno ?? adv.pno ?? null;
            adv.name =
              (dto.name ?? obj.name ?? adv.name ?? '').toString().trim() ||
              null;
            adv.rank = dto.rank ?? obj.rank ?? adv.rank ?? null;
            adv.payLevel = dto.payLevel ?? obj.payLevel ?? adv.payLevel ?? null;
            adv.basicPay = dto.basicPay ?? obj.basicPay ?? adv.basicPay ?? null;

            // ---------- UNIT / TRANSFER ----------
            adv.tempTransTo = dto.tempTransTo ?? adv.tempTransTo ?? null;
            adv.videPresentUnit =
              dto.videPresentUnit ?? adv.videPresentUnit ?? null;
            adv.stationProceedingTo = dto.stationProceedingTo ?? null;

            adv.tempTransferToType = dto.tempTransferToType ?? null;
            adv.dutyStation = dto.dutyStation ?? null;
            adv.otherUnit = dto.otherUnit ?? null;

            adv.appliedTo = dto.appliedTo ?? null;
            adv.unitList = Array.isArray(dto.unitList) ? dto.unitList : [];

            // ---------- GX ----------
            adv.gxNumber = dto.gxNumber ?? null;
            adv.gxUnit = dto.gxUnit ?? null;

            // ---------- PURPOSE / GUEST ----------
            adv.purposeType = dto.purposeType ?? null;
            adv.purpose = dto.purpose ?? null;
            adv.personName = dto.personName ?? null;
            adv.relation = dto.relation ?? null;
            adv.age = dto.age ?? null;
            adv.gender = dto.gender ?? null;
            adv.place = dto.place ?? null;

            // ---------- DATES ----------
            adv.wefDate = dto.wefDate ?? null;
            adv.gxDate = dto.gxDate ?? null;
            adv.date = dto.date ?? null;

            // ---------- DTS ----------
            adv.isDts = dto.isDts ?? adv.isDts ?? 'Yes';
            adv.reasonDts = dto.reasonDts ?? null;

            // ---------- AMOUNTS ----------
            adv.arrFare = dto.arrFare ?? null;
            adv.totalAmt = dto.totalAmt ?? 0;
            adv.advAmt = dto.advAmt ?? 0;
            adv.dtsAmount = dto.dtsAmount ?? 0;
            adv.totalBudgetedAmt = dto.totalBudgetedAmt ?? 0;

            // ---------- TRAVEL DETAILS LIST ----------
            const travelList = this.normalizeForeignTravelRows(
              Array.isArray(obj.yatForeignTravelDetailDTOs)
                ? obj.yatForeignTravelDetailDTOs
                : []
            );
            this.claims.yatForeignTravelDetailDTOs = travelList;

            // ---------- BANK ----------
            const bank = obj.yatClaimBankDetailDTO || {};
            const normalizedBankDetail = {
              ...this.claims.yatClaimBankDetailDTO,
              bankName:
                bank.bankName ?? this.claims.yatClaimBankDetailDTO.bankName,
              branch: bank.branch ?? this.claims.yatClaimBankDetailDTO.branch,
              ifscCode:
                bank.ifscCode ?? this.claims.yatClaimBankDetailDTO.ifscCode,
              accountNo:
                bank.bankAccNo ??
                bank.accountNo ??
                this.claims.yatClaimBankDetailDTO.accountNo,
              micrCode:
                bank.micrCode ?? this.claims.yatClaimBankDetailDTO.micrCode,
              bankAccNo:
                bank.bankAccNo ??
                bank.accountNo ??
                this.claims.yatClaimBankDetailDTO.bankAccNo ??
                this.claims.yatClaimBankDetailDTO.accountNo,
            };
            this.claims.yatClaimBankDetailDTO = normalizedBankDetail;

            // merge claim root (keeps your component structure stable)
            this.claims = {
              ...this.claims,
              ...obj,
              yatForeignDutyAdvDTOs: [{ ...adv }],
              yatForeignTravelDetailDTOs: travelList,
              yatDtsDetailDTOs: this.normalizeFteDtsRows(
                obj.yatDtsDetailDTOs || this.claims.yatDtsDetailDTOs
              ),
              yatDocsDTOs: obj.yatDocsDTOs || [],
              yatClaimBankDetailDTO: normalizedBankDetail,
            };
            if (this.resubClaimId) {
              (this.claims as any).refAdvanceId = this.resubClaimId;
            }

            this.claims.signWith =
              obj.signWith || this.claims.signWith || this.codeSignType.eSign;
            this.showGxFileBrowse = !this.claims?.gxFormFileUrl;
          } else if (obj.userBasicDetailDTO) {
            const user = obj.userBasicDetailDTO;
            adv.pno = user.pno ?? user.persNo ?? null;
            adv.name = user.name ?? user.userName ?? null;
            adv.rank = user.rank ?? user.rankName ?? null;
            adv.videPresentUnit = user.unitName ?? user.unit ?? null;
            adv.payLevel = user.payLevel ?? null;
            adv.basicPay = user.basicPay ?? user.basPay ?? null;
          }

          this.checkForPreviewBtn();
          this.calculateAmount(this.codeClaim.fteAdv);
        },
        (error: any) => {
          this.$common.hideLoader();
          console.error('Error while loading FTE Advance details.', error);
          this.$common.showMessage(
            'Error while loading FTE Advance details.',
            'danger'
          );
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      console.error('Exception in getFormDetails()', e);
      this.$common.showMessage(
        'Error while loading FTE Advance details.',
        'danger'
      );
    }
  }

  checkForPreviewBtn(): void {
    this.isPreviewDisabled = !this.claims.claimId;
  }

  /* ======================
   *  AMOUNT CALC (FTE ADV)
   * ====================== */
  calculateAmount(type: string): void {
    if (type !== this.codeClaim.fteAdv) return;
    this.recalcFteTotals();
  }

  /* ======================
   *  DTS VALIDATION (ADV LEVEL)
   * ====================== */
  validateDtsFields(): boolean {
    const adv = this.claims.yatForeignDutyAdvDTOs[0];
    if (!adv) return true;

    if (adv.isDts === 'No') {
      const reason = (adv.reasonDts || '').toString().trim();
      if (!reason) {
        this.$common.showMessage(
          'Reason for not using DTS is required.',
          'danger'
        );
        return false;
      }
    }
    return true;
  }

  /* ======================
   *  FORM VALIDATE
   * ====================== */
  validate(type: string, status: string): void {
    if (type !== this.codeClaim.fteAdv && type !== this.activeSubFormId) return;

    try {
      const ok = this.runClientValidationOnly();
      if (!ok) return;

      this.$common.showMessage(
        'Validation successful. Please submit the form to proceed.',
        'success'
      );
    } catch (err) {
      console.error('Error during validation', err);
    }
  }

  private validateSection(sectionId: string): boolean {
    const section = document.getElementById(sectionId);
    if (!section) return true;

    return validateLegacyRequiredSection(section);
  }

  clearLegacyInvalid(event: Event): void {
    clearLegacyInvalidFromEvent(event);
  }

  setTab(tab: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5'): void {
    this.activeTab = tab;
  }

  private activateTab(sectionId: string): void {
    if (this.fteTabOrder.includes(sectionId as any)) {
      this.setTab(sectionId as 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5');
    }
  }

  /* ======================
   *  SAVE CLAIM (FTE ADV)
   * ====================== */
  saveClaim(
    type: string,
    status: string,
    isAlreadyConverted: boolean = false
  ): void {
    if (type !== this.codeClaim.fteAdv) return;

    this.calculateAmount(this.codeClaim.fteAdv);

    this.disableBtn = true;
    this.$common.showLoader();

    try {
      const tempClaim: any = JSON.parse(JSON.stringify(this.claims));

      // enforce array
      if (!Array.isArray(tempClaim.yatForeignDutyAdvDTOs)) {
        tempClaim.yatForeignDutyAdvDTOs = tempClaim.yatForeignDutyAdvDTOs
          ? [tempClaim.yatForeignDutyAdvDTOs]
          : [];
      }

      // claim state
      if (status === this.codeClaimState.outbox)
        tempClaim.claimState = this.codeClaimState.outbox;

      // roleTypeId
      if (this.userIdDetails?.roleTypeId)
        tempClaim.roleTypeId = this.userIdDetails.roleTypeId;

      // aclUserDTO
      if (!tempClaim.aclUserDTO && this.userIdDetails?.userId) {
        tempClaim.aclUserDTO = { userId: this.userIdDetails.userId };
      }

      tempClaim.codeSubFormDTO = {
        ...(tempClaim.codeSubFormDTO || {}),
        subFormId: this.activeSubFormId,
      };

      // unit
      if (tempClaim.codeUnitDTO && this.claims?.codeUnitDTO?.unit) {
        tempClaim.codeUnitDTO = { unit: this.claims.codeUnitDTO.unit };
      }

      // sign
      if (!tempClaim.signWith) tempClaim.signWith = this.codeSignType.eSign;
      if (this.supplementaryId) tempClaim.supClaimId = this.supplementaryId;
      if (this.resubClaimId) tempClaim.refAdvanceId = this.resubClaimId;
      tempClaim.yatDocsDTOs = [];

      // ifsc flag
      tempClaim.ifscnull = !tempClaim.yatClaimBankDetailDTO?.ifscCode;
      this.normalizeFtePayloadForSave(tempClaim);

      // date conversions for adv DTO
      tempClaim.yatForeignDutyAdvDTOs.forEach((adv: any) => {
        adv.gxDate = this.UtilService.toMillis(adv.gxDate);
        adv.date = this.UtilService.toMillis(adv.date);
        adv.wefDate = this.UtilService.toMillis(adv.wefDate);
      });

      // claim-level date conversions if present in your object
      tempClaim.occDate = this.UtilService.toMillis(tempClaim.occDate);
      tempClaim.subDate = this.UtilService.toMillis(tempClaim.subDate);
      tempClaim.reportingDate = this.UtilService.toMillis(
        tempClaim.reportingDate
      );
      tempClaim.voucherDate = this.UtilService.toMillis(tempClaim.voucherDate);
      tempClaim.dob = this.UtilService.toMillis(tempClaim.dob);

      const formData = new FormData();
      formData.append('yatClaimDTO', JSON.stringify(tempClaim));

      this.$claimApi.createOrUpdateAdvance(formData, null).subscribe(
        (res: any) => {
          if (!res || res?.status === false) {
            this.$common.showMessage(
              res?.message || 'Unable to save FTE Advance.',
              'danger'
            );
            this.$common.hideLoader();
            this.disableBtn = false;
            return;
          }

          const obj = Array.isArray(res?.object)
            ? res.object[0]
            : res?.object || res?.obj || res;
          if (!obj) {
            this.$common.hideLoader();
            this.disableBtn = false;
            return;
          }

          const respStatus = status;

          if (obj.id || obj.claimId)
            this.claims.claimId = obj.claimId || obj.id;
          this.mergeSavedFteResponse(obj);
          if (this.resubClaimId) {
            (this.claims as any).refAdvanceId = this.resubClaimId;
          }

          if (respStatus === this.codeClaimState.outbox) {
            this.$common.showMessage(
              res?.message || 'FTE Advance submitted successfully!',
              'success'
            );
          } else if (respStatus === this.codeClaimState.draft) {
            this.$common.showMessage(
              res?.message || 'FTE draft saved successfully.',
              'success'
            );
          }
          this.completeLegacyStatusTransition(
            respStatus,
            obj.claimId || obj.id || this.claims.claimId || this.claimIdParam
          );
          this.checkForPreviewBtn();
        },
        (err: any) => {
          console.error('Error while saving FTE Advance', err);
          this.$common.showMessage(
            'Error while saving FTE Advance.',
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error('Exception while saving FTE Advance', err);
      this.$common.showMessage(
        'Error while saving FTE Advance.',
        'danger'
      );
      this.$common.hideLoader();
      this.disableBtn = false;
    }
  }

  submitFte(): void {
    const ok = this.runClientValidationOnly();
    if (!ok) return;

    this.saveClaim(this.codeClaim.fteAdv, this.codeClaimState.outbox, true);
  }

  private runClientValidationOnly(): boolean {
    const okDts = this.validateDtsFields();
    if (!okDts) return false;

    const sectionIds = ['ship', 'ship2', 'ship3', 'ship4', 'ship5'];
    let firstInvalidSection: string | null = null;
    let allValid = true;

    for (const sectionId of sectionIds) {
      const sectionValid = this.validateSection(sectionId);
      if (!sectionValid) {
        allValid = false;
        if (!firstInvalidSection) firstInvalidSection = sectionId;
      }
    }

    if (!allValid) {
      if (firstInvalidSection) this.activateTab(firstInvalidSection);
      this.$common.showMessage(
        'Please fill required fields.',
        'danger'
      );
      return false;
    }

    const adv = this.claims?.yatForeignDutyAdvDTOs?.[0];
    if (!adv) {
      this.activateTab('ship');
      this.$common.showMessage('FTE details are required.', 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxUnit)) {
      this.activateTab('ship');
      this.$common.showMessage('Please select Gx Unit.', 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxNumber)) {
      this.activateTab('ship');
      this.$common.showMessage('Please fill Gx Number.', 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxDate)) {
      this.activateTab('ship');
      this.$common.showMessage('Please select Gx Date.', 'danger');
      return false;
    }

    if (!this.claims?.gxFormFileUrl) {
      this.showErrors = true;
      this.activateTab('ship');
      this.$common.showMessage('Please upload Gx Form (PDF).', 'danger');
      return false;
    }

    if (!Array.isArray(this.claims.yatDtsDetailDTOs) || this.claims.yatDtsDetailDTOs.length === 0) {
      this.activateTab('ship2');
      this.$common.showMessage('Please add at least one travel detail row.', 'danger');
      return false;
    }

    const invalidTravelRow = (this.claims.yatDtsDetailDTOs || []).find((row: any) => {
      if ((row?.modeOfTravel || '').trim() === 'Others') {
        return !row?.otherModeOfTravel || !String(row.otherModeOfTravel).trim();
      }
      if ((row?.isDts || '').trim() === 'No') {
        return !row?.reasonForNoDts || !String(row.reasonForNoDts).trim();
      }
      return false;
    });
    if (invalidTravelRow) {
      const message = (invalidTravelRow?.modeOfTravel || '').trim() === 'Others'
        ? 'Please fill Other Mode of Travel for all travel detail rows.'
        : 'Reason for not using DTS is required for all non-DTS travel detail rows.';
      this.activateTab('ship2');
      this.$common.showMessage(message, 'danger');
      return false;
    }

    return true;
  }

  validateServerOnly(): void {
    if (!this.runClientValidationOnly()) return;
  }

  /* ======================
   *  IFSC MODAL (same as TY)
   * ====================== */
  openIfscModal(): void {
    this.newIfscCode = this.claims?.yatClaimBankDetailDTO?.ifscCode || '';
    this.showIfscModal = true;
  }

  closeIfscModal(): void {
    this.showIfscModal = false;
  }

  submitIFSCUpdate(): void {
    const ifscCode = (this.newIfscCode || '').trim().toUpperCase();
    if (this.isNullOrEmpty(ifscCode)) {
      this.$common.showMessage('Please enter IFSC code.', 'danger');
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      this.$common.showMessage('Please enter valid IFSC code.', 'danger');
      return;
    }

    const bankObj: any = {
      ifscCode,
      userId:
        this.claims?.aclUserDTO?.userId || this.userIdDetails?.userId || null,
    };

    const config: any = { headers: {} };
    if (this.claims?.claimId) config.headers.claimId = this.claims.claimId;

    this.$common.showLoader();
    this.$bankIfscApi.createOrUpdate(bankObj, config).subscribe({
      next: (response: any) => {
        const data: any = this.$common.parseResponse(response);
        this.$common.hideLoader();
        if (data && data.status === true) {
          if (this.claims?.yatClaimBankDetailDTO) {
            this.claims.yatClaimBankDetailDTO.ifscCode =
              data.object?.[0]?.ifscCode || ifscCode;
          }
          this.$common.showMessage(
            data.message || 'IFSC Code updated successfully.',
            'success'
          );
          this.closeIfscModal();
        } else {
          this.$common.showMessage(
            data?.message || 'Failed to update IFSC code.',
            'danger'
          );
        }
      },
      error: (err: any) => {
        this.$common.hideLoader();
        console.error('Error while updating IFSC:', err);
        this.$common.showMessage('Error while updating IFSC code.', 'danger');
      },
    });
  }

  /* ======================
   *  UNITS
   * ====================== */
  getUnits(): void {
    try {
      this.$common.showLoader();
      const config = { headers: {} };
      this.$codeUnitApi.getAllUnits(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) this.allUnits = response.object || [];
        },
        (err) => {
          this.$common.hideLoader();
          console.error('Error while loading FTE units.', err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.error('Error while loading FTE units.', error);
    }
  }

  /* ======================
   *  NAV
   * ====================== */
  goBack(): void {
    if (window.history.length > 1) this.location.back();
    else window.close();
  }

  nextTabActive(): void {
    const activeIndex = this.fteTabOrder.indexOf(this.activeTab);
    if (activeIndex >= 0 && activeIndex < this.fteTabOrder.length - 1) {
      this.activeTab = this.fteTabOrder[activeIndex + 1];
    }
  }

  previousTabActive(): void {
    const activeIndex = this.fteTabOrder.indexOf(this.activeTab);
    if (activeIndex > 0) {
      this.activeTab = this.fteTabOrder[activeIndex - 1];
    }
  }

  removeEmoji(): void {
    if (this.claims.internalRemarks) {
      this.claims.internalRemarks = this.claims.internalRemarks.replace(
        /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        ''
      );
    }
  }

  // ---- file upload handlers ----
  purposeType = {
    investive: 'Investiture Ceremony',
    other: 'Other',
  } as const;

  clearChangeData(): void {
    const adv = this.claims?.yatForeignDutyAdvDTOs?.[0];
    if (!adv) return;

    adv.purpose = null;
    adv.personName = null;
    adv.relation = null;
    adv.age = null;
    adv.gender = null;
  }

  // --- GX Form Upload (PDF up to 512 KB) ---

  gxFormUploading = false;

  uploadGxForm(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!file) {
      return;
    }

    // 1) Extension / basic validation using your existing helper
    const isValidExtension = this.$common.checkForValidFile(event);
    if (!isValidExtension) {
      this.claims.gxFormFileUrl = null;
      this.showGxFileBrowse = true;
      input.value = '';
      return;
    }

    // 2) HARD SIZE LIMIT: 512 KB
    const maxSizeBytes = 512 * 1024; // 512 KB
    if (file.size > maxSizeBytes) {
      this.$common.showMessage('File size must be 512 KB or less.', 'danger');
      this.claims.gxFormFileUrl = null;
      this.showGxFileBrowse = true;
      input.value = ''; // reset file input
      return;
    }

    this.gxFormUploading = true;

    this.$formDocument.uploadSupportDoc(file).subscribe(
      (res) => {
        this.gxFormUploading = false;
        if (res) {
        this.claims.gxFormFileUrl = res as string;
        this.showGxFileBrowse = false;
      } else {
        this.$common.showMessage('Unable to upload GX Form.', 'danger');
        this.claims.gxFormFileUrl = null;
        this.showGxFileBrowse = true;
        input.value = '';
      }
      },
      (error) => {
        this.gxFormUploading = false;
        this.$common.showMessage('Unable to upload GX Form.', 'danger');
        this.claims.gxFormFileUrl = null;
        this.showGxFileBrowse = true;
        input.value = '';
        console.log(error);
      }
    );
  }

  async deleteGxForm(): Promise<void> {
    if (!this.claims?.gxFormFileUrl) {
      return;
    }

    const ok = await this.$dialog.confirm({
      message: 'Do you really want to delete this GX Form?',
      type: 'delete',
    });
    if (!ok) {
      return;
    }

    this.claims.deleteGxFileUrl = this.claims.gxFormFileUrl;
    this.claims.gxFormFileUrl = null;
    this.gxFormModel = null;
    this.showGxFileBrowse = true;
  }

  validateAge(): void {
    const adv = this.claims.yatForeignDutyAdvDTOs[0];
    if (!adv) return;

    // current value (can be string or number)
    const raw = adv.age as any;

    const ageNum = Number(raw);

    // Allow only numbers 1–120
    if (isNaN(ageNum) || ageNum < 1) {
      adv.age = null; // ← reset to null, NOT ''
      return;
    }

    if (ageNum > 100) {
      adv.age = 100; // cap at 100
    } else {
      adv.age = ageNum; // store as number
    }
  }

  onlyNumberKey(event: KeyboardEvent): void {
    // allow control keys
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // block if not 0–9
    const char = event.key;
    if (char < '0' || char > '9') {
      event.preventDefault();
    }
  }

  validateDuration(): void {
    const adv = this.claims.yatForeignDutyAdvDTOs[0];
    if (!adv) return;

    let val: any = adv.duration;
    val = String(val).replace(/[^0-9]/g, '');
    let num = Number(val);
    if (!num || num < 1) {
      adv.duration = null;
      adv.foodChargeDays = null;
      adv.hotelAccDays = null;
      adv.accHToDutyDays = null;
      return;
    }

    if (num > 180) {
      num = 180;
    }

    adv.duration = num;
    adv.foodChargeDays = num;
    adv.hotelAccDays = num;
    adv.accHToDutyDays = num;
    this.calculateAmount(this.codeClaim.fteAdv);
  }

  allowOnlyAlphabets(event: any): void {
    const adv = this.claims.yatForeignDutyAdvDTOs[0];
    if (!adv) return;

    const value: string = event.target.value;

    // allow only A–Z (case insensitive) and spaces
    const cleaned = value.replace(/[^a-zA-Z ]/g, '');

    event.target.value = cleaned;

    // Update the correct model based on input name
    const field = event.target.getAttribute('name');
    if (field && adv.hasOwnProperty(field)) {
      adv[field] = cleaned;
    }
  }

  allowOnlyTravelAlphabets(event: any, field: 'source' | 'destination'): void {
    const value = String(event?.target?.value || '');
    const cleaned = value.replace(/[^a-zA-Z ]/g, '');

    if (event?.target) {
      event.target.value = cleaned;
    }

    this.tempFteTravel[field] = cleaned;
  }

  foreignTravelBtnName = 'Add';
  foreignTravelBtnDisabled = false;
  private editForeignTravelIndex: number | null = null;

  tempForeignTravelDetail: any = { id: null, descr: null, amount: null };

  addForeignTravelDetail(): void {
    const d = (this.tempForeignTravelDetail?.descr ?? '').toString().trim();
    const rawAmt = (this.tempForeignTravelDetail?.amount ?? '')
      .toString()
      .trim();

    if (!rawAmt) {
      this.$common.showMessage('Amount Field is required', 'danger');
      return;
    }

    if (!d) {
      this.$common.showMessage('Remark Field is required', 'danger');
      return;
    }

    if (!/^\d+$/.test(rawAmt)) {
      this.$common.showMessage('Amount must be a valid number.', 'danger');
      return;
    }

    const amt = Number(rawAmt);
    if (!Number.isFinite(amt) || amt <= 0) {
      this.$common.showMessage('Amount must be greater than 0.', 'danger');
      return;
    }

    if (!this.claims.yatForeignTravelDetailDTOs) {
      this.claims.yatForeignTravelDetailDTOs = [];
    }

    if (this.editForeignTravelIndex !== null) {
      const rowId = this.tempForeignTravelDetail?.id;
      const row =
        this.claims.yatForeignTravelDetailDTOs.find((item: any) => item?.id === rowId) ||
        this.claims.yatForeignTravelDetailDTOs[this.editForeignTravelIndex];
      if (!row) {
        this.resetForeignTravelDetail();
        return;
      }

      row.descr = d;
      row.amount = amt; // store as number

      this.editForeignTravelIndex = null;
      this.foreignTravelBtnName = 'Add';
    } else {
      this.claims.yatForeignTravelDetailDTOs.push({
        id: this.nextForeignTravelId(),
        ltcTravelPrimaryKey: this.nextForeignTravelId(),
        descr: d,
        amount: amt, // store as number
      });
    }

    this.resetForeignTravelDetail();
    this.recalcFteTotals();
  }

  editForeignTravelDetail(index: number): void {
    const row = this.claims?.yatForeignTravelDetailDTOs?.[index];
    if (!row) return;

    this.tempForeignTravelDetail = {
      id: row.id ?? null,
      descr: row.descr ?? null,
      amount: row.amount ?? null,
    };

    this.editForeignTravelIndex = index;
    this.foreignTravelBtnName = 'Update';
  }

  deleteForeignTravelDetail(index: number): void {
    if (!this.claims?.yatForeignTravelDetailDTOs?.length) return;

    this.claims.yatForeignTravelDetailDTOs.splice(index, 1);

    if (this.editForeignTravelIndex === index) {
      this.resetForeignTravelDetail();
    } else if (this.editForeignTravelIndex !== null && this.editForeignTravelIndex > index) {
      this.editForeignTravelIndex -= 1;
    }

    this.recalcFteTotals();
  }

  resetForeignTravelDetail(): void {
    this.tempForeignTravelDetail = { id: null, descr: '', amount: '' };
    this.editForeignTravelIndex = null;
    this.foreignTravelBtnName = 'Add';
  }

  onFteTravelAmountChange(row: any): void {
    if (!row) return;

    const rawValue = (row.tempAmount ?? '').toString().trim();
    if (rawValue === '') {
      this.recalcFteTotals();
      return;
    }

    const currentAmount = Number(rawValue);
    const originalAmount = Number(row.amount ?? 0);
    if (
      Number.isFinite(currentAmount) &&
      Number.isFinite(originalAmount) &&
      originalAmount > 0 &&
      currentAmount > originalAmount
    ) {
      row.tempAmount = originalAmount;
    }

    this.recalcFteTotals();
  }

  private mergeSavedFteResponse(obj: any): void {
    if (!obj) return;

    const currentAdv = this.claims.yatForeignDutyAdvDTOs?.[0] || this.createEmptyFteAdv();
    const savedAdv = Array.isArray(obj.yatForeignDutyAdvDTOs)
      ? obj.yatForeignDutyAdvDTOs[0]
      : null;
    const savedDtsRows = Array.isArray(obj.yatDtsDetailDTOs)
      ? this.normalizeFteDtsRows(obj.yatDtsDetailDTOs)
      : this.claims.yatDtsDetailDTOs;
    const savedForeignRows = this.normalizeForeignTravelRows(
      Array.isArray(obj.yatForeignTravelDetailDTOs)
        ? obj.yatForeignTravelDetailDTOs
        : this.claims.yatForeignTravelDetailDTOs
    );
    const bank = obj.yatClaimBankDetailDTO || this.claims.yatClaimBankDetailDTO;

    this.claims = {
      ...this.claims,
      ...obj,
      yatForeignDutyAdvDTOs: [{ ...currentAdv, ...(savedAdv || {}) }],
      yatDtsDetailDTOs: savedDtsRows,
      yatForeignTravelDetailDTOs: savedForeignRows,
      yatClaimBankDetailDTO: {
        ...this.claims.yatClaimBankDetailDTO,
        ...bank,
        bankAccNo:
          bank?.bankAccNo ??
          bank?.accountNo ??
          this.claims.yatClaimBankDetailDTO.bankAccNo ??
          this.claims.yatClaimBankDetailDTO.accountNo,
      },
      yatDocsDTOs: [],
    };

    this.showGxFileBrowse = !this.claims?.gxFormFileUrl;
    delete (this.claims as any).deleteGxFileUrl;
    this.recalcFteTotals();
  }

  private normalizeFtePayloadForSave(tempClaim: any): void {
    const adv = tempClaim?.yatForeignDutyAdvDTOs?.[0];
    if (adv) {
      tempClaim.claimAmt = adv.advAmt ?? 0;
    }

    if (Array.isArray(tempClaim?.yatDtsDetailDTOs)) {
      tempClaim.yatDtsDetailDTOs = tempClaim.yatDtsDetailDTOs.map((row: any) => {
        const normalized = { ...row };
        normalized.amount =
          this.normalizeAmountValue(normalized.tempAmount, null) ??
          this.normalizeAmountValue(normalized.amount, 0);
        delete normalized.tempAmount;
        delete normalized._reasonError;
        delete normalized.ltcTravelPrimaryKey;
        return normalized;
      });
    }

    if (Array.isArray(tempClaim?.yatForeignTravelDetailDTOs)) {
      tempClaim.yatForeignTravelDetailDTOs = tempClaim.yatForeignTravelDetailDTOs.map((row: any) => {
        const normalized = { ...row };
        normalized.amount = this.normalizeAmountValue(normalized.amount, 0);
        delete normalized.ltcTravelPrimaryKey;
        return normalized;
      });
    }
  }

  recalcFteTotals(): void {
    const adv = this.claims?.yatForeignDutyAdvDTOs?.[0];
    if (!adv) return;

    const num = (v: any) => {
      const n = Number((v ?? '').toString().trim());
      return isNaN(n) ? 0 : n;
    };

    const travel = this.claims?.yatDtsDetailDTOs || [];
    const fin = this.claims?.yatForeignTravelDetailDTOs || [];

    const dtsTotal = travel
      .filter((r: any) => !['NA', 'No'].includes((r?.isDts ?? '').toString()))
      .reduce((s: number, r: any) => s + num(r?.tempAmount ?? r?.amount), 0);

    const nonDtsTravelTotal = travel
      .filter((r: any) => ['NA', 'No'].includes((r?.isDts ?? '').toString()))
      .reduce((s: number, r: any) => s + num(r?.tempAmount ?? r?.amount), 0);

    const foreignTravelAmount = fin.reduce((s: number, r: any) => s + num(r?.amount), 0);

    this.noDtsAmount = nonDtsTravelTotal + foreignTravelAmount;

    adv.travelDetailsFTEAmt = foreignTravelAmount;
    adv.nonDtsAmount = dtsTotal + foreignTravelAmount;
    adv.totalAmt = this.noDtsAmount;
    adv.advAmt = this.noDtsAmount;
    adv.dtsAmount = dtsTotal;
    adv.totalBudgetedAmt = num(adv.advAmt) + dtsTotal;

    this.claims.claimAmt = String(adv.advAmt ?? 0);
  }

  private num(v: any): number {
    return this.normalizeAmountValue(v, 0) ?? 0;
  }

  private normalizeAmountValue(value: any, emptyValue: number | null = null): number | null {
    const raw = (value ?? '').toString().trim().replace(/,/g, '');
    if (!raw) return emptyValue;

    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : emptyValue;
  }

  private parsePositiveAmount(raw: any): number | null {
    const v = (raw ?? '').toString().trim();

    // empty / non-number
    if (!v) return null;

    // digits only (no minus, no decimals; adjust if you want decimals)
    if (!/^\d+$/.test(v)) return null;

    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return null;

    return n;
  }

}
