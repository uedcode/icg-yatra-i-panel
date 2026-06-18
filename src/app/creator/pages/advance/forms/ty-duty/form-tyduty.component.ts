import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/service/core/util.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { DropdownManageService } from 'src/app/service/form/dropdown-manage.service';
import { FormService } from 'src/app/service/form/form.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { FormStateService } from 'src/app/service/form/formState.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { ClaimUtilService } from 'src/app/service/claim/claim-util.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
import {
  clearLegacyInvalidFromEvent,
  validateLegacyRequiredSection,
} from '../shared/helpers/legacy-form-validation.helper';

declare var $: any;

/* ========= BASIC DTOs YOU ALREADY STARTED ========= */

interface TyDutyHeaderDTO {
  pno: string | null;
  name: string | null;
  rank: string | null;
  // presentUnit: string | null;
  payLevel: string | null;
  basicPay: number | null;
  tempTransTo: string | null;
}

interface TyDutyClaimDTO {
  basicPay?: number | null;
  yatTempDutyAdvDTOs: TyDutyHeaderDTO[];
}

/* ========= FULL CLAIM STRUCTURE FOR THIS COMPONENT ========= */

interface YatDtsDetailDTO {
  _reasonForNoDtsError?: boolean;
  ltcTravelPrimaryKey?: string;
  source?: string;
  destination?: string;
  modeOfTravel?: string;
  otherModeOfTravel?: string;
  classOfTravel?: string;
  distance?: number | null;
  amount?: number | null;
  tempAmount?: number | null;
  isDts?: string | null; // 'Yes' | 'No' | 'NA'
  reasonForNoDts?: string;
  remarks?: string;
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

interface YatTempDutyAdvDTO {
  tempDutyAdvId?: number | null;

  // Personal details
  pno?: string | null;
  name?: string | null;
  rank?: string | null;
  presentUnit?: string | null;
  // payLevel?: string | null; // used in your HTML
  payLevel?: string | null; // backend-style, keep both
  basicPay?: number | null;
  videPresentUnit?: string | null;
  // Duty / unit
  tempTransTo?: string | null; // used in your HTML
  tempTransferToType?: string | null;
  otherUnit?: string | null;
  unitList?: string[] | null;
  stationProceedingTo?: string | null;
  dutyStation?: string | null;
  appliedTo?: string | null;
  // GX / authority
  gxUnit?: string | null;
  gxNumber?: string | null;
  gxDate?: Date | null;

  // Dates
  date?: Date | null;
  wefDate?: Date | null;

  // Purpose/guest
  purposeType?: string | null;
  purpose?: string | null;
  personName?: string | null;
  relation?: string | null;
  age?: number | null;
  gender?: string | null;
  place?: string | null;
  // Duration
  duration?: number | null;

  // Food charges
  isAvailFoodCharge?: boolean;
  foodChargeDays?: number | null;
  foodChargeRatePerDay?: number | null;
  foodChargePerc?: number | null;
  totalFoodCharge?: number | null;

  // Hotel
  isAvailHotelAcc?: boolean;
  hotelAccDays?: number | null;
  hotelAccRatePerDay?: number | null;
  hotelChargePerc?: number | null;
  totalHotelAcc?: number | null;

  // ARR to duty
  isAvailArr?: boolean;
  arrToDutyRate?: number | null;
  arrToDutyKm?: number | null;
  arrToDutyRs?: number | null;

  // Acco ↔ duty inside city
  isAvailAcc?: boolean;
  accHToDutyDays?: number | null;
  accHToDutyPerDay?: number | null;
  accHToDutyKms?: number | null;
  totalAccHToDuty?: number | null;
  availedCategory?: number | string | null; // legacy may return 0/1/2 as number or string

  // Financial totals
  arrFare?: number | null;
  totalAmt?: number | null;
  dtsAmount?: number | null;
  advAmt?: number | null;
  totalBudgetedAmt?: number | null;
  isDts?: string | null;
}

interface Claims {
  aclUserDTO?: any;
  codeSubFormDTO: any;
  codeUnitDTO: any;
  claimId?: number | null;
  signWith?: string | null;
  occDate?: Date | null;
  extendedAdvId?: number | null;
  refExtendedAdvId?: string | null;
  gxFormFileUrl?: string | null;
  refAdvanceId?: string | null;
  yatTempDutyAdvDTOs: YatTempDutyAdvDTO[];
  yatDtsDetailDTOs: YatDtsDetailDTO[];
  yatClaimBankDetailDTO: YatClaimBankDetailDTO;
  yatDocsDTOs?: any[];

  internalRemarks?: string | null;
  claimAmt?: number | null;
}

declare var $: any;

@Component({
  selector: 'app-form-tyduty',
  templateUrl: './form-tyduty.component.html',
  styleUrls: ['./form-tyduty.component.css'],
  standalone: false,
})
export class FormTydutyComponent implements OnInit {
  /* ==== CONSTANTS ==== */
  isIfscNull: false;
  codeClaim = {
    tyAdv: 'T', // legacy TY Duty Advance sub-form id
  } as const;

  codeClaimState = {
    draft: 'DR',
    outbox: 'OB',
  } as const;

  codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
  } as const;

  purposeType = {
    investive: 'Investiture Ceremony',
    other: 'Other',
  } as const;

  id: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  purposeTypes: any = [];
  noOfPage: any;
  p: any;
  res: any;
  allUnits: any = [];
  allStations: any = [];
  /* ==== STATE ==== */
  preSelectedUnit;
  claims: Claims = this.createEmptyClaims();

  isPreviewDisabled = true;
  disableBtn = false;
  fullFormDisabled = false;

  hideStationOrUnit = false;
  hideStationAndUnit = false;
  hideShowOtherUnit = false;
  hideShowUnitList = false;

  boolIsDts = false;
  otherMode = false;
  isDtsDisabled = false;
  private tyBusinessInvalidSection: string | null = null;
  eSignTempFormObj: any = null;

  ltcTravelDetailsBtn = false;
  travelBtnName = 'Add';

  isGSTAvailed = false;
  showGxFileBrowse = false;

  fileUrl = window.location.origin;
  gxUnitId: number | null = null;

  tempLtcTravelDetails: YatDtsDetailDTO = {};
  selectedTravelIndex: number | null = null;

  claimIdParam: string | null = null;
  resubClaimId: string | null = null;
  extnClaimId: string | null = null;
  selectedUserForTyDuty: any;

  showIfscModal = false;
  newIfscCode: string = '';
  claimId: any;
  gxFormModel: any;
  showErrors: any;
  activeFormKind: 'advance' | 'claim' = 'advance';
  activeSubFormId: string = this.codeClaim.tyAdv;

  get pageTitle(): string {
    if (this.activeFormKind === 'claim') {
      return `${this.supplementryId ? 'Supplementary ' : ''}TY Duty Claim`;
    }
    return 'REQUISITION FOR TY DUTY ADVANCE';
  }

  get currentFormCode(): string {
    return this.activeSubFormId;
  }

  allowOnlyNumbers(e: KeyboardEvent): void {
    // allow control keys
    const allowed = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
    ];
    if (allowed.includes(e.key)) return;

    // allow Ctrl/Command shortcuts
    if (e.ctrlKey || e.metaKey) return;

    // digits only
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  blockPasteIfNotNumber(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') ?? '';
    if (text && !/^\d+$/.test(text)) {
      e.preventDefault();
    }
  }

  allowDecimalNumber(e: KeyboardEvent): void {
    const allowed = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
    ];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;

