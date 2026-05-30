import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/service/util.service';
import { AuthService } from 'src/app/service/auth.service';
import { DropdownManageService } from 'src/app/service/dropdownManage.service';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { FormStateService } from 'src/app/service/formState.service';
import { MasterShipService } from 'src/app/service/master/master-ship.service';
import { UserService } from 'src/app/service/user.service';
import { CommonService } from 'src/app/service/common.service';
import { ClaimService } from 'src/app/service/claim.service';
import { ClaimUtilService } from 'src/app/service/claimUtil.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';

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
  availedCategory?: number | null; // 0/1/2...

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
    tyAdv: 'TYA', // match backend code
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

  ltcTravelDetailsBtn = false;
  travelBtnName = 'Add';

  isGSTAvailed = false;
  showGxFileBrowse = false;

  fileUrl = window.location.origin;
  gxUnitId: number | null = null;

  tempLtcTravelDetails: YatDtsDetailDTO = {};
  selectedTravelIndex: number | null = null;

  claimIdParam: string | null = null;
  extnClaimId: string | null = null;
  selectedUserForTyDuty: any;

  showIfscModal = false;
  newIfscCode: string = '';
  claimId: any;
  gxFormModel: any;
  showErrors: any;

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
    private $ship: MasterShipService,
    private $user: UserService,
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
    this.getUnits();
    this.userIdDetails = this.$auth.getUserDetails();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.codeStatus = this.$auth?.codeStatus();

    // if (!this.claims.signWith) {
    //   this.claims.signWith = this.codeSignType.eSign;
    // }
    this.getPurposeTypes();
    this.$codeDocInfo.documentDtos.subscribe((docs: any) => {
      this.documentDtos = Array.isArray(docs) ? docs : [];
    });
    this.route.queryParams.subscribe((params) => {
      this.formId = params?.id;
      this.subFormId = params?.subFormId;
      this.supplementryId = params?.supId;
      if (this.supplementryId) this.supplementryClaim = 'Supplementary ';

      this.getFormDetails();
    });
  }

  private loadTyPersonalFromForm(): void {
    const adv = this.claims.yatTempDutyAdvDTOs[0];
    if (!adv) {
      return;
    }

    // EXACTLY SAME CONFIG AS YOUR /single REQUEST (you already see this in Network tab)
    const config = {
      headers: {
        subFormId: 'T', // TY Duty Advance subform
        isPreview: 'false',
        byUser: 'true',
      },
    };

    try {
      this.$common.showLoader();

      // Use the same service you are already using for "single" in Pilotage
      this.$form.getSingleForm(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.$common.showMessage(
              response?.message || 'Unable to load parent TY Duty data.',
              'danger'
            );
            return;
          }

          // RESPONSE IS ARRAY -> TAKE FIRST OBJECT
          const parent: any = (response.object && response.object[0]) || {};

          // Personal header from parent.yatTempDutyAdvDTOs[0] if present
          const srcAdv: any =
            (parent.yatTempDutyAdvDTOs && parent.yatTempDutyAdvDTOs[0]) ||
            parent;

          // ---- BASIC PERSONAL FIELDS ----
          adv.pno = srcAdv.pno || parent.pno || adv.pno || null;

          adv.name =
            (srcAdv.name || parent.name || '').trim() || adv.name || null;

          adv.rank = srcAdv.rank || parent.rank || adv.rank || null;

          // UNIT / PRESENT UNIT
          const presentUnit =
            srcAdv.presentUnit ||
            parent.presentUnit ||
            parent.codeUnitDTO?.descr ||
            parent.unitName ||
            parent.unit ||
            null;

          adv.presentUnit = presentUnit;
          adv.videPresentUnit = presentUnit;

          this.preSelectedUnit = presentUnit;

          // PAY LEVEL + BASIC PAY
          const payLevel =
            srcAdv.payLevel ||
            srcAdv.payLevel ||
            parent.payLevel ||
            parent.payLevel ||
            null;

          adv.payLevel = payLevel;
          adv.payLevel = payLevel;

          const basicPayRaw =
            srcAdv.basicPay ||
            srcAdv.basPay ||
            parent.basicPay ||
            parent.basPay ||
            null;

          adv.basicPay = basicPayRaw != null ? Number(basicPayRaw) : null;

          // ---- BANK DETAILS FROM PARENT ----
          const bank: any = parent.yatClaimBankDetailDTO || {};
          this.claims.yatClaimBankDetailDTO = {
            ...this.claims.yatClaimBankDetailDTO,
            bankName:
              bank.bankName || this.claims.yatClaimBankDetailDTO.bankName,
            branch: bank.branch || this.claims.yatClaimBankDetailDTO.branch,
            ifscCode:
              bank.ifscCode || this.claims.yatClaimBankDetailDTO.ifscCode,
            accountNo:
              bank.bankAccNo ||
              bank.accountNo ||
              this.claims.yatClaimBankDetailDTO.accountNo,
            micrCode:
              bank.micrCode || this.claims.yatClaimBankDetailDTO.micrCode,
            bankAccNo:
              bank.bankAccNo || this.claims.yatClaimBankDetailDTO.bankAccNo,
          };

          // OPTIONAL: set claim-level pno/name if you need it later
          this.claims.claimId = parent.claimId || this.claims.claimId;

          // Now UI can show, provided your HTML uses:
          // [(ngModel)]="claims.yatTempDutyAdvDTOs[0].pno" etc.
        },
        (err) => {
          this.$common.hideLoader();
          console.error('Error loading TY Duty parent form details', err);
          this.$common.showMessage(
            'Error while loading TY Duty parent form details.',
            'danger'
          );
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      console.error('Exception loading TY Duty parent form details', e);
    }
  }

  // ====== rest of your methods (createEmptyClaims, calculateAmount, getFormDetails, etc.) ======

  bankObj;
  private initFromRoute(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.claimIdParam = qp.get('claimId');
    this.extnClaimId = qp.get('extnClaimId');
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
        accountNo: null,
        micrCode: null,
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
      isDts: null,
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
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  }

  private sumOfColumn(arr: any[], key: string): number {
    return arr.reduce((sum, item) => sum + this.toNumber(item?.[key]), 0);
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
        if (adv.availedCategory === 1 || adv.availedCategory === 2) {
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

    if ((detail.modeOfTravel || '').trim() === 'Others') {
      const otherMode = detail.otherModeOfTravel
        ? detail.otherModeOfTravel.trim()
        : '';
      if (!otherMode) {
        this.$common.showMessage(
          'Please fill Other Mode of Travel when mode is Others.',
          'danger'
        );
        return;
      }
    }

    if (detail.isDts === 'No') {
      const reason = detail.reasonForNoDts ? detail.reasonForNoDts.trim() : '';

      if (!reason) {
        detail._reasonForNoDtsError = true;
        this.$common.showMessage(
          'Reason for not using DTS is required when DTS is No.',
          'error'
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

    if (this.selectedTravelIndex !== null) {
      this.claims.yatDtsDetailDTOs[this.selectedTravelIndex] = { ...detail };
    } else {
      this.claims.yatDtsDetailDTOs.push({ ...detail });
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
    this.travelBtnName = 'Update';
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

  resetTempLtcTravelDetails(): void {
    this.tempLtcTravelDetails = {} as YatDtsDetailDTO;
    this.selectedTravelIndex = null;
    this.travelBtnName = 'Add';
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

  actionPage(data) {
    const moduleUrl = this.$auth.getModuleName();
    const url = this.$auth.openPageInNewTab();
    const fullUrl = url + moduleUrl + `/preview-details?id=${data.id}`;
    window.open(fullUrl, '_blank');
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
    this.router.navigate([route], {
      queryParams: {
        claimId: this.claims.claimId,
        ...(this.supplementryId ? { supId: this.supplementryId } : {}),
      },
    });
  }

  // FORM VALIDATE (TY ADVANCE)
  validate(type: string, status: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    try {
      const sectionIds = ['ship', 'ship2', 'ship3', 'ship4'];
      let firstInvalidSection: string | null = null;
      let allValid = true;

      for (const sectionId of sectionIds) {
        const sectionValid = this.validateSection(sectionId);
        if (!sectionValid) {
          allValid = false;
          if (!firstInvalidSection) {
            firstInvalidSection = sectionId;
          }
        }
      }

      if (!allValid) {
        if (firstInvalidSection) {
          this.activateTab(firstInvalidSection);
        }
        this.$common.showMessage('Please fill required fields.', 'danger');
        return;
      }

      this.saveClaim(this.codeClaim.tyAdv, this.codeClaimState.outbox, true);
    } catch (err) {
      console.error('Error during form validation', err);
    }
  }

  private validateSection(sectionId: string): boolean {
    const section = document.getElementById(sectionId);
    if (!section) {
      return true;
    }

    let isValid = true;

    const elements = section.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('input, select, textarea');

    elements.forEach((el) => {
      const required = el.hasAttribute('required');
      let value: string | boolean = '';

      if (
        el instanceof HTMLInputElement &&
        (el.type === 'checkbox' || el.type === 'radio')
      ) {
        value = el.checked;
      } else {
        value = (el.value || '').trim();
      }

      (el as HTMLElement).style.borderColor = '';

      if (required && (!value || value === '')) {
        isValid = false;
        (el as HTMLElement).style.borderColor = 'red';
      }
    });

    return isValid;
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
        gxUnitId: this.userIdDetails?.unitId ?? '',
        userId: this.userIdDetails?.userId ?? '',
        subFormId: 'T',
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
            this.$common.showMessage(
              response?.message || 'Unable to load TY Duty Advance details.',
              'danger'
            );
            return;
          }

          let obj: any = response.object;
          if (Array.isArray(obj)) {
            obj = obj[0] || null;
          }
          if (!obj) {
            this.$common.showMessage('No data returned from server.', 'danger');
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

            // ---------- PERSONAL DETAILS ----------
            adv.pno = dto.pno ?? obj.pno ?? adv.pno ?? null;
            adv.name =
              (dto.name ?? obj.name ?? adv.name ?? '').toString().trim() ||
              null;
            adv.rank = dto.rank ?? obj.rank ?? adv.rank ?? null;

            const presentUnit =
              dto.appliedTo ??
              dto.videPresentUnit ??
              obj.codeUnitDTO?.descr ??
              adv.presentUnit ??
              null;

            adv.presentUnit = presentUnit;
            adv.videPresentUnit = dto.videPresentUnit ?? presentUnit;

            // ---------- PAY LEVEL / BASIC PAY ----------
            const payLevel =
              dto.payLevel ??
              dto.payLevel ??
              obj.payLevel ??
              obj.payLevel ??
              adv.payLevel ??
              null;

            adv.payLevel = payLevel;
            adv.payLevel = payLevel;

            const basicPayRaw =
              dto.basicPay ??
              dto.basPay ??
              obj.basicPay ??
              obj.basPay ??
              adv.basicPay ??
              null;

            adv.basicPay = basicPayRaw != null ? Number(basicPayRaw) : null;

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
              (dto.appliedTo ?? presentUnit ?? adv.appliedTo ?? '')
                .toString()
                .trim() || null;

            // ---------- BANK DETAILS ----------
            const bank = obj.yatClaimBankDetailDTO || {};
            this.claims.yatClaimBankDetailDTO = {
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
                bank.bankAccNo ?? this.claims.yatClaimBankDetailDTO.bankAccNo,
            };

            // ---------- FINAL CLAIM OBJECT ----------
            this.claims = {
              ...this.claims,
              ...obj,
              yatTempDutyAdvDTOs: [{ ...adv }],
              yatDtsDetailDTOs: obj.yatDtsDetailDTOs || [],
              yatDocsDTOs: obj.yatDocsDTOs || [],
            };

            this.claims.signWith = this.codeSignType.eSign;
            this.documentDtos = this.claims.yatDocsDTOs || [];
            this.$codeDocInfo.setDocument(this.documentDtos as []);
          } else if (obj.userBasicDetailDTO) {
            const user = obj.userBasicDetailDTO;

            adv.pno = user.pno ?? user.persNo ?? null;
            adv.name = user.name ?? user.userName ?? null;
            adv.rank = user.rank ?? user.rankName ?? null;
            adv.videPresentUnit = user.unitName ?? user.unit ?? null;
            adv.presentUnit = adv.videPresentUnit;

            adv.payLevel = user.payLevel ?? user.payLevel ?? null;
            adv.payLevel = adv.payLevel;
            adv.basicPay = user.basicPay ?? user.basPay ?? null;
            adv.availedCategory = user.availedCategory ?? null;
          }

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
            debugger;
            this.allUnits = list;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  changeTransType(tempTransferToType: string | null, type: string): void {
    if (type !== this.codeClaim.tyAdv) {
      return;
    }

    const adv = this.claims.yatTempDutyAdvDTOs[0];

    if (tempTransferToType === 'SameUnit') {
      this.hideStationOrUnit = false;
      this.hideStationAndUnit = true;
      this.hideShowOtherUnit = false;
      adv.otherUnit = null;
    } else if (tempTransferToType === 'OtherUnit') {
      this.hideStationOrUnit = false;
      this.hideStationAndUnit = false;
      this.hideShowOtherUnit = false;
    } else if (tempTransferToType === 'Other') {
      this.hideShowOtherUnit = true;
    } else {
      this.hideStationOrUnit = false;
      this.hideStationAndUnit = false;
      this.hideShowOtherUnit = false;
    }
  }

  checkValidSignType(signWith: string | null, appliedTo: string | null): void {
    // Add sign/appliedTo validation if needed
  }
  navigatePreview(type, id) {
    this.router.navigate(['../form-tyduty-detail'], {
      queryParams: {
        claimId: id || this.claims.claimId || this.claimIdParam,
        subFormId: 'T',
        ...(this.supplementryId ? { supId: this.supplementryId } : {}),
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
      this.router.navigateByUrl(moduleUrl + `/submitted`);
      return;
    }

    if (this.supplementryId && savedClaimId) {
      this.router.navigate([moduleUrl + '/form-tyduty'], {
        queryParams: {
          claimId: savedClaimId,
          supId: this.supplementryId,
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
        gxUnitId: String(this.gxUnitId || this.userIdDetails?.unitId || ''),
      },
    };

    this.$claim.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status === false) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message || 'eSign is not available for this TY Duty claim.',
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

  // --- BANK: UPDATE IFSC CODE ---
  // updateIfscCode(): void {
  //   try {
  //     const bankObj: any = { ...(this.claims?.yatClaimBankDetailDTO || {}) };
  //     if (!bankObj) return;

  //     if (!bankObj.userId) {
  //       if ((this.claims as any)?.aclUserDTO?.userId) {
  //         bankObj.userId = (this.claims as any).aclUserDTO.userId;
  //       } else if (this.userIdDetails?.userId) {
  //         bankObj.userId = this.userIdDetails.userId;
  //       }
  //     }

  //     const headers: any = {};
  //     if (this.claims?.claimId) {
  //       headers.claimId = this.claims.claimId;
  //     }
  //     const config = { headers };

  //     this.$common.showLoader();

  //     this.$claim.createOrUpdateIfsc(bankObj, config).subscribe(
  //       (res: any) => {
  //         this.$common.hideLoader();

  //         if (!res) {
  //           this.$common.showMessage(
  //             'Unable to update IFSC Code (empty response).',
  //             'danger'
  //           );
  //           return;
  //         }

  //         if (res.status === true) {
  //           if (Array.isArray(res.object) && res.object[0]?.ifscCode) {
  //             this.claims.yatClaimBankDetailDTO.ifscCode =
  //               res.object[0].ifscCode;
  //           }
  //           this.$common.showMessage(
  //             res.message || 'IFSC Code updated successfully.',
  //             'success'
  //           );
  //         } else {
  //           this.$common.showMessage(
  //             res.message || 'Unable to update IFSC Code.',
  //             'danger'
  //           );
  //         }
  //       },
  //       (err) => {
  //         this.$common.hideLoader();
  //         console.error('Error while updating IFSC code', err);
  //         this.$common.showMessage('Error while updating IFSC Code.', 'danger');
  //       }
  //     );
  //   } catch (e) {
  //     this.$common.hideLoader();
  //     console.error('Exception in updateIfscCode()', e);
  //   }
  // }

  // keep other methods below or above, but still inside this class

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

  //Save TY Duty claim
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
          if (elem.tempAmount != null && elem.tempAmount !== '') {
            elem.amount = Number(elem.tempAmount);
          }
          delete elem.tempAmount;
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

      if (!tempClaim.codeSubFormDTO) {
        tempClaim.codeSubFormDTO = {
          subFormId: this.claims?.codeSubFormDTO?.subFormId ?? 'T',
        };
      }
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

      this.$claim.createOrUpdateClaim(formData, null).subscribe(
        (res: any) => {
          if (!res) {
            this.$common.hideLoader();
            this.disableBtn = false;
            return;
          }

          const obj = Array.isArray(res?.object)
            ? res.object[0]
            : res?.object || res?.obj || res;
          const respStatus = status;
          const moduleUrl = this.$auth.getModuleName
            ? this.$auth.getModuleName()
            : '';

          if (obj.id || obj.claimId) {
            this.claims.claimId = obj.claimId || obj.id;
          }

          if (respStatus === this.codeClaimState.outbox) {
            this.$common.showMessage(
              res?.message || 'TY Duty claim submitted successfully!',
              'success'
            );
          } else if (respStatus === this.codeClaimState.draft) {
            this.$common.showMessage(
              res?.message || 'TY Duty draft saved successfully.',
              'success'
            );
          }
          this.navigateAfterSave(
            respStatus,
            obj.claimId || obj.id || this.claims.claimId || this.claimIdParam
          );

          this.$common.hideLoader();
          this.disableBtn = false;
        },
        (err: any) => {
          console.error('Error while saving TY Duty claim', err);
          this.$common.showMessage(
            'Error while saving TY Duty claim.',
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error('Error while saving TY Duty claim', err);
      this.$common.showMessage('Error while saving TY Duty claim.', 'danger');
      this.$common.hideLoader();
      this.disableBtn = false;
    }
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
      input.value = '';
      return;
    }

    // 2) HARD SIZE LIMIT: 512 KB
    const maxSizeBytes = 512 * 1024; // 512 KB
    if (file.size > maxSizeBytes) {
      this.$common.showMessage('File size must be 512 KB or less.', 'danger');
      this.claims.gxFormFileUrl = null;
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
      } else {
        this.$common.showMessage('Unable to upload GX Form.', 'danger');
        this.claims.gxFormFileUrl = null;
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

    // call same delete API as in Pilotage
    this.$formManage?.deleteByUrl(this.claims.gxFormFileUrl);

    this.$formManage?.docFileUrlDeleted.subscribe((res) => {
      // if server deletion succeeds, clear local value
      this.claims.gxFormFileUrl = null;
    });
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

  updateIfscCodeResettlement(bankObj: any): void {
    try {
      // ----- 1. Prepare config & headers -----
      const config: any = { headers: {} };

      // userId same logic as AngularJS
      if (!bankObj.userId) {
        if (this.claims?.aclUserDTO?.userId) {
          bankObj.userId = this.claims.aclUserDTO.userId;
        }
      }

      // claimId header
      if (this.claims?.claimId) {
        config.headers.claimId = this.claims.claimId;
      }

      this.$common.showLoader();

      this.$claim.createOrUpdateIfsc(bankObj, config).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          // mimic $rootScope.parseResponse(response.data)
          const data = this.$common.parseResponse
            ? this.$common.parseResponse(response)
            : response.obj || response.object || response;

          // close modal
          ($('#ifscCodeModal') as any).modal('hide');

          // success branch
          if (data && data.status === true) {
            if (
              this.claims?.yatClaimBankDetailDTO &&
              data.object?.[0]?.ifscCode
            ) {
              this.claims.yatClaimBankDetailDTO.ifscCode =
                data.object[0].ifscCode;
            }

            const msg = data.message || 'IFSC Code updated successfully.';
            this.$common.showMessage(msg, 'success');
          } else {
            const msg = (data && data.message) || 'Unable to update IFSC Code.';
            this.$common.showMessage(msg, 'danger');
          }
        },
        (err) => {
          this.$common.hideLoader();
          ($('#ifscCodeModal') as any).modal('hide');

          const msg = `${err.status} : ${
            err.statusText || 'Error updating IFSC Code'
          }`;
          this.$common.showMessage(msg, 'danger');
        }
      );
    } catch (e) {
      console.error('updateIfscCodeResettlement error', e);
      this.$common.hideLoader();
      ($('#ifscCodeModal') as any).modal('hide');
      this.$common.showMessage(
        'Unexpected error while updating IFSC Code.',
        'danger'
      );
    }
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

    this.$claim.createOrUpdateIfsc(bankObj, config).subscribe({
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

  validateFormBeforeNext() {
    this.showErrors = true;

    if (!this.claims?.gxFormFileUrl) {
      this.$common.showMessage('Please upload Gx Form (PDF).', 'error');
      return;
    }
  }

  private runTyClientValidationOnly(): boolean {
    const sectionIds = ['ship', 'ship2', 'ship3', 'ship4']; // keep if these are correct for TY
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
    if (type !== this.codeClaim.tyAdv) return;

    try {
      const okSections = this.runTyClientValidationOnly();
      if (!okSections) return;

      const okBusiness = this.validateTyBusinessFields();
      if (!okBusiness) {
        this.activateTab('ship'); // change to the tab id where Station proceeding to exists
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
      this.activateTab('ship'); // change to correct tab id
      return;
    }

    this.saveClaim(this.codeClaim.tyAdv, this.codeClaimState.outbox, true);
  }

  private validateTyBusinessFields(): boolean {
    if (!this.claims?.codeUnitDTO?.unit) {
      this.$common.showMessage('Please select the applied to unit.', 'danger');
      return false;
    }

    const adv = this.claims?.yatTempDutyAdvDTOs?.[0];
    const station = adv?.stationProceedingTo;

    if (!station) {
      this.$common.showMessage('Please select Field proceeding to.', 'danger');
      return false;
    }

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
        (adv.availedCategory === 1 || adv.availedCategory === 2) &&
        this.isNullOrEmpty(adv.accHToDutyKms)
      ) {
        this.$common.showMessage(
          'Please fill accommodation to duty kilometers.',
          'danger'
        );
        return false;
      }
    }

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

