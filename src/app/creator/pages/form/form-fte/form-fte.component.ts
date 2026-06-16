import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { UtilService } from 'src/app/service/core/util.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { DropdownManageService } from 'src/app/service/form/dropdown-manage.service';
import { FormService } from 'src/app/service/form/form.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { FormStateService } from 'src/app/service/form/formState.service';
import { MasterShipService } from 'src/app/service/master/master-ship.service';
import { UserService } from 'src/app/service/admin/user.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
import { ClaimUtilService } from 'src/app/service/claim/claim-util.service';

declare var $: any;

interface YatForeignTravelDetailDTO {
  id?: string | null;
  amount?: number | string | null;
  descr?: string | null;
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

  totalAmt?: number | string | null;
  advAmt?: number | string | null;
  totalBudgetedAmt?: number | string | null;
  dtsAmount?: number | string | null;

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
  fteEditTravelIndex: number | null = null;
  fteOtherMode = false;
  fteTravelBtnName = 'Add';
  fteTravelDetailsBtn = false;
  private fteEditIndex: number | null = null;

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
  documentDtos: any[] = [];

  onFteModeChange() {
    this.fteOtherMode = this.tempFteTravel.modeOfTravel === 'Others';
    if (!this.fteOtherMode) this.tempFteTravel.otherModeOfTravel = null;
  }