    const input = e.target as HTMLInputElement;
    if (e.key === '.' && !input.value.includes('.')) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  blockPasteIfNotDecimal(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') ?? '';
    if (text && !/^\d+(\.\d+)?$/.test(text)) {
      e.preventDefault();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private UtilService: UtilService,
    private datePipe: DatePipe,
    public $auth: AuthService,
    public $form: FormService,
    public $formState: FormStateService,
    public $formManage: FormManageService,
    private $dropdownManage: DropdownManageService,
    private $common: CommonService,
    private $claim: ClaimService,
    private $util: ClaimUtilService,
    private $codeDocInfo: CodeDocInfoService
  ) {}

  userIdDetails: any;
  today: any;
  codeStatus: any;
  formId: any;
  tempFormObj: any;
  subFormId: any;
  documentDtos: any[] = [];
  supplementryId: any;
  supplementryClaim: any;

  /* ==== INIT ==== */

  ngOnInit(): void {
    this.initFromRoute();
    this.userIdDetails = this.$auth.getUserDetails();
    this.getUnits();
    this.getStations();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.codeStatus = this.$auth?.codeStatus();

    // if (!this.claims.signWith) {
    //   this.claims.signWith = this.codeSignType.eSign;
    // }
    this.getPurposeTypes();
    this.$codeDocInfo.documentDtos.subscribe((docs: any) => {
      this.documentDtos = Array.isArray(docs) ? docs : [];
    });
    this.route.queryParamMap.subscribe((params) => {
      this.syncRouteStateFromQuery(params);
      this.supplementryClaim = this.supplementryId ? 'Supplementary ' : '';

      this.getFormDetails();
    });
  }

  // ====== rest of your methods (createEmptyClaims, calculateAmount, getFormDetails, etc.) ======

  bankObj;
  private initFromRoute(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.activeFormKind = this.resolveFormKind(this.route.snapshot.data?.['formKind']);
    this.syncRouteStateFromQuery(qp);
  }

  private syncRouteStateFromQuery(qp: { get: (key: string) => string | null }): void {
    const routeSubFormId = this.route.snapshot.data?.['subFormId'];
    const querySubFormId = qp.get('subFormId');
    this.activeSubFormId =
      this.activeFormKind === 'claim'
        ? querySubFormId || routeSubFormId || 'TYD'
        : querySubFormId || routeSubFormId || this.codeClaim.tyAdv;
    this.claims.codeSubFormDTO = { subFormId: this.activeSubFormId };
    this.formId = qp.get('id');
    this.subFormId = querySubFormId;
    this.claimIdParam =
      qp.get('id') ||
      (this.activeFormKind === 'claim' ? qp.get('claimId') : null) ||
      qp.get('resubId');
    this.resubClaimId = qp.get('resubId');
    this.extnClaimId = qp.get('extnClaimId') || qp.get('extnId');
    this.supplementryId = qp.get('supId');
    const gxUnitIdStr = qp.get('gxUnitId');
    this.gxUnitId = gxUnitIdStr ? +gxUnitIdStr : null;
  }

  private createEmptyClaims(): Claims {
    return {
      signWith: this.codeSignType.eSign,
      yatTempDutyAdvDTOs: [this.createEmptyTyAdv()],
      yatDtsDetailDTOs: [],
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
      codeSubFormDTO: { subFormId: 'T' } as any,
      codeUnitDTO: { unit: '', descr: '' } as any,
      yatDocsDTOs: [],
    };
  }

  private createEmptyTyAdv(): YatTempDutyAdvDTO {
    return {
      tempDutyAdvId: null,
      pno: null,
      name: null,
      rank: null,
      // presentUnit: null,
      payLevel: null,
      basicPay: null,
      dutyStation: null,
      tempTransTo: null,
      tempTransferToType: null,
      otherUnit: null,
      unitList: null,
      stationProceedingTo: null,
      appliedTo: null,
      gxUnit: null,
      gxNumber: null,
      gxDate: null,
      date: null,
      wefDate: null,
      purposeType: null,
      purpose: null,
      personName: null,
      relation: null,
      age: null,
      gender: null,
      duration: null,
      isAvailFoodCharge: false,
      foodChargeDays: null,
      foodChargeRatePerDay: null,
      foodChargePerc: null,
      totalFoodCharge: 0,
      isAvailHotelAcc: false,
      hotelAccDays: null,
      hotelAccRatePerDay: null,
      hotelChargePerc: null,
      totalHotelAcc: 0,
      isAvailArr: false,
      arrToDutyRate: null,
      arrToDutyKm: null,
      arrToDutyRs: 0,
      isAvailAcc: false,
      accHToDutyDays: null,
      accHToDutyPerDay: null,
      accHToDutyKms: null,
      totalAccHToDuty: 0,
      availedCategory: null,
      arrFare: null,
      totalAmt: 0,
      dtsAmount: 0,
      advAmt: 0,
      totalBudgetedAmt: 0,
      isDts: 'Yes',
    };
  }

  /* ==== UTILS ==== */

  public isNullOrEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private toNumber(value: unknown): number {
    return this.normalizeAmountNumber(value, 0) ?? 0;
  }

  private normalizeAmountNumber(value: unknown, emptyValue: number | null = null): number | null {
    const raw = String(value ?? '').trim().replace(/,/g, '');
    if (!raw) return emptyValue;

    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : emptyValue;
  }

  private sumOfColumn(arr: any[], key: string): number {
    return arr.reduce((sum, item) => sum + this.toNumber(item?.[key]), 0);
  }

  isAvailedCategoryOneOrTwo(category: unknown): boolean {
    return String(category ?? '') === '1' || String(category ?? '') === '2';
  }

  isAvailedCategoryZero(category: unknown): boolean {
    return String(category ?? '') === '0';
  }

  isAvailedCategoryTwo(category: unknown): boolean {
    return String(category ?? '') === '2';
  }

  /* ==========================================================
   *  CORE: AMOUNT CALCULATION (TY ADVANCE)
   * ========================================================== */

  calculateAmount(type: string, isTotalAccHToDutyChanged = false): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) {
      return;
    }

    this.normalizeFinancialInputs(adv);
    let calTyAmt = 0;

    // ARR fare
    if (!this.isNullOrEmpty(adv.arrFare)) {
      calTyAmt += this.toNumber(adv.arrFare);
    }

    // == FOOD CHARGE ==
    if (adv.isAvailFoodCharge === true) {
      if (
        !this.isNullOrEmpty(adv.foodChargeDays) &&
        !this.isNullOrEmpty(adv.foodChargeRatePerDay)
      ) {
        adv.totalFoodCharge =
          this.toNumber(adv.foodChargeDays) *
          this.toNumber(adv.foodChargeRatePerDay);

        // GST on food
        if (!this.isNullOrEmpty(adv.foodChargePerc)) {
          const percentageAmount =
            (this.toNumber(adv.totalFoodCharge) *
              this.toNumber(adv.foodChargePerc)) /
            100;
          adv.totalFoodCharge =
            this.toNumber(adv.totalFoodCharge) + percentageAmount;
          adv.totalFoodCharge = Math.round(adv.totalFoodCharge);
        }

        calTyAmt += this.toNumber(adv.totalFoodCharge);
      } else {
        adv.totalFoodCharge = 0;
      }
    } else {
      adv.totalFoodCharge = 0;
    }

    // == HOTEL ACCO ==
    if (adv.isAvailHotelAcc === true) {
      if (
        !this.isNullOrEmpty(adv.hotelAccDays) &&
        !this.isNullOrEmpty(adv.hotelAccRatePerDay)
      ) {
        adv.totalHotelAcc =
          this.toNumber(adv.hotelAccDays) *
          this.toNumber(adv.hotelAccRatePerDay);

        // GST on hotel
        if (!this.isNullOrEmpty(adv.hotelChargePerc)) {
          const percentageAmount =
            (this.toNumber(adv.totalHotelAcc) *
              this.toNumber(adv.hotelChargePerc)) /
            100;
          adv.totalHotelAcc =
            this.toNumber(adv.totalHotelAcc) + percentageAmount;
          adv.totalHotelAcc = Math.round(adv.totalHotelAcc);
        }

        calTyAmt += this.toNumber(adv.totalHotelAcc);
      } else {
        adv.totalHotelAcc = 0;
      }
    } else {
      adv.totalHotelAcc = 0;
    }

    // == ARR TO DUTY ==
    if (adv.isAvailArr === true) {
      if (
        !this.isNullOrEmpty(adv.arrToDutyRate) &&
        !this.isNullOrEmpty(adv.arrToDutyKm)
      ) {
        adv.arrToDutyRs =
          this.toNumber(adv.arrToDutyRate) * this.toNumber(adv.arrToDutyKm);

        calTyAmt += this.toNumber(adv.arrToDutyRs);
      } else {
        adv.arrToDutyRs = 0;
      }
    } else {
      adv.arrToDutyRs = 0;
    }

    // == HOME TO DUTY / ACC ==
    if (adv.isAvailAcc === true) {
      if (
        !this.isNullOrEmpty(adv.accHToDutyPerDay) &&
        !this.isNullOrEmpty(adv.accHToDutyDays)
      ) {
        if (this.isAvailedCategoryOneOrTwo(adv.availedCategory)) {
          if (!this.isNullOrEmpty(adv.accHToDutyKms)) {
            adv.totalAccHToDuty =
              this.toNumber(adv.accHToDutyPerDay) *
              this.toNumber(adv.accHToDutyDays) *
              this.toNumber(adv.accHToDutyKms);
          }
        } else {
          adv.totalAccHToDuty =
            this.toNumber(adv.accHToDutyPerDay) *
            this.toNumber(adv.accHToDutyDays);
        }

        calTyAmt += this.toNumber(adv.totalAccHToDuty);
      } else {
        if (isTotalAccHToDutyChanged) {
          adv.accHToDutyPerDay = null;
          adv.accHToDutyDays = null;
          if (!this.isNullOrEmpty(adv.totalAccHToDuty)) {
            calTyAmt += this.toNumber(adv.totalAccHToDuty);
          } else {
            adv.totalAccHToDuty = 0;
          }
        } else {
          adv.totalAccHToDuty = 0;
        }
      }
    } else {
      adv.totalAccHToDuty = 0;
    }

    // Final totalAmt
    adv.totalAmt = this.isNullOrEmpty(calTyAmt) ? 0 : calTyAmt;

    // DTS / NON-DTS SPLIT
    const dtsAmountObj = this.claims.yatDtsDetailDTOs.filter(
      (e) => e.isDts !== 'NA' && e.isDts !== 'No'
    );
    let dtsAmount = this.sumOfColumn(dtsAmountObj, 'tempAmount');
    if (dtsAmount === 0) {
      dtsAmount = this.sumOfColumn(dtsAmountObj, 'amount');
    }

    const nonDtsAmountObj = this.claims.yatDtsDetailDTOs.filter(
      (e) => e.isDts === 'NA' || e.isDts === 'No'
    );
    let nonDtsAmount = this.sumOfColumn(nonDtsAmountObj, 'tempAmount');
    if (nonDtsAmount === 0) {
      nonDtsAmount = this.sumOfColumn(nonDtsAmountObj, 'amount');
    }

    adv.dtsAmount = dtsAmount;
    adv.totalAmt = this.toNumber(adv.totalAmt) + nonDtsAmount;

    this.calculateNintyAmount(type);

    if (!this.isNullOrEmpty(adv.advAmt)) {
      adv.totalBudgetedAmt = this.toNumber(adv.advAmt) + dtsAmount;
    } else {
      adv.advAmt = 0;
      adv.totalBudgetedAmt = this.toNumber(adv.advAmt) + dtsAmount;
    }