  onFteIsDtsChange() {
    if (this.tempFteTravel.isDts === 'Yes') {
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
    const t = this.tempFteTravel;

    if (!t.source || !t.destination || !t.modeOfTravel || !t.isDts || !t.amount)
      return false;

    if (
      t.modeOfTravel === 'Others' &&
      (!t.otherModeOfTravel || ('' + t.otherModeOfTravel).trim() === '')
    )
      return false;

    if (t.isDts === 'No') {
      this.validateFteReason();
      if (t._reasonError) return false;
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

  addFteTravelDetails(): void {
    this.ensureDtsList();
    if (!this.validateTempFteTravel()) return;

    const t = this.tempFteTravel;

    const row: any = {
      dtsDetailId: null,
      source: (t.source || '').trim(),
      destination: (t.destination || '').trim(),
      modeOfTravel: t.modeOfTravel,
      otherModeOfTravel:
        t.modeOfTravel === 'Others' ? (t.otherModeOfTravel || '').trim() : null,
      isDts: t.isDts,
      reasonForNoDts: t.isDts === 'No' ? (t.reasonForNoDts || '').trim() : null,
      remarks: (t.remarks || '').trim(),
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
      destination: row.destination ?? null,
      modeOfTravel: row.modeOfTravel ?? null,
      otherModeOfTravel: row.otherModeOfTravel ?? null,
      isDts: row.isDts ?? null,
      amount: row.tempAmount ?? null,
      reasonForNoDts: row.reasonForNoDts ?? null,
      remarks: row.remarks ?? null,
      _reasonError: false,
    };

    this.fteOtherMode = this.tempFteTravel.modeOfTravel === 'Others';
  }

  deleteFteTravelDetails(i: number): void {
    if (!this.claims?.yatDtsDetailDTOs?.length) return;

    this.claims.yatDtsDetailDTOs.splice(i, 1);

    if (this.fteEditTravelIndex === i) this.resetTempFteTravelDetails();
    this.recalcFteTotals();
  }

  resetTempFteTravelDetails() {
    this.fteEditIndex = null;
    this.fteTravelBtnName = 'Add';
    this.tempFteTravel = {
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
    this.fteOtherMode = false;
  }

  activatedRoute: ActivatedRoute;

  isIfscNull: boolean = false;
  gxFormModel: any;
  purposeTypes: any[] = [];
  // fteOtherMode: any;
  // tempFteTravel: any;
  // fteTravelDetailsBtn: any;
  // fteTravelBtnName: any;

  getPurposeTypes(): void {
    this.$common.showLoader();

    const config = { headers: { subFormId: 'F' } };

    this.$dropdownManage.getPurposeTypes(config).subscribe({
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

        this.purposeTypes = Array.isArray(res.object) ? res.object : [];
        console.log('FTE purposeTypes =>', this.purposeTypes);
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

    this.$dropdownManage.getPurposeTypes(config).subscribe({
      next: (res: any) => {
        // adjust these keys if your backend uses different property names
        this.purposeTypes = Array.isArray(res?.object) ? res.object : [];
        console.log('FTE purposeTypes:', this.purposeTypes);
      },
      error: (e) => {
        console.error('Purpose types error', e);
        this.purposeTypes = [];
      },
    });
  }

  navigatePreview(route: string, id: any): void {
    this.router.navigate(['../form-fte-detail'], {
      queryParams: {
        claimId: id || this.claims?.claimId || this.claimIdParam,
        subFormId: this.activeSubFormId,
        ...(this.supplementaryId ? { supId: this.supplementaryId } : {}),
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

    if (this.supplementaryId && savedClaimId) {
      this.router.navigate([moduleUrl + `/${this.getCurrentFormRoute()}`], {
        queryParams: {
          claimId: savedClaimId,
          supId: this.supplementaryId,
        },
      });
      return;
    }

    this.router.navigateByUrl(moduleUrl + `/draft`);
  }

  private resolveFormKind(rawFormKind: any): 'advance' | 'claim' {
    if (String(rawFormKind || '').toLowerCase() === 'claim') {
      return 'claim';
    }
    const routePath = this.route.snapshot.routeConfig?.path || '';
    return routePath.includes('claim') ? 'claim' : 'advance';
  }

  private getCurrentFormRoute(): string {
    return this.activeFormKind === 'claim' ? 'form-fte-claim' : 'form-fte';
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

    this.$claim.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status === false) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message || 'eSign is not available for this FTE claim.',
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

  showErrors = false;

  // IFSC modal
  showIfscModal = false;
  newIfscCode: string = '';

  // Travel add/edit state
  tempTravel: YatForeignTravelDetailDTO = {};
  selectedTravelIndex: number | null = null;
  travelBtnName = 'Add';

  // Claim model
  claims: ClaimsFteAdv = this.createEmptyClaims();
  //isIfscNull: any;
  activeFormKind: 'advance' | 'claim' = 'advance';
  activeSubFormId: string = this.codeClaim.fteAdv;

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

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.codeStatus = this.$auth?.codeStatus();

    this.initFromRoute();
    this.getUnits();
    this.loadFtePurposeTypes();
    this.$codeDocInfo.documentDtos.subscribe((docs: any) => {
      this.documentDtos = Array.isArray(docs) ? docs : [];
    });

    this.route.queryParams.subscribe(() => {
      this.getFormDetails();
    });
  }

  private initFromRoute(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.activeFormKind = this.resolveFormKind(this.route.snapshot.data?.['formKind']);
    this.activeSubFormId = this.activeFormKind === 'claim' ? this.codeClaim.fteClm : this.codeClaim.fteAdv;
    this.claims.codeSubFormDTO = { subFormId: this.activeSubFormId };
    this.claimIdParam = qp.get('claimId') || qp.get('resubId');
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

      isDts: null,
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

  private toNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  }

  private sumTravelAmount(rows: YatForeignTravelDetailDTO[]): number {
    return (rows || []).reduce((sum, r) => sum + this.toNumber(r?.amount), 0);
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

      this.$claim.getSingleClaim(config).subscribe(
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
            adv.isDts = dto.isDts ?? null;
            adv.reasonDts = dto.reasonDts ?? null;

            // ---------- AMOUNTS ----------
            adv.arrFare = dto.arrFare ?? null;
            adv.totalAmt = dto.totalAmt ?? 0;
            adv.advAmt = dto.advAmt ?? 0;
            adv.dtsAmount = dto.dtsAmount ?? 0;
            adv.totalBudgetedAmt = dto.totalBudgetedAmt ?? 0;

            // ---------- TRAVEL DETAILS LIST ----------
            const travelList = Array.isArray(obj.yatForeignTravelDetailDTOs)
              ? obj.yatForeignTravelDetailDTOs
              : [];
            this.claims.yatForeignTravelDetailDTOs = travelList;

            // ---------- BANK ----------
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

            // merge claim root (keeps your component structure stable)
            this.claims = {
              ...this.claims,
              ...obj,
              yatForeignDutyAdvDTOs: [{ ...adv }],
              yatForeignTravelDetailDTOs: travelList,
              yatDtsDetailDTOs: obj.yatDtsDetailDTOs || this.claims.yatDtsDetailDTOs,
              yatDocsDTOs: obj.yatDocsDTOs || [],
              yatClaimBankDetailDTO:
                obj.yatClaimBankDetailDTO || this.claims.yatClaimBankDetailDTO,
            };
            if (this.resubClaimId) {
              (this.claims as any).refAdvanceId = this.resubClaimId;
            }

            this.documentDtos = this.claims.yatDocsDTOs || [];
            this.$codeDocInfo.setDocument(this.documentDtos as []);
            this.claims.signWith = this.codeSignType.eSign;
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

    const adv = this.claims.yatForeignDutyAdvDTOs[0];
    if (!adv) return;

    // Travel total from list
    const travelTotal = this.sumTravelAmount(
      this.claims.yatForeignTravelDetailDTOs
    );

    // Add arrFare if used
    const arrFare = this.toNumber(adv.arrFare);

    const total = travelTotal + arrFare;

    adv.totalAmt = total;
    // Your Java DTO has advAmt + totalBudgetedAmt, keep it simple like TY:
    adv.advAmt = Math.round(total);
    adv.dtsAmount = this.toNumber(adv.dtsAmount); // keep server value unless you compute it somewhere else
    adv.totalBudgetedAmt =
      this.toNumber(adv.advAmt) + this.toNumber(adv.dtsAmount);
  }

  /* ======================
   *  TRAVEL ADD/EDIT/DELETE
   * ====================== */
  addTravel(detail: YatForeignTravelDetailDTO, type: string): void {
    if (type !== this.codeClaim.fteAdv) return;

    if (this.isNullOrEmpty(detail.descr)) {
      this.$common.showMessage('Description is required.', 'danger');
      return;
    }
    if (this.isNullOrEmpty(detail.amount)) {
      this.$common.showMessage('Amount is required.', 'danger');
      return;
    }

    if (this.selectedTravelIndex !== null) {
      this.claims.yatForeignTravelDetailDTOs[this.selectedTravelIndex] = {
        ...detail,
      };
    } else {
      this.claims.yatForeignTravelDetailDTOs.push({ ...detail });
    }

    this.resetTempTravel();
    this.calculateAmount(this.codeClaim.fteAdv);
  }

  editTravel(index: number): void {
    if (index < 0 || index >= this.claims.yatForeignTravelDetailDTOs.length)
      return;
    this.selectedTravelIndex = index;
    this.tempTravel = { ...this.claims.yatForeignTravelDetailDTOs[index] };
    this.travelBtnName = 'Update';
  }

  deleteTravel(index: number, type: string): void {
    if (type !== this.codeClaim.fteAdv) return;
    if (index < 0 || index >= this.claims.yatForeignTravelDetailDTOs.length)
      return;

    const ok = window.confirm('Do you really want to delete this row?');
    if (!ok) return;

    this.claims.yatForeignTravelDetailDTOs.splice(index, 1);
    this.calculateAmount(this.codeClaim.fteAdv);
  }

  resetTempTravel(): void {
    this.tempTravel = {} as YatForeignTravelDetailDTO;
    this.selectedTravelIndex = null;
    this.travelBtnName = 'Add';
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
    if (type !== this.codeClaim.fteAdv) return;

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
    if (tabLink) tabLink.click();
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
      tempClaim.yatDocsDTOs = this.mapClaimDocumentsForSave(this.documentDtos);

      // ifsc flag
      tempClaim.ifscnull = !tempClaim.yatClaimBankDetailDTO?.ifscCode;

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

      this.$claim.createOrUpdateClaim(formData, null).subscribe(
        (res: any) => {
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

          const moduleUrl = this.$auth.getModuleName
            ? this.$auth.getModuleName()
            : '';

          if (respStatus === this.codeClaimState.outbox) {
            this.$common.showMessage(
              res?.message || 'FTE claim submitted successfully!',
              'success'
            );
          } else if (respStatus === this.codeClaimState.draft) {
            this.$common.showMessage(
              res?.message || 'FTE draft saved successfully.',
              'success'
            );
          }
          this.navigateAfterSave(
            respStatus,
            obj.claimId || obj.id || this.claims.claimId || this.claimIdParam
          );

          this.$common.hideLoader();
          this.disableBtn = false;
          this.checkForPreviewBtn();
        },
        (err: any) => {
          console.error('Error while saving FTE Advance claim', err);
          this.$common.showMessage(
            'Error while saving FTE Advance claim.',
            'danger'
          );
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error('Exception while saving FTE Advance claim', err);
      this.$common.showMessage(
        'Error while saving FTE Advance claim.',
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

    const sectionIds = ['ship', 'ship2', 'ship3', 'ship4'];
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
        'Please complete all mandatory fields before submitting.',
        'danger'
      );
      return false;
    }

    if (!Array.isArray(this.claims.yatDtsDetailDTOs) || this.claims.yatDtsDetailDTOs.length === 0) {
      this.activateTab('ship4');
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
      this.activateTab('ship4');
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
    if (this.claims?.claimId) config.headers.claimId = this.claims.claimId;

    this.$claim.createOrUpdateIfsc(bankObj, config).subscribe({
      next: (response: any) => {
        const data: any = this.$common.parseResponse(response);
        if (data && data.status === true) {
          if (this.claims?.yatClaimBankDetailDTO) {
            this.claims.yatClaimBankDetailDTO.ifscCode =
              data.object?.[0]?.ifscCode || this.newIfscCode;
          }
          this.$common.showMessage(
            data.message || 'IFSC updated successfully',
            'success'
          );
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

  /* ======================
   *  UNITS
   * ====================== */
  getUnits(): void {
    try {
      this.$common.showLoader();
      const config = { headers: {} };
      this.$claim.getUnits(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) this.allUnits = response.object || [];
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

  /* ======================
   *  NAV
   * ====================== */
  goBack(): void {
    if (window.history.length > 1) this.location.back();
    else window.close();
  }

  // tabs next/prev (same as your TY)
  private getTabLinks(): HTMLAnchorElement[] {
    return Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.nav-tabs.custom-tabs li a')
    );
  }

  private getActiveTabIndex(tabLinks: HTMLAnchorElement[]): number {
    return tabLinks.findIndex((a) =>
      a.parentElement?.classList.contains('active')
    );
  }

  nextTabActive(): void {
    const tabLinks = this.getTabLinks();
    if (!tabLinks.length) return;
    const activeIndex = this.getActiveTabIndex(tabLinks);
    if (activeIndex === -1 || activeIndex >= tabLinks.length - 1) return;
    tabLinks[activeIndex + 1].click();
  }

  previousTabActive(): void {
    const tabLinks = this.getTabLinks();
    if (!tabLinks.length) return;
    const activeIndex = this.getActiveTabIndex(tabLinks);
    if (activeIndex <= 0) return;
    tabLinks[activeIndex - 1].click();
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

    const type = (adv.purposeType || '').toString().trim();

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

  // deleteGxForm(): void {
  //   (this.claims as any).gxFormFileUrl = null;
  //   this.gxFormModel = null;
  // }

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
      return;
    }

    if (num > 180) {
      num = 180;
    }

    adv.duration = num;
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

  // temp row (matches YatForeignTravelDetailDTO)
  tempForeignTravel: any = {
    id: null,
    descr: null,
    amount: null,
  };

  foreignTravelBtnName = 'Add';
  foreignTravelBtnDisabled = false;
  private editForeignTravelIndex: number | null = null;

  private validateForeignTravelRow(row: any): boolean {
    if (this.isNullOrEmpty(row?.descr)) return false;
    if (this.isNullOrEmpty(row?.amount)) return false;
    return true;
  }

  addOrUpdateForeignTravel() {
    this.ensureForeignTravelList();

    // basic validation
    if (!this.validateForeignTravelRow(this.tempForeignTravel)) {
      // use your toast/alert here if you have
      return;
    }

    const row = {
      id: this.tempForeignTravel.id ?? null,
      descr: (this.tempForeignTravel.descr || '').trim(),
      amount: this.tempForeignTravel.amount, // keep as string if backend expects string
    };

    if (this.editForeignTravelIndex !== null) {
      this.claims.yatForeignTravelDetailDTOs[this.editForeignTravelIndex] = row;
    } else {
      this.claims.yatForeignTravelDetailDTOs.push(row);
    }

    this.resetForeignTravelTemp();
  }

  editForeignTravel(i: number) {
    const row = this.claims?.yatForeignTravelDetailDTOs?.[i];
    if (!row) return;

    this.editForeignTravelIndex = i;
    this.foreignTravelBtnName = 'Update';

    this.tempForeignTravel = {
      id: row.id ?? null,
      descr: row.descr ?? null,
      amount: row.amount ?? null,
    };
  }

  deleteForeignTravel(i: number) {
    if (!this.claims?.yatForeignTravelDetailDTOs?.length) return;

    this.claims.yatForeignTravelDetailDTOs.splice(i, 1);

    // if deleting the row being edited, reset
    if (this.editForeignTravelIndex === i) this.resetForeignTravelTemp();
  }

  resetForeignTravelTemp() {
    this.editForeignTravelIndex = null;
    this.foreignTravelBtnName = 'Add';
    this.tempForeignTravel = { id: null, descr: null, amount: null };
  }

  // Add these in FormFteComponent class

  tempForeignTravelDetail: any = { id: null, descr: null, amount: null };

  addForeignTravelDetail(): void {
    const d = (this.tempForeignTravelDetail?.descr ?? '').toString().trim();
    const rawAmt = (this.tempForeignTravelDetail?.amount ?? '')
      .toString()
      .trim();

    // Description required
    if (!d) {
      this.$common.showMessage('Description is required.', 'danger');
      return;
    }

    // Amount required + numeric + > 0
    // digits only (no minus, no decimal). If you want decimal, tell me.
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
      const row =
        this.claims.yatForeignTravelDetailDTOs[this.editForeignTravelIndex];

      row.descr = d;
      row.amount = amt; // store as number

      this.editForeignTravelIndex = null;
      this.foreignTravelBtnName = 'Add';
    } else {
      this.claims.yatForeignTravelDetailDTOs.push({
        id: null,
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

    // if deleting the one being edited
    if (this.editForeignTravelIndex === index) {
      this.resetForeignTravelDetail();
    }

    this.editForeignTravelIndex = null;
    this.foreignTravelBtnName = 'Add';
    this.recalcFteTotals();
  }

  resetForeignTravelDetail(): void {
    this.tempForeignTravelDetail = { id: null, descr: '', amount: '' };
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
      .filter((r: any) => (r?.isDts ?? '') === 'Yes')
      .reduce((s: number, r: any) => s + num(r?.tempAmount ?? r?.amount), 0);

    const nonDtsTravelTotal = travel
      .filter((r: any) => (r?.isDts ?? '') === 'No')
      .reduce((s: number, r: any) => s + num(r?.tempAmount ?? r?.amount), 0);

    const finTotal = fin.reduce((s: number, r: any) => s + num(r?.amount), 0);

    // ✅ No DTS Amount = Non-DTS Travel + Financial Entries
    this.noDtsAmount = nonDtsTravelTotal + finTotal;

    // ✅ Advance Request/Admissible should be ONLY No-DTS bucket (Java behavior)
    adv.totalAmt = this.noDtsAmount;
    adv.advAmt = this.noDtsAmount;

    // ✅ DTS Amount separate
    adv.dtsAmount = dtsTotal;

    // ✅ Amount to be budgeted = DTS + NoDTS
    adv.totalBudgetedAmt = dtsTotal + this.noDtsAmount;

    this.claims.claimAmt = String(adv.totalBudgetedAmt ?? 0);
  }

  payload = {
    ...this.claims,
    claimAmt: this.claims.claimAmt?.toString() ?? '0',
  };

  private num(v: any): number {
    const n = Number((v ?? '').toString().trim());
    return isNaN(n) ? 0 : n;
  }

  private calcDtsAmountFromTravel(): number {
    const rows = this.claims?.yatDtsDetailDTOs || [];
    return rows
      .filter((r: any) => (r?.isDts || '').toString().toUpperCase() === 'YES')
      .reduce((sum: number, r: any) => {
        const v = r?.tempAmount ?? r?.amount ?? 0;
        return sum + this.num(v);
      }, 0);
  }

  private calcTotalTravelAmount(): number {
    const rows = this.claims?.yatDtsDetailDTOs || [];
    return rows.reduce((sum: number, r: any) => {
      const v = r?.tempAmount ?? r?.amount ?? 0;
      return sum + this.num(v);
    }, 0);
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