    // GST availed flag
    if (
      this.toNumber(adv.foodChargePerc) > 0 ||
      this.toNumber(adv.hotelChargePerc) > 0
    ) {
      this.isGSTAvailed = true;
    } else {
      this.isGSTAvailed = false;
    }
  }

  private normalizeFinancialInputs(adv: YatTempDutyAdvDTO): void {
    const duration = this.toNumber(adv.duration);
    ['foodChargeDays', 'hotelAccDays', 'accHToDutyDays'].forEach((key) => {
      const current = this.toNumber((adv as any)[key]);
      if (duration > 0 && current > duration) {
        (adv as any)[key] = duration;
      }
    });

    ['foodChargePerc', 'hotelChargePerc'].forEach((key) => {
      const current = this.toNumber((adv as any)[key]);
      if (current > 100) {
        (adv as any)[key] = 100;
      }
    });
  }

  calculateNintyAmount(type: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) {
      return;
    }

    if (!this.isNullOrEmpty(adv.totalAmt)) {
      adv.advAmt = this.toNumber(adv.totalAmt);
      adv.advAmt = this.toNumber(adv.advAmt);
      adv.advAmt = Math.round(adv.advAmt);
    } else {
      adv.advAmt = 0;
    }
  }

  onFoodRequiredChange(val: any): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) return;

    adv.isAvailFoodCharge = val === true || val === 'true';

    if (!adv.isAvailFoodCharge) {
      adv.totalFoodCharge = 0;
    }

    this.calculateAmount(this.codeClaim?.tyAdv);
  }

  onHotelRequiredChange(val: any): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) return;

    adv.isAvailHotelAcc = val === true || val === 'true';

    if (!adv.isAvailHotelAcc) {
      adv.totalHotelAcc = 0;
    }

    this.calculateAmount(this.codeClaim?.tyAdv);
  }

  onArrRequiredChange(val: any): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) return;

    adv.isAvailArr = val === true || val === 'true';

    if (!adv.isAvailArr) {
      adv.arrToDutyRs = 0;
    }

    this.calculateAmount(this.codeClaim?.tyAdv);
  }

  onAccRequiredChange(val: any): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) return;

    adv.isAvailAcc = val === true || val === 'true';

    if (!adv.isAvailAcc) {
      adv.totalAccHToDuty = 0;
    }

    this.calculateAmount(this.codeClaim?.tyAdv);
  }

  /* ==========================================================
   *  TRAVEL DETAILS – ADD / EDIT / DELETE
   * ========================================================== */

  validateLtcTravel(detail: any, field: string): void {
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

  addLtcTravelDetails(detail: YatDtsDetailDTO, type: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    this.ltcTravelDetailsBtn = true;
    this.validateLtcTravel(detail, 'modeOfTravel');

    if (this.isNullOrEmpty(detail.source)) {
      this.ltcTravelDetailsBtn = false;
      this.$common.showMessage('From Field is required', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.destination)) {
      this.ltcTravelDetailsBtn = false;
      this.$common.showMessage('To Field is required', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.modeOfTravel)) {
      this.ltcTravelDetailsBtn = false;
      this.$common.showMessage('Mode of Travel Field is required', 'danger');
      return;
    }

    if ((detail.modeOfTravel || '').trim() === 'Others') {
      const otherMode = detail.otherModeOfTravel
        ? detail.otherModeOfTravel.trim()
        : '';
      if (!otherMode) {
        this.ltcTravelDetailsBtn = false;
        this.$common.showMessage(
          'Other Mode of Travel Field is required',
          'danger'
        );
        return;
      }
    }

    if (this.isNullOrEmpty(detail.amount)) {
      this.ltcTravelDetailsBtn = false;
      this.$common.showMessage('Amount Field is required', 'danger');
      return;
    }

    if (this.isNullOrEmpty(detail.isDts)) {
      this.ltcTravelDetailsBtn = false;
      this.$common.showMessage('Dts Field is required', 'danger');
      return;
    }

    if (!this.isReasonForNoDtsDisabled(detail)) {
      const reason = detail.reasonForNoDts ? detail.reasonForNoDts.trim() : '';

      if (!reason) {
        this.ltcTravelDetailsBtn = false;
        detail._reasonForNoDtsError = true;
        this.$common.showMessage(
          'Reason for not Booking Field is required',
          'danger'
        );
        return;
      }
    } else {
      detail.reasonForNoDts = '';
      detail._reasonForNoDtsError = false;
    }

    if (this.isNullOrEmpty(detail.tempAmount)) {
      detail.tempAmount = this.toNumber(detail.amount);
    }

    const row = {
      ...detail,
      ltcTravelPrimaryKey:
        (detail as any).ltcTravelPrimaryKey ||
        Math.random().toString(36).substring(7),
    } as YatDtsDetailDTO;

    const updateIndex = row.ltcTravelPrimaryKey
      ? this.claims.yatDtsDetailDTOs.findIndex(
          (elem: any) => elem.ltcTravelPrimaryKey === row.ltcTravelPrimaryKey
        )
      : -1;

    if (updateIndex >= 0) {
      this.claims.yatDtsDetailDTOs[updateIndex] = row;
    } else if (
      this.selectedTravelIndex !== null &&
      this.selectedTravelIndex >= 0 &&
      this.selectedTravelIndex < this.claims.yatDtsDetailDTOs.length
    ) {
      this.claims.yatDtsDetailDTOs[this.selectedTravelIndex] = row;
    } else {
      this.claims.yatDtsDetailDTOs.push(row);
    }

    this.resetTempLtcTravelDetails();
    this.calculateAmount(this.codeClaim.tyAdv);
  }

  editLtcTravelDetails(index: number): void {
    if (index < 0 || index >= this.claims.yatDtsDetailDTOs.length) {
      return;
    }
    this.selectedTravelIndex = index;
    this.tempLtcTravelDetails = {
      ...this.claims.yatDtsDetailDTOs[index],
    };
    if (
      this.tempLtcTravelDetails.modeOfTravel &&
      !this.isKnownTravelMode(this.tempLtcTravelDetails.modeOfTravel)
    ) {
      this.tempLtcTravelDetails.otherModeOfTravel =
        this.tempLtcTravelDetails.otherModeOfTravel ||
        this.tempLtcTravelDetails.modeOfTravel;
      this.tempLtcTravelDetails.modeOfTravel = 'Others';
    }
    if (!this.isNullOrEmpty(this.tempLtcTravelDetails.tempAmount)) {
      this.tempLtcTravelDetails.amount = this.toNumber(
        this.tempLtcTravelDetails.tempAmount
      );
    }
    this.validateLtcTravel(this.tempLtcTravelDetails, 'modeOfTravel');
    this.travelBtnName = 'Update';
  }

  private isKnownTravelMode(mode: string): boolean {
    return [
      'Air',
      'Road',
      'Train',
      'Ship',
      'Bus',
      'Taxi',
      'Ferry',
      'Service Vehicle',
      'Others',
    ].includes(mode);
  }

  isReasonForNoDtsDisabled(detail: YatDtsDetailDTO): boolean {
    return (
      detail?.isDts === 'Yes' ||
      detail?.isDts === 'DTS' ||
      detail?.isDts === 'NA'
    );
  }

  private firstObject(value: any): any {
    if (Array.isArray(value)) {
      return value[0] || {};
    }
    return value || {};
  }

  private hasObjectValue(value: any): boolean {
    return !!value && (typeof value !== 'object' || Object.keys(value).length > 0);
  }

  private pickFirstValue(...values: any[]): any {
    return values.find(
      (value) => value !== null && value !== undefined && value !== ''
    );
  }

  private mapTyPersonalDetails(adv: YatTempDutyAdvDTO, source: any, _root: any): void {
    const presentUnit = this.pickFirstValue(
      source?.videPresentUnit,
      source?.presentUnit,
      adv.videPresentUnit,
      adv.presentUnit
    );
    const payLevel = this.pickFirstValue(
      source?.payLevel,
      source?.paylevel,
      adv.payLevel
    );
    const basicPayRaw = this.pickFirstValue(
      source?.basicPay,
      source?.basPay,
      adv.basicPay
    );

    adv.pno = this.pickFirstValue(source?.pno, source?.persNo, adv.pno, null);
    adv.name =
      String(this.pickFirstValue(source?.name, source?.userName, adv.name, '')).trim() ||
      null;
    adv.rank = this.pickFirstValue(source?.rank, source?.rankName, adv.rank, null);
    adv.presentUnit = presentUnit ?? adv.presentUnit ?? null;
    adv.videPresentUnit = presentUnit ?? adv.videPresentUnit ?? null;
    adv.payLevel = payLevel ?? null;
    adv.basicPay = basicPayRaw !== null && basicPayRaw !== undefined && basicPayRaw !== ''
      ? Number(basicPayRaw)
      : null;
    adv.availedCategory = this.pickFirstValue(
      source?.availedCategory,
      adv.availedCategory,
      null
    );
  }

  private mapTyBankDetails(root: any): void {
    const bank = root?.yatClaimBankDetailDTO || {};
    this.claims.yatClaimBankDetailDTO = {
      ...this.claims.yatClaimBankDetailDTO,
      bankName: this.pickFirstValue(bank.bankName, this.claims.yatClaimBankDetailDTO.bankName),
      branch: this.pickFirstValue(bank.branch, this.claims.yatClaimBankDetailDTO.branch),
      ifscCode: this.pickFirstValue(bank.ifscCode, this.claims.yatClaimBankDetailDTO.ifscCode),
      accountNo: this.pickFirstValue(
        bank.accountNo,
        bank.bankAccNo,
        this.claims.yatClaimBankDetailDTO.accountNo
      ),
      micrCode: this.pickFirstValue(bank.micrCode, this.claims.yatClaimBankDetailDTO.micrCode),
      bankAccNo: this.pickFirstValue(
        bank.bankAccNo,
        bank.accountNo,
        this.claims.yatClaimBankDetailDTO.bankAccNo,
        this.claims.yatClaimBankDetailDTO.accountNo
      ),
    };
  }

  private mergeSavedTyResponse(savedClaim: any): void {
    if (!savedClaim || typeof savedClaim !== 'object') {
      return;
    }

    const currentAdv = this.claims.yatTempDutyAdvDTOs?.[0] || {};
    const savedAdv = this.firstObject(savedClaim.yatTempDutyAdvDTOs);
    this.claims = {
      ...this.claims,
      ...savedClaim,
      yatTempDutyAdvDTOs: [
        {
          ...currentAdv,
          ...savedAdv,
        },
      ],
      yatDtsDetailDTOs: Array.isArray(savedClaim.yatDtsDetailDTOs)
        ? this.normalizeTyDtsRows(savedClaim.yatDtsDetailDTOs)
        : this.claims.yatDtsDetailDTOs,
      yatClaimBankDetailDTO: {
        ...this.claims.yatClaimBankDetailDTO,
        ...(savedClaim.yatClaimBankDetailDTO || {}),
      },
    } as Claims;

    this.mapTyBankDetails(savedClaim);
    delete (this.claims as any).deleteGxFileUrl;
    this.syncGxFileBrowseState();
    this.checkForPreviewBtn();
  }

  private normalizeTyDtsRows(rows: any[]): any[] {
    return (rows || []).map((row: any) => {
      const amount = this.normalizeAmountNumber(row?.amount, null);
      const tempAmount =
        this.normalizeAmountNumber(row?.tempAmount, null) ??
        amount;

      return {
        ...row,
        amount,
        tempAmount,
      };
    });
  }

  private hasTyPersonalDetails(): boolean {
    const adv = this.claims?.yatTempDutyAdvDTOs?.[0];
    return !!(
      adv?.name ||
      adv?.pno ||
      adv?.rank ||
      adv?.payLevel ||
      adv?.basicPay ||
      adv?.videPresentUnit ||
      adv?.presentUnit
    );
  }

  openTravelDeleteModel(index: number, type: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    if (index < 0 || index >= this.claims.yatDtsDetailDTOs.length) {
      return;
    }

    const confirmDelete = window.confirm(
      'Do you really want to delete this row?'
    );
    if (confirmDelete) {
      this.claims.yatDtsDetailDTOs.splice(index, 1);
      this.calculateAmount(this.codeClaim.tyAdv);
    }
  }

  onIsDtsChange(detail: any): void {
    const value = detail.isDts;

    if (value === 'Yes' || value === 'DTS' || value === 'NA') {
      detail.reasonForNoDts = '';
    }
    this.validateLtcTravel(detail, 'isDts');
  }

  onDtsTempAmountChange(row: YatDtsDetailDTO): void {
    const amount = this.toNumber(row.amount);
    const tempAmount = this.toNumber(row.tempAmount);

    if (!this.isNullOrEmpty(row.amount) && tempAmount > amount) {
      row.tempAmount = amount;
    }

    this.calculateAmount(this.codeClaim.tyAdv);
  }

  resetTempLtcTravelDetails(): void {
    this.tempLtcTravelDetails = {
      source: '',
      destination: '',
      modeOfTravel: '',
      amount: null,
      isDts: '',
      reasonForNoDts: '',
      remarks: '',
    } as YatDtsDetailDTO;
    this.selectedTravelIndex = null;
    this.otherMode = false;
    this.boolIsDts = true;
    this.isDtsDisabled = false;
    this.ltcTravelDetailsBtn = false;
    this.travelBtnName = 'Add';
  }

  private normalizeDtsTempAmounts(): void {
    (this.claims.yatDtsDetailDTOs || []).forEach((row: any) => {
      if (this.isNullOrEmpty(row.tempAmount) && !this.isNullOrEmpty(row.amount)) {
        row.tempAmount = row.amount;
      }
    });
  }

  /* ==========================================================
   *  NAV / STUBS / MISC
   * ========================================================== */

  goBack() {
    if (window.history.length > 1) {
      this.reset();
      this.location.back();
    } else {
      window.close();
    }
  }

  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  isCertified: boolean = true;
  certified(event) {
    this.isCertified = !event.checked;
  }

  navigate_preview(route: string): void {
    this.navigatePreview(route, this.claims.claimId);
  }

  // FORM VALIDATE (TY ADVANCE)
  validate(type: string, status: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    this.validateTy(type);
  }

  private validateSection(sectionId: string): boolean {
    const section = document.getElementById(sectionId);
    if (!section) {
      return true;
    }

    return validateLegacyRequiredSection(section);
  }

  clearLegacyInvalid(event: Event): void {
    clearLegacyInvalidFromEvent(event);
  }

  private activateTab(sectionId: string): void {
    const tabLink = document.querySelector<HTMLAnchorElement>(
      `a[href="#${sectionId}"]`
    );
    if (tabLink) {
      tabLink.click();
    }
  }

  reset() {
    this.formObj = {};
  }

  getFormDetails() {
    try {
      this.$common.showLoader();
      const headers: any = {
        isPreview: 'false',
        gxUnitId: String(this.gxUnitId || this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || ''),
        userId: this.userIdDetails?.userId ?? '',
        subFormId: this.activeSubFormId,
        isFetch: 'true',
        claimId: '',
      };

      if (this.claimIdParam) {
        headers.claimId = this.claimIdParam;
      }
      if (this.supplementryId) {
        headers.supCLaimId = this.supplementryId;
      }

      const config = { headers };

      this.$claim.getSingleClaim(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.checkForPreviewBtn();
            if (this.claimIdParam) {
              this.$common.showMessage(
                response?.message || 'Unable to load TY Duty Advance details.',
                'danger'
              );
            }
            return;
          }

          let obj: any = this.firstObject(response.object);
          if (!this.hasObjectValue(obj)) {
            this.checkForPreviewBtn();
            if (this.claimIdParam) {
              this.$common.showMessage('No data returned from server.', 'danger');
            }
            return;
          }

          const adv = this.claims.yatTempDutyAdvDTOs[0];

          const dto =
            Array.isArray(obj.yatTempDutyAdvDTOs) &&
            obj.yatTempDutyAdvDTOs.length > 0
              ? obj.yatTempDutyAdvDTOs[0]
              : null;

          if (dto) {
            this.selectedUserForTyDuty = obj;

            const toNum = (v: any) =>
              v === null || v === undefined || v === '' ? null : Number(v);
            const toBool = (v: any) =>
              v === true || v === 'true'
                ? true
                : v === false || v === 'false'
                ? false
                : v;

            this.mapTyPersonalDetails(adv, dto, obj);

            // ---------- AVAILED CATEGORY ----------
            adv.availedCategory =
              dto.availedCategory != null
                ? Number(dto.availedCategory)
                : adv.availedCategory ?? null;

            // ---------- FLAGS ----------
            adv.isAvailFoodCharge = toBool(dto.isAvailFoodCharge) as any;
            adv.isAvailHotelAcc = toBool(dto.isAvailHotelAcc) as any;
            adv.isAvailArr = toBool(dto.isAvailArr) as any;
            adv.isAvailAcc = toBool(dto.isAvailAcc) as any;

            adv.foodChargeRatePerDay = toNum(dto.foodChargeRatePerDay);
            adv.hotelAccRatePerDay = toNum(dto.hotelAccRatePerDay);
            adv.accHToDutyPerDay = toNum(dto.accHToDutyPerDay);

            // ---------- UNIT LIST + APPLIED TO ----------
            if (Array.isArray(dto.unitList)) {
              adv.unitList = dto.unitList;
            } else if (
              Array.isArray(obj.yatTempDutyAdvDTOs) &&
              obj.yatTempDutyAdvDTOs.length > 0 &&
              Array.isArray(obj.yatTempDutyAdvDTOs[0].unitList)
            ) {
              adv.unitList = obj.yatTempDutyAdvDTOs[0].unitList;
            } else {
              adv.unitList = [];
            }

            adv.appliedTo =
              (dto.appliedTo ?? adv.videPresentUnit ?? adv.presentUnit ?? adv.appliedTo ?? '')
                .toString()
                .trim() || null;

            this.mapTyBankDetails(obj);

            // ---------- FINAL CLAIM OBJECT ----------
            this.claims = {
              ...this.claims,
              ...obj,
              yatTempDutyAdvDTOs: [{ ...adv }],
              yatDtsDetailDTOs: this.normalizeTyDtsRows(obj.yatDtsDetailDTOs || []),
              yatDocsDTOs: obj.yatDocsDTOs || [],
            };

            this.claims.signWith =
              obj.signWith || this.claims.signWith || this.codeSignType.eSign;
            this.documentDtos = this.claims.yatDocsDTOs || [];
            this.$codeDocInfo.setDocument(this.documentDtos as []);
          } else {
            // Legacy TY advance fills personal fields from yatTempDutyAdvDTOs[0].
            // Avoid flattened/user-root fallbacks here so Advance and Claim
            // contracts stay separate.
            this.mapTyBankDetails(obj);
          }

          const mappedAdv = this.claims.yatTempDutyAdvDTOs?.[0];
          this.changeTransType(mappedAdv?.tempTransferToType || null, this.codeClaim.tyAdv);
          this.syncGxFileBrowseState();
          this.checkForPreviewBtn();
        },
        (error) => {
          this.$common.hideLoader();
          console.error('Error while loading TY Duty Advance details.', error);
          this.$common.showMessage(
            'Error while loading TY Duty Advance details.',
            'danger'
          );
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      console.error('Error while pre-filling user details for TY Advance', e);
      this.$common.showMessage(
        'Error while pre-filling user details for TY Advance.',
        'danger'
      );
    }
  }

  checkForPreviewBtn(): void {
    this.isPreviewDisabled = !this.claims.claimId;
  }

  getUnits() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      this.$claim.getUnits(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;
            this.allUnits = list;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.error('Error while loading TY units.', err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.error('Error while loading TY units.', error);
    }
  }

  getStations() {
    try {
      this.config = {
        headers: {},
      };
      this.$claim.getStations(this.config).subscribe(
        (response: any) => {
          if (response.status === true) {
            this.allStations = Array.isArray(response.object)
              ? response.object
              : [];
          }
        },
        (err) => {
          console.error('Error while loading TY stations.', err);
        }
      );
    } catch (error) {
      console.error('Error while loading TY stations.', error);
    }
  }

  changeTransType(tempTransferToType: string | null, type: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    const adv = this.claims.yatTempDutyAdvDTOs[0];

    if (tempTransferToType === 'Others') {
      this.hideStationOrUnit = true;
      this.hideStationAndUnit = true;
      this.hideShowOtherUnit = false;
      adv.tempTransTo = null;
      adv.stationProceedingTo = null;
    } else if (
      tempTransferToType === 'CG Unit' ||
      tempTransferToType === 'Army Unit' ||
      tempTransferToType === 'Naval Unit' ||
      tempTransferToType === 'Air Force Unit'
    ) {
      this.hideStationOrUnit = false;
      this.hideStationAndUnit = true;
      this.hideShowOtherUnit = false;
      adv.dutyStation = null;
    } else {
      this.hideStationOrUnit = false;
      this.hideStationAndUnit = false;
      this.hideShowOtherUnit = false;
      adv.dutyStation = null;
      adv.tempTransTo = null;
      adv.stationProceedingTo = null;
    }
  }

  checkValidSignType(signWith: string | null, appliedTo: string | null): void {
    // Add sign/appliedTo validation if needed
  }
  navigatePreview(type, id) {
    const route = type || this.getPreviewRoute();
    const previewId = id || this.claims.claimId || this.claimIdParam;
    if (!route || !previewId) {
      return;
    }

    const isClaimPreview = this.activeFormKind === 'claim' || route.includes('claim');
    const queryParams = isClaimPreview
      ? {
          id: previewId,
          subFormId: this.activeSubFormId,
          ...(this.supplementryId ? { supId: this.supplementryId } : {}),
        }
      : {
          id: previewId,
          ...(this.supplementryId ? { supId: this.supplementryId } : {}),
        };

    const queryString = Object.entries(queryParams)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&');
    const moduleUrl = this.getModuleUrl();
    const previewUrl = `${moduleUrl}/${route}${queryString ? `?${queryString}` : ''}`;
    window.open(previewUrl, '_blank');
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

    if (this.supplementryId && savedClaimId) {
      this.router.navigate([moduleUrl + `/${this.getCurrentFormRoute()}`], {
        queryParams: {
          ...(this.activeFormKind === 'claim'
            ? { id: savedClaimId }
            : { id: savedClaimId }),
          supId: this.supplementryId,
        },
      });
      return;
    }

    this.router.navigateByUrl(moduleUrl + `/draft`);
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
      this.$common.showMessage(
        `Unable to update ${
          this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
        } status.`,
        'danger'
      );
      this.$common.hideLoader();
      this.disableBtn = false;
      return;
    }

    const payload = this.buildClaimRemarkPayload(status, claimId);
    const isESignSubmit =
      status === this.codeClaimState.outbox &&
      this.claims?.signWith === this.codeSignType.eSign;
    const statusRequest = isESignSubmit
      ? this.$claim.prepareForESign(payload)
      : this.$claim.changeClaimStatusById(payload);

    statusRequest.subscribe(
      (res: any) => {
        if (res?.status === false) {
          this.$common.showMessage(
            res?.message ||
              `Unable to update ${
                this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
              } status.`,
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
          return;
        }

        this.$claim.notifyStatusCountRefresh();
        if (isESignSubmit) {
          this.eSignTempFormObj = {
            id: claimId,
            claimId,
            roleTypeId: this.userIdDetails?.roleTypeId,
            userId: this.userIdDetails?.userId,
            status,
            remark: '',
            financialYear: this.userIdDetails?.financialYear,
            moduleId:
              this.userIdDetails?.moduleId ||
              (this.$auth.getRuntimeModuleId ? this.$auth.getRuntimeModuleId() : undefined),
          };
          if (typeof $ !== 'undefined') {
            $('#esign_modal').modal('show');
          }
        } else if (status === this.codeClaimState.outbox) {
          const moduleUrl = this.getModuleUrl();
          if (moduleUrl) {
            this.router.navigateByUrl(moduleUrl + '/new');
          }
        }

        this.$common.hideLoader();
        this.disableBtn = false;
      },
      (err: any) => {
        console.error(
          `Error while updating ${
            this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
          } status`,
          err
        );
        this.$common.showMessage(
          `Error while updating ${
            this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
          } status.`,
          'danger'
        );
        this.$common.hideLoader();
        this.disableBtn = false;
      }
    );
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

    this.$claim.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status === false) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message ||
              `eSign is not available for this ${
                this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
              }.`,
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

  openGxFormModel(type): void {
    // GX form modal logic
  }

  private syncGxFileBrowseState(): void {
    this.showGxFileBrowse = !this.claims?.gxFormFileUrl;
  }

  clearChangeData(): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) return;

    const type = adv.purposeType;

    // If user chooses "Other", clear guest details
    if (type === this.purposeType.other) {
      adv.personName = null;
      adv.relation = null;
      adv.age = null;
      adv.gender = null;
    }

    // If user chooses "Investiture Ceremony", clear free-text purpose
    if (type === this.purposeType.investive) {
      adv.purpose = null;
    }
  }

  validateAge(): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
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
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) return;

    let val: any = adv.duration;
    val = String(val).replace(/[^0-9]/g, '');
    let num = Number(val);
    if (!num || num < 1) {
      adv.duration = null;
      return;
    }

    if (num > 180) {
      num = 180;
    }

    adv.duration = num;
  }

  allowOnlyAlphabets(event: any): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
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

  getTransBasicPay(): void {
    // Basic pay / pay level logic
  }

  removeEmoji(): void {
    if (this.claims.internalRemarks) {
      this.claims.internalRemarks = this.claims.internalRemarks.replace(
        /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        ''
      );
    }
  }

  // Save TY Duty form
  saveClaim(
    type: string,
    status: string,
    isAlreadyConverted: boolean = false
  ): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    this.calculateAmount(this.codeClaim.tyAdv);
    this.disableBtn = true;
    this.$common.showLoader();

    try {
      const tempClaim: any = JSON.parse(JSON.stringify(this.claims));
      tempClaim.claimAmt = tempClaim.yatTempDutyAdvDTOs?.[0]?.advAmt ?? 0;

      if (tempClaim.yatTempDutyAdvDTOs) {
        if (!Array.isArray(tempClaim.yatTempDutyAdvDTOs)) {
          tempClaim.yatTempDutyAdvDTOs = [tempClaim.yatTempDutyAdvDTOs];
        }
      } else {
        tempClaim.yatTempDutyAdvDTOs = [];
      }
      tempClaim.yatTempDutyAdvDTOs.forEach((adv: any) => {
        delete adv.presentUnit; // backend only knows videPresentUnit
      });

      if (Array.isArray(tempClaim.yatDtsDetailDTOs)) {
        tempClaim.yatDtsDetailDTOs.forEach((elem: any) => {
          elem.amount =
            this.normalizeAmountNumber(elem.tempAmount, null) ??
            this.normalizeAmountNumber(elem.amount, 0);
          delete elem.tempAmount;
          delete elem._reasonForNoDtsError;
        });
      }

      if (status === this.codeClaimState.outbox) {
        tempClaim.claimState = this.codeClaimState.outbox;
      }

      if (this.userIdDetails && this.userIdDetails.roleTypeId) {
        tempClaim.roleTypeId = this.userIdDetails.roleTypeId;
      }

      if (!tempClaim.aclUserDTO && this.userIdDetails?.userId) {
        tempClaim.aclUserDTO = { userId: this.userIdDetails.userId };
      }

      tempClaim.codeSubFormDTO = {
        ...(tempClaim.codeSubFormDTO || {}),
        subFormId: this.activeSubFormId,
      };
      if (tempClaim.codeUnitDTO && this.claims?.codeUnitDTO?.unit) {
        tempClaim.codeUnitDTO = {
          unit: this.claims.codeUnitDTO.unit,
        };
      }

      if (!tempClaim.signWith) {
        tempClaim.signWith = 'ES';
      }
      if (this.supplementryId) {
        tempClaim.supClaimId = this.supplementryId;
      }
      if (this.resubClaimId) {
        tempClaim.refAdvanceId = this.resubClaimId;
      }
      if (this.extnClaimId) {
        tempClaim.extendedAdvId = this.extnClaimId;
      }
      tempClaim.yatDocsDTOs = this.mapClaimDocumentsForSave(this.documentDtos);

      tempClaim.ifscnull = !tempClaim.yatClaimBankDetailDTO?.ifscCode;

      if (tempClaim.occDate) {
        tempClaim.occDate = new Date(tempClaim.occDate).getTime();
      }

      if (Array.isArray(tempClaim.yatTempDutyAdvDTOs)) {
        tempClaim.yatTempDutyAdvDTOs.forEach((adv: any) => {
          adv.gxDate = this.UtilService.toMillis(adv.gxDate);
          adv.date = this.UtilService.toMillis(adv.date);
          adv.wefDate = this.UtilService.toMillis(adv.wefDate);
        });
      }

      tempClaim.occDate = this.UtilService.toMillis(tempClaim.occDate);
      tempClaim.subDate = this.UtilService.toMillis(tempClaim.subDate);
      tempClaim.reportingDate = this.UtilService.toMillis(
        tempClaim.reportingDate
      );
      tempClaim.voucherDate = this.UtilService.toMillis(tempClaim.voucherDate);
      tempClaim.dob = this.UtilService.toMillis(tempClaim.dob);

      const formData = new FormData();
      formData.append('yatClaimDTO', JSON.stringify(tempClaim));

      this.$claim.createOrUpdateAdvance(formData, null).subscribe(
        (res: any) => {
          if (!res || res?.status === false) {
            this.$common.showMessage(
              res?.message ||
                `Unable to save ${
                  this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
                }.`,
              'danger'
            );
            this.$common.hideLoader();
            this.disableBtn = false;
            return;
          }

          const obj = Array.isArray(res?.object)
            ? res.object[0]
            : res?.object || res?.obj || res;
          const respStatus = status;

          if (obj.id || obj.claimId) {
            this.claims.claimId = obj.claimId || obj.id;
          }
          this.mergeSavedTyResponse(obj);
          if (this.resubClaimId) {
            (this.claims as any).refAdvanceId = this.resubClaimId;
          }
          if (this.extnClaimId) {
            (this.claims as any).extendedAdvId = this.extnClaimId;
          }

          if (respStatus === this.codeClaimState.outbox) {
            this.$common.showMessage(
              res?.message ||
                `${
                  this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
                } submitted successfully!`,
              'success'
            );
          } else if (respStatus === this.codeClaimState.draft) {
            this.$common.showMessage(
              res?.message ||
                `${
                  this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
                } draft saved successfully.`,
              'success'
            );
          }
          this.completeLegacyStatusTransition(
            respStatus,
            obj.claimId || obj.id || this.claims.claimId || this.claimIdParam
          );
        },
        (err: any) => {
          console.error(
            `Error while saving ${
              this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
            }`,
            err
          );
          this.$common.showMessage(
            `Error while saving ${
              this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
            }.`,
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error(
        `Error while saving ${
          this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
        }`,
        err
      );
      this.$common.showMessage(
        `Error while saving ${
          this.activeFormKind === 'claim' ? 'TY Duty claim' : 'TY Duty advance'
        }.`,
        'danger'
      );
      this.$common.hideLoader();
      this.disableBtn = false;
    }
  }

  private resolveFormKind(rawFormKind: any): 'advance' | 'claim' {
    if (String(rawFormKind || '').toLowerCase() === 'claim') {
      return 'claim';
    }
    const routePath = this.route.snapshot.routeConfig?.path || '';
    return routePath.includes('claim') ? 'claim' : 'advance';
  }

  private getCurrentFormRoute(): string {
    return this.activeFormKind === 'claim' ? 'form-ty-duty-claim' : 'form-ty-duty';
  }

  private getPreviewRoute(): string {
    return this.activeFormKind === 'claim' ? 'preview-ty-duty-claim' : 'preview-ty-duty';
  }

  // TAB NAVIGATION (NEXT / PREVIOUS)
  // private getTabLinks(): HTMLAnchorElement[] {
  //   return Array.from(
  //     document.querySelectorAll<HTMLAnchorElement>('.nav-tabs li a')
  //   );
  // }

  // private getActiveTabIndex(tabLinks: HTMLAnchorElement[]): number {
  //   return tabLinks.findIndex((a) =>
  //     a.parentElement?.classList.contains('active')
  //   );
  // }

  // nextTabActive(): void {
  //   const tabLinks = this.getTabLinks();
  //   if (!tabLinks.length) return;

  //   const activeIndex = this.getActiveTabIndex(tabLinks);
  //   if (activeIndex === -1 || activeIndex >= tabLinks.length - 1) return;

  //   this.activateTabByIndex(activeIndex + 1);
  // }

  // previousTabActive(): void {
  //   const tabLinks = this.getTabLinks();
  //   if (!tabLinks.length) return;

  //   const activeIndex = this.getActiveTabIndex(tabLinks);
  //   if (activeIndex <= 0) return;

  //   this.activateTabByIndex(activeIndex - 1);
  // }

  // private activateTabByIndex(index: number): void {
  //   const tabLinks = this.getTabLinks();
  //   if (!tabLinks.length || index < 0 || index >= tabLinks.length) {
  //     return;
  //   }

  //   const targetLink = tabLinks[index];

  //   // Deactivate all tab headers
  //   tabLinks.forEach((a) => {
  //     a.classList.remove('active');
  //     a.parentElement?.classList.remove('active');
  //   });

  //   // Deactivate all tab panes
  //   const panes = document.querySelectorAll<HTMLElement>('.tab-pane');
  //   panes.forEach((p) => p.classList.remove('active', 'in'));

  //   // Activate the header for the target tab
  //   targetLink.classList.add('active');
  //   targetLink.parentElement?.classList.add('active');

  //   // Extract only the hash part from href (e.g. "#ship2")
  //   const rawHref = targetLink.getAttribute('href') || '';
  //   const hash =
  //     rawHref.indexOf('#') >= 0
  //       ? rawHref.substring(rawHref.indexOf('#'))
  //       : rawHref;

  //   // Activate the corresponding pane
  //   if (hash) {
  //     const pane = document.querySelector<HTMLElement>(hash);
  //     if (pane) {
  //       pane.classList.add('active', 'in');
  //     }
  //   }
  // }

  openExtendedDutyModal(_userId: number | null, _type: string): void {
    // Extended duty modal logic
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

    // 3) Proceed with upload
    this.gxFormUploading = true;
    this.$formManage?.uploadImg(event);

    this.$formManage?.docFileUrl.subscribe((res: unknown) => {
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
    });
  }

  deleteGxForm(): void {
    if (!this.claims?.gxFormFileUrl) {
      return;
    }

    // optional confirm – keep or remove as you like
    const ok = window.confirm('Do you really want to delete this GX Form?');
    if (!ok) {
      return;
    }

    (this.claims as any).deleteGxFileUrl = this.claims.gxFormFileUrl;
    this.claims.gxFormFileUrl = null;
    this.gxFormModel = null;
    this.showGxFileBrowse = true;
  }

  getPurposeTypes(): void {
    try {
      this.$common.showLoader();

      const config = { headers: {} };

      // You must have a method in DropdownManageService like:
      // getPurposeTypes(config): Observable<any>
      this.$dropdownManage.getPurposeTypes(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.$common.showMessage(
              response?.message || 'Unable to load purpose types.',
              'danger'
            );
            return;
          }

          const arr = response.object || [];
          this.purposeTypes = arr;
        },
        (err) => {
          this.$common.hideLoader();
          console.error('Error while loading purpose types', err);
          this.$common.showMessage(
            'Error while loading purpose types.',
            'danger'
          );
        }
      );
    } catch (err) {
      this.$common.hideLoader();
      console.error('Exception in getPurposeTypes()', err);
      this.$common.showMessage(
        'Unexpected error while loading purpose types.',
        'danger'
      );
    }
  }
  private getTabLinks(): HTMLAnchorElement[] {
    return Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.nav-tabs.custom-tabs li a')
    );
  }

  private getActiveTabIndex(tabLinks: HTMLAnchorElement[]): number {
    // Bootstrap marks the parent <li> as active
    return tabLinks.findIndex((a) =>
      a.parentElement?.classList.contains('active')
    );
  }

  nextTabActive(): void {
    const tabLinks = this.getTabLinks();
    if (!tabLinks.length) return;

    const activeIndex = this.getActiveTabIndex(tabLinks);
    if (activeIndex === -1 || activeIndex >= tabLinks.length - 1) return;

    const targetLink = tabLinks[activeIndex + 1];
    // Let Bootstrap handle all classes (`active`, `show`, etc.)
    targetLink.click();
  }

  previousTabActive(): void {
    const tabLinks = this.getTabLinks();
    if (!tabLinks.length) return;

    const activeIndex = this.getActiveTabIndex(tabLinks);
    if (activeIndex <= 0) return;

    const targetLink = tabLinks[activeIndex - 1];
    targetLink.click();
  }

  // You can delete this method entirely if you only use next/previous:
  private activateTabByIndex(index: number): void {
    const tabLinks = this.getTabLinks();
    if (!tabLinks.length || index < 0 || index >= tabLinks.length) return;

    const targetLink = tabLinks[index];
    targetLink.click();
  }

  openIfscModal() {
    this.newIfscCode = this.claims?.yatClaimBankDetailDTO?.ifscCode || '';
    this.showIfscModal = true;
  }

  closeIfscModal() {
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

    if (this.claims?.claimId) {
      config.headers.claimId = this.claims.claimId;
    }

    this.$common.showLoader();
    this.$claim.createOrUpdateIfsc(bankObj, config).subscribe({
      next: (response: any) => {
        const data: any = this.$common.parseResponse(response);
        this.$common.hideLoader();

        if (data && data.status === true) {
          if (this.claims?.yatClaimBankDetailDTO) {
            this.claims.yatClaimBankDetailDTO.ifscCode =
              data.object?.[0]?.ifscCode || ifscCode;
          }

          const msg = data.message || 'IFSC Code updated successfully.';
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
        this.$common.hideLoader();
        console.error('Error while updating IFSC:', err);
        this.$common.showMessage('Error while updating IFSC code.', 'danger');
      },
    });
  }

  validateFormBeforeNext() {
    this.showErrors = true;

    if (!this.claims?.gxFormFileUrl) {
      this.$common.showMessage('Please upload Gx Form (PDF).', 'error');
      return;
    }
  }

  private runTyClientValidationOnly(): boolean {
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
      this.$common.showMessage('Please fill required fields.', 'danger');
      return false;
    }

    return true;
  }

  validateTy(type: string): void {
    if (type !== this.codeClaim.tyAdv && type !== this.activeSubFormId) return;

    try {
      const okSections = this.runTyClientValidationOnly();
      if (!okSections) return;

      const okBusiness = this.validateTyBusinessFields();
      if (!okBusiness) {
        this.activateTab(this.tyBusinessInvalidSection || 'ship');
        return;
      }

      this.$common.showMessage(
        'Validation successful. Please submit the form to proceed.',
        'success'
      );
    } catch (err) {
      console.error('Error during TY validation', err);
    }
  }

  submitTy(): void {
    const okSections = this.runTyClientValidationOnly();
    if (!okSections) return;

    const okBusiness = this.validateTyBusinessFields();
    if (!okBusiness) {
      this.activateTab(this.tyBusinessInvalidSection || 'ship');
      return;
    }

    this.saveClaim(this.codeClaim.tyAdv, this.codeClaimState.outbox, true);
  }

  private validateTyBusinessFields(): boolean {
    this.tyBusinessInvalidSection = 'ship';

    if (!this.claims?.codeUnitDTO?.unit) {
      this.$common.showMessage('Please select the applied to unit.', 'danger');
      return false;
    }

    const adv = this.claims?.yatTempDutyAdvDTOs?.[0];
    if (!adv) {
      this.$common.showMessage('Temporary duty details are required.', 'danger');
      return false;
    }

    const authorityLabel = this.extnClaimId || this.claims?.extendedAdvId ? 'Authority' : 'Gx';

    if (this.isNullOrEmpty(adv.gxUnit)) {
      this.$common.showMessage(`Please select ${authorityLabel} Unit.`, 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxNumber)) {
      this.$common.showMessage(`Please fill ${authorityLabel} Number.`, 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxDate)) {
      this.$common.showMessage(`Please select ${authorityLabel} Date.`, 'danger');
      return false;
    }

    if (!this.claims?.gxFormFileUrl) {
      this.showErrors = true;
      this.$common.showMessage(`Please upload ${authorityLabel} Form (PDF).`, 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.purposeType)) {
      this.$common.showMessage('Please select Purpose Type.', 'danger');
      return false;
    }

    if (adv.purposeType === this.purposeType.other && this.isNullOrEmpty(adv.purpose)) {
      this.$common.showMessage('Please fill Purpose of Ty Duty.', 'danger');
      return false;
    }

    if (adv.purposeType === this.purposeType.investive) {
      if (this.isNullOrEmpty(adv.personName)) {
        this.$common.showMessage('Please fill Guest Name.', 'danger');
        return false;
      }
      if (this.isNullOrEmpty(adv.relation)) {
        this.$common.showMessage('Please fill Guest Relation.', 'danger');
        return false;
      }
      if (this.isNullOrEmpty(adv.age)) {
        this.$common.showMessage('Please fill Guest Age.', 'danger');
        return false;
      }
      if (this.isNullOrEmpty(adv.gender)) {
        this.$common.showMessage('Please select Guest Gender.', 'danger');
        return false;
      }
    }

    if (!this.hideStationOrUnit && this.hideStationAndUnit) {
      if (this.isNullOrEmpty(adv?.tempTransTo)) {
        this.$common.showMessage('Please select Name of Unit.', 'danger');
        return false;
      }
      if (this.isNullOrEmpty(adv?.stationProceedingTo)) {
        this.$common.showMessage('Please select Station proceeding to.', 'danger');
        return false;
      }
    }

    if (this.hideStationOrUnit && this.hideStationAndUnit) {
      if (this.isNullOrEmpty(adv?.dutyStation)) {
        this.$common.showMessage('Please fill Duty Station to.', 'danger');
        return false;
      }
    }

    this.tyBusinessInvalidSection = 'ship3';

    if (adv?.isAvailFoodCharge) {
      if (
        this.isNullOrEmpty(adv.foodChargeDays) ||
        this.isNullOrEmpty(adv.foodChargeRatePerDay)
      ) {
        this.$common.showMessage(
          'Please fill food charge days and rate per day.',
          'danger'
        );
        return false;
      }
    }

    if (adv?.isAvailHotelAcc) {
      if (
        this.isNullOrEmpty(adv.hotelAccDays) ||
        this.isNullOrEmpty(adv.hotelAccRatePerDay)
      ) {
        this.$common.showMessage(
          'Please fill hotel accommodation days and rate per day.',
          'danger'
        );
        return false;
      }
    }

    if (adv?.isAvailArr) {
      if (
        this.isNullOrEmpty(adv.arrToDutyRate) ||
        this.isNullOrEmpty(adv.arrToDutyKm)
      ) {
        this.$common.showMessage(
          'Please fill ARR to duty rate and kilometers.',
          'danger'
        );
        return false;
      }
    }

    if (adv?.isAvailAcc) {
      if (
        this.isNullOrEmpty(adv.accHToDutyPerDay) ||
        this.isNullOrEmpty(adv.accHToDutyDays)
      ) {
        this.$common.showMessage(
          'Please fill accommodation to duty days and rate per day.',
          'danger'
        );
        return false;
      }
      if (
        this.isAvailedCategoryOneOrTwo(adv.availedCategory) &&
        this.isNullOrEmpty(adv.accHToDutyKms)
      ) {
        this.$common.showMessage(
          'Please fill accommodation to duty kilometers.',
          'danger'
        );
        return false;
      }
    }

    this.tyBusinessInvalidSection = 'ship2';

    if (!Array.isArray(this.claims.yatDtsDetailDTOs) || this.claims.yatDtsDetailDTOs.length === 0) {
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
      this.$common.showMessage(message, 'danger');
      return false;
    }

    this.tyBusinessInvalidSection = 'ship4';
    const bank = this.claims?.yatClaimBankDetailDTO || {};
    if (this.isNullOrEmpty(bank.ifscCode)) {
      this.$common.showMessage('Please fill IFSC Code.', 'danger');
      return false;
    }
    if (this.isNullOrEmpty(bank.bankAccNo || bank.accountNo)) {
      this.$common.showMessage('Account Number is required.', 'danger');
      return false;
    }

    this.tyBusinessInvalidSection = null;
    return true;
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

