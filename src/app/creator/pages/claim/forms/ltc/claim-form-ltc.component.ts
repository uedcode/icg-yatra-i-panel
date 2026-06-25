import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/service/core/util.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { EsignApiService } from 'src/app/service/api/security/esign-api.service';
import { BankIfscApiService } from 'src/app/service/api/code/bank-ifsc-api.service';
import { FormDocumentService } from 'src/app/service/core/form-document.service';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { CodeLtcTypeApiService } from 'src/app/service/api/code/code-ltc-type-api.service';
import { LtcAdvApiService } from 'src/app/service/api/claim/ltc-adv-api.service';
import { LtcAvailedHistApiService } from 'src/app/service/api/claim/ltc-availed-hist-api.service';
import { CommonDialogService } from 'src/app/service/core/common-dialog.service';
import {
  clearLegacyInvalidFromEvent,
  validateLegacyRequiredSection,
} from '../../../advance/forms/shared/helpers/legacy-form-validation.helper';

declare var $: any;

type YesNoNA = 'Yes' | 'No' | 'NA' | '';

interface CodeLtcTypeDTO {
  ltcTypeId: string | number | null;
  descr?: string;
}

interface CodeHrPincodeVillageDTO {
  village: string;
}

interface YatSpouseDetailDTO {
  memberName: string;
  age: string;
  relation: string;
  occupation: string;
}

interface YatFamilyDetailDTO {
  memberName: string;
  age: string;
  relation: string;
  occupation: string;
  checkedIndicator?: boolean;
}

interface YatDtsDetailDTO {
  source: string;
  destination: string;
  modeOfTravel: string;
  otherModeOfTravel?: string;
  isDts: YesNoNA;
  amount: string; // original
  tempAmount: string; // editable in grid
  reasonForNoDts?: string;
  remarks?: string;
}

interface YatLtcClaimDTO {
  ltcClmId: string;
  name: string;
  rank: string;
  pno: string;
  payLevel: string;
  basicPay: string;
  gxNumber: string;
  gxDate: string; // date input -> yyyy-mm-dd
  ltcType: string;
  blockYearType: string;
  blockYear: string;
  joiningDate: string; // date input
  placeOfVisit: string;
  isDts: YesNoNA;
  arrFare: string;
  arrBtnFare: string;
  totalAmt: string;
  advAmt: string;
  totalBudgetedAmt: string;
  dtsAmount: string;
  isDeclared: boolean;
  isUndertaking: boolean;
  place: string;
  date: string; // date input
  others: string;
  reasonForNoDts: string;
  codeLtcTypeDTO: CodeLtcTypeDTO;
  codeHrPincodeVillageDTOs: CodeHrPincodeVillageDTO[];
  ltcPlace: string;
  gxUnit: string;

  isNewlyMarried: YesNoNA;
  yatSpouseDetailDTO: YatSpouseDetailDTO;

  appliedTo: string;
  unitList: string[];
}

interface ClaimBankDetailDTO {
  bankName: string;
  ifscCode: string;
  bankAccNo: string;
  micrCode: string;
}

interface ClaimsModel {
  claimId?: number | null;
  claimState?: string | null;
  signWith: string;
  occDate: string;
  gxFormFileUrl: string;
  deleteGxFileUrl?: string | null;
  internalRemarks: string;
  gxFormModel?: any;
  codeSubFormDTO?: any;
  codeUnitDTO?: any;
  aclUserDTO?: any;

  yatLtcClaimDTOs: YatLtcClaimDTO[];
  yatFamilyDetailDTOs: YatFamilyDetailDTO[];
  yatDtsDetailDTOs: YatDtsDetailDTO[];
  yatDocsDTOs: any[];

  yatClaimBankDetailDTO: ClaimBankDetailDTO;
}

@Component({
  selector: 'app-claim-form-ltc',
  templateUrl: './claim-form-ltc.component.html',
  styleUrls: ['./claim-form-ltc.component.css'],
  standalone: false,
})
export class ClaimFormLtcComponent implements OnInit {
  activeSubFormId = 'LTC';
  removeEmoji() {
    this.claims.internalRemarks = (this.claims.internalRemarks || '').replace(
      /[\u{1F300}-\u{1FAFF}]/gu,
      ''
    );
  }
  // UI state
  activeTab: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' | 'ship6' | 'ship7' = 'ship';
  disableBtn = false;
  fullFormDisabled = false;
  isPreviewDisabled = false;
  showErrors = false;
  gxFormUploading = false;
  eSignTempFormObj: any = null;

  // Sign types (match your old constants concept)
  codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
  };

  // LTC subtype
  yatLtcSubTypes = {
    self: 'Self',
    partial: 'SelfAndFamily',
  };

  // LTC type ids (you can map to your actual ids)
  yatLtcTypes = {
    placeAnywhereInIndia: 'ALL_INDIA',
    specialPlace: 'SPECIAL_PLACE',
  };

  // Lookup data
  allUnits: string[] = [];
  allCodeLtcType: Array<{ ltcTypeId: string | number; descr: string }> = [];
  blockYears: string[] = [];
  doe = 1;
  presentUnitStatus: any = null;

  // Travel UI state
  travelModes = [
    'Air',
    'Road',
    'Train',
    'Ship',
    'Bus',
    'Taxi',
    'Ferry',
    'Service Vehicle',
    'Others',
  ];
  otherMode = false;
  boolIsDts = true;
  isDtsDisabled = false;
  reasonDisable = true;

  isEdit = false;
  editIndex: number = -1;

  ltcTravelDetailsBtn = false;
  travelBtnName = 'Add';

  // GX file handling
  showGxFileBrowse = true;
  gxFile: File | null = null;
  gxFileName = '';
  gxFilePreviewUrl = '';

  // base url for existing file
  fileUrl = ''; // set from env/config
  showIfscModal = false;
  newIfscCode = '';
  showLtcEntitledModal = false;
  ltcEntitled: any = { singleBlockYear: [], listYearsAvailed: [] };
  showLtcAvailedHistoryModal = false;
  ltcAvailedHistory: any = { singleBlockYear: [], listYearsAvailed: [] };
  sideList = [
    'Self LTC (Hometown)',
    'Self and Family (Hometown)',
    'All India LTC',
    'Special Place LTC',
    'AFSP',
    'EPC',
    'Additional LTC',
  ];

  codeClaim = { ltcClm: 'LTC' } as const;
  codeClaimState = {
    draft: 'DR',
    outbox: 'OB',
  } as const;

  // Temp travel entry
  tempLtcTravelDetails: Partial<YatDtsDetailDTO> = this.defaultTempTravel();

  // Main model
  claims: ClaimsModel = this.defaultClaims();
  disableHomeTown: any;
  userIdDetails: any;
  claimIdParam: string | null = null;
  resubClaimId: string | null = null;
  supplementaryId: string | null = null;
  documentDtos: any[] = [];

  get pageTitle(): string {
    return `${this.supplementaryId ? 'Supplementary ' : ''}LTC Claim`;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private previewWindow: PreviewWindowService,
    private UtilService: UtilService,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $common: CommonService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $esignApi: EsignApiService,
    private $bankIfscApi: BankIfscApiService,
    private $formDocument: FormDocumentService,
    private $codeUnitApi: CodeUnitApiService,
    private $codeLtcTypeApi: CodeLtcTypeApiService,
    private $ltcClmApi: LtcAdvApiService,
    private $ltcAvailedHistApi: LtcAvailedHistApiService,
    private $codeDocInfo: CodeDocInfoApiService,
    private $dialog: CommonDialogService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.activeSubFormId = this.resolveSubFormId(this.route.snapshot.data?.['subFormId']);
    this.claims.codeSubFormDTO = { subFormId: this.activeSubFormId };
    this.initFromRoute();
    this.loadInitialMasterData();
    this.$codeDocInfo.documentDtos.subscribe((docs: any) => {
      this.documentDtos = Array.isArray(docs) ? docs : [];
    });
    this.route.queryParams.subscribe(() => {
      this.getFormDetails();
    });
    this.calculateAmount();
  }

  private initFromRoute(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.claimIdParam = qp.get('id') || qp.get('resubId');
    this.resubClaimId = qp.get('resubId');
    this.supplementaryId = qp.get('supId');
  }

  // ---------- Defaults ----------
  private defaultClaims(): ClaimsModel {
    return {
      claimId: null,
      claimState: null,
      signWith: this.codeSignType.eSign,
      occDate: '',
      gxFormFileUrl: '',
      internalRemarks: '',
      codeSubFormDTO: { subFormId: this.codeClaim.ltcClm },
      codeUnitDTO: { unit: '', descr: '' },
      yatLtcClaimDTOs: [this.defaultLtcAdv()],
      yatFamilyDetailDTOs: [],
      yatDtsDetailDTOs: [],
      yatDocsDTOs: [],
      yatClaimBankDetailDTO: {
        bankName: '',
        ifscCode: '',
        bankAccNo: '',
        micrCode: '',
      },
    };
  }

  private defaultLtcAdv(): YatLtcClaimDTO {
    return {
      ltcClmId: '',
      name: '',
      rank: '',
      pno: '',
      payLevel: '',
      basicPay: '',
      gxNumber: '',
      gxDate: '',
      ltcType: this.yatLtcSubTypes.self,
      blockYearType: '',
      blockYear: '',
      joiningDate: '',
      placeOfVisit: '',
      isDts: 'Yes',
      arrFare: '',
      arrBtnFare: '',
      totalAmt: '0',
      advAmt: '0',
      totalBudgetedAmt: '0',
      dtsAmount: '0',
      isDeclared: false,
      isUndertaking: false,
      place: '',
      date: '',
      others: '',
      reasonForNoDts: '',
      codeLtcTypeDTO: { ltcTypeId: null },
      codeHrPincodeVillageDTOs: [],
      ltcPlace: '',
      gxUnit: '',
      isNewlyMarried: 'No',
      yatSpouseDetailDTO: {
        memberName: '',
        age: '',
        relation: '',
        occupation: '',
      },
      appliedTo: '',
      unitList: [],
    };
  }

  private defaultTempTravel(): Partial<YatDtsDetailDTO> {
    return {
      source: '',
      destination: '',
      modeOfTravel: '',
      otherModeOfTravel: '',
      isDts: '',
      amount: '',
      reasonForNoDts: '',
      remarks: '',
    };
  }

  // ---------- Tab control ----------
  setTab(tab: any): void {
    this.activeTab = tab;
  }

  nextTabActive(): void {
    const order: any[] = ['ship', 'ship2', 'ship3', 'ship4', 'ship5', 'ship7', 'ship6'];
    const idx = order.indexOf(this.activeTab);
    if (idx < order.length - 1) this.activeTab = order[idx + 1];
  }

  previousTabActive(): void {
    const order: any[] = ['ship', 'ship2', 'ship3', 'ship4', 'ship5', 'ship7', 'ship6'];
    const idx = order.indexOf(this.activeTab);
    if (idx > 0) this.activeTab = order[idx - 1];
  }

  // ---------- Basic utilities ----------
  onlyNumber(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    input.value = (input.value || '').replace(/[^\d]/g, '');
  }

  showZero(v: any): string {
    const n = this.toNumber(v);
    return Number.isFinite(n) ? String(n) : '0';
  }

  showHyphen(v: any): string {
    if (v === null || v === undefined) return '-';
    const s = String(v).trim();
    return s.length ? s : '-';
  }

  private isNullOrEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private toNumber(v: any): number {
    return this.normalizeAmountNumber(v, 0) ?? 0;
  }

  private normalizeAmountNumber(value: any, emptyValue: number | null = null): number | null {
    const raw = String(value ?? '').trim().replace(/[^\d.]/g, '');
    if (!raw) return emptyValue;

    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : emptyValue;
  }

  private normalizeAmountString(value: any, emptyValue = ''): string {
    const amount = this.normalizeAmountNumber(value, null);
    return amount === null ? emptyValue : String(amount);
  }

  private formatDateInput(value: any): string {
    if (!value) return '';
    const dt = this.datePipe.transform(value, 'yyyy-MM-dd');
    return dt || '';
  }

  private normalizeBankDetail(bank: any): ClaimBankDetailDTO {
    const current = this.claims?.yatClaimBankDetailDTO || {
      bankName: '',
      ifscCode: '',
      bankAccNo: '',
      micrCode: '',
    };
    const merged: any = {
      ...current,
      ...(bank || {}),
    };
    const accountValue =
      merged.bankAccNo ??
      merged.accountNo ??
      (current as any).bankAccNo ??
      (current as any).accountNo ??
      '';

    return {
      bankName: merged.bankName ?? '',
      ifscCode: merged.ifscCode ?? '',
      bankAccNo: accountValue,
      micrCode: merged.micrCode ?? '',
    };
  }

  private normalizeLtcTravelRows(rows: any[]): any[] {
    return (rows || []).map((row: any) => {
      const amount = this.normalizeAmountString(row?.amount);
      const tempAmount = this.normalizeAmountString(row?.tempAmount) || amount;
      return {
        ...row,
        amount,
        tempAmount,
      };
    });
  }

  private mergeSavedLtcResponse(obj: any): void {
    if (!obj) return;

    const currentAdv = this.claims?.yatLtcClaimDTOs?.[0] || {};
    const savedAdv = Array.isArray(obj.yatLtcClaimDTOs)
      ? obj.yatLtcClaimDTOs[0]
      : null;
    const savedDtsRows = Array.isArray(obj.yatDtsDetailDTOs)
      ? this.normalizeLtcTravelRows(obj.yatDtsDetailDTOs)
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
      occDate: this.formatDateInput(obj.occDate ?? this.claims.occDate),
      gxFormFileUrl: obj.gxFormFileUrl || this.claims.gxFormFileUrl,
      yatLtcClaimDTOs: [{ ...currentAdv, ...(savedAdv || {}) }],
      yatFamilyDetailDTOs: savedFamilyRows,
      yatDtsDetailDTOs: savedDtsRows,
      yatDocsDTOs: savedDocs,
      yatClaimBankDetailDTO: this.normalizeBankDetail(obj.yatClaimBankDetailDTO),
    };

    this.documentDtos = this.claims.yatDocsDTOs || [];
    this.$codeDocInfo.setDocument(this.documentDtos as []);
    this.showGxFileBrowse = !this.claims.gxFormFileUrl;
    delete (this.claims as any).deleteGxFileUrl;
    this.calculateAmount();
    this.checkForPreviewBtn();
  }

  // ---------- GX file ----------
  onGxFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.$dialog.message({
        title: 'Alert',
        message: 'Only PDF allowed.',
        type: 'danger',
      });
      input.value = '';
      return;
    }

    const max = 512 * 1024;
    if (file.size > max) {
      this.$dialog.message({
        title: 'Alert',
        message: 'PDF must be upto 512 KB.',
        type: 'danger',
      });
      input.value = '';
      return;
    }

    this.gxFile = file;
    this.gxFileName = file.name;

    if (this.gxFilePreviewUrl) URL.revokeObjectURL(this.gxFilePreviewUrl);
    this.gxFilePreviewUrl = URL.createObjectURL(file);
  }

  deleteSelectedGxFile(): void {
    this.gxFile = null;
    this.gxFileName = '';
    if (this.gxFilePreviewUrl) URL.revokeObjectURL(this.gxFilePreviewUrl);
    this.gxFilePreviewUrl = '';
  }

  deleteExistingGxFile(): void {
    // You must call API to delete on server, then:
    this.claims.gxFormFileUrl = '';
    this.showGxFileBrowse = true;
  }

  // ---------- LTC / block logic ----------
  changeLtcType(getCalled = false): void {
    const adv = this.claims.yatLtcClaimDTOs[0];
    const ltcTypeId = adv.codeLtcTypeDTO?.ltcTypeId;

    if (!getCalled) {
      if (String(ltcTypeId || '') !== 'PAI' && String(ltcTypeId || '') !== 'SP') {
        adv.ltcPlace = '';
      }

      if (this.isSpecialIslandLtcType(ltcTypeId) && !this.presentUnitStatus) {
        adv.codeLtcTypeDTO = { ltcTypeId: null };
        this.$common.showMessage('Person borne in Island unit can avail this', 'danger');
        return;
      }
    }

    this.validateAdditionalLtcIfRequired();

    if (!this.isPlaceVisitRequired()) {
      adv.ltcPlace = '';
    }
    this.hideDiv();
  }

  hideDiv(): void {
    // replicate your logic if any UI sections depend on blockYear
    // currently no-op
  }

  isPlaceVisitRequired(): boolean {
    const id = this.claims.yatLtcClaimDTOs[0].codeLtcTypeDTO?.ltcTypeId;
    return (
      String(id) === String(this.yatLtcTypes.placeAnywhereInIndia) ||
      String(id) === String(this.yatLtcTypes.specialPlace)
    );
  }

  ltcChange(mode: 's' | 'f', _calc: boolean): void {
    const adv = this.claims.yatLtcClaimDTOs[0];
    const ltcTypeId = adv.codeLtcTypeDTO?.ltcTypeId;
    let legacyType = mode;

    if (
      adv.ltcType === this.yatLtcSubTypes.self ||
      String(ltcTypeId) === 'AFSP' ||
      String(ltcTypeId) === 'ESP'
    ) {
      legacyType = 's';
    } else if (adv.ltcType === this.yatLtcSubTypes.partial) {
      legacyType = 'f';
    }

    this.loadLtcBlockYears(legacyType, ltcTypeId);
    this.loadLtcTypes(legacyType);
  }

  onNewlyMarriedChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.claims.yatLtcClaimDTOs[0].isNewlyMarried = checked ? 'Yes' : 'No';
    this.resetSpouseDetails();
  }

  resetSpouseDetails(): void {
    if (this.claims.yatLtcClaimDTOs[0].isNewlyMarried !== 'Yes') {
      this.claims.yatLtcClaimDTOs[0].yatSpouseDetailDTO = {
        memberName: '',
        age: '',
        relation: '',
        occupation: '',
      };
    }
  }

  addOrUpdateLtcTravelDetails(): void {
    // Hard validation (don’t depend only on required attr)
    this.validateLtcTravel(this.tempLtcTravelDetails, 'modeOfTravel');
    const t = this.tempLtcTravelDetails;

    if (!t.source || !t.destination || !t.modeOfTravel || !t.isDts) {
      this.$common.showMessage('Please fill From/To/Mode/DTS.', 'danger');
      return;
    }
    if (this.otherMode && !(t.otherModeOfTravel || '').trim()) {
      this.$common.showMessage('Please fill Other Mode of Travel.', 'danger');
      return;
    }
    if (t.isDts === 'No' && !(t.reasonForNoDts || '').trim()) {
      this.$common.showMessage(
        'Please fill the reason for not taking DTS.',
        'danger'
      );
      return;
    }
    if (!String(t.amount || '').trim()) {
      this.$common.showMessage('Please fill Amount.', 'danger');
      return;
    }

    const newRow: YatDtsDetailDTO = {
      source: String(t.source || '').trim(),
      destination: String(t.destination || '').trim(),
      modeOfTravel: String(t.modeOfTravel || '').trim(),
      otherModeOfTravel: String(t.otherModeOfTravel || '').trim(),
      isDts: (t.isDts || '') as YesNoNA,
      amount: String(t.amount || '').trim(),
      tempAmount: String(t.amount || '').trim(),
      reasonForNoDts: String(t.reasonForNoDts || '').trim(),
      remarks: String(t.remarks || '').trim(),
    };

    if (this.editIndex >= 0) {
      this.claims.yatDtsDetailDTOs[this.editIndex] = newRow;
      this.editIndex = -1;
      this.isEdit = false;
      this.travelBtnName = 'Add';
    } else {
      this.claims.yatDtsDetailDTOs.push(newRow);
    }

    this.resetTempLtcTravelDetails();
    this.calculateAmount();
  }

  editLtcTravelDetails(index: number): void {
    const row = this.claims.yatDtsDetailDTOs[index];
    this.editIndex = index;
    this.isEdit = true;
    this.travelBtnName = 'Update';

    this.tempLtcTravelDetails = {
      source: row.source,
      destination: row.destination,
      modeOfTravel: row.modeOfTravel,
      otherModeOfTravel: row.otherModeOfTravel || '',
      isDts: row.isDts,
      amount: row.tempAmount || row.amount,
      reasonForNoDts: row.reasonForNoDts || '',
      remarks: row.remarks || '',
    };

    this.otherMode = row.modeOfTravel === 'Others';
    this.boolIsDts = row.modeOfTravel === 'Air' || row.modeOfTravel === 'Train';
    this.isDtsDisabled = !!row.modeOfTravel && !this.boolIsDts;
    this.reasonDisable = !(row.isDts === 'No');
    this.setTab('ship2');
  }

  async deleteLtcTravelDetails(index: number): Promise<void> {
    const confirmDelete = await this.$dialog.confirm({
      message: 'Do you really want to delete this row?',
      type: 'delete',
    });
    if (!confirmDelete) {
      return;
    }

    this.claims.yatDtsDetailDTOs.splice(index, 1);
    this.calculateAmount();
  }

  resetTempLtcTravelDetails(): void {
    this.tempLtcTravelDetails = this.defaultTempTravel();
    this.otherMode = false;
    this.boolIsDts = true;
    this.isDtsDisabled = false;
    this.reasonDisable = true;
    this.editIndex = -1;
    this.isEdit = false;
    this.travelBtnName = 'Add';
  }

  normalizeFinancialPlace(): void {
    const adv = this.claims?.yatLtcClaimDTOs?.[0];
    if (!adv) {
      return;
    }
    adv.place = String(adv.place || '').toUpperCase();
  }

  normalizeLtcPlace(): void {
    const adv = this.claims?.yatLtcClaimDTOs?.[0];
    if (!adv) {
      return;
    }
    adv.ltcPlace = String(adv.ltcPlace || '').toUpperCase();
  }

  // ---------- Amount calculations ----------
  onSavedTravelAmountChange(row: YatDtsDetailDTO): void {
    const originalAmount = this.toNumber(row?.amount);
    const editedAmount = this.toNumber(row?.tempAmount);

    if (originalAmount > 0 && editedAmount > originalAmount) {
      row.tempAmount = String(originalAmount);
    }

    this.calculateAmount();
  }

  calculateAmount(): void {
    // totalAmt = sum of tempAmount
    const total = this.claims.yatDtsDetailDTOs.reduce(
      (sum, r) => sum + this.toNumber(r.tempAmount ?? r.amount),
      0
    );

    // dtsAmount: sum where isDts === 'Yes' (if your Java logic differs, change it)
    const dts = this.claims.yatDtsDetailDTOs
      .filter((r) => (r.isDts || '') === 'Yes')
      .reduce((sum, r) => sum + this.toNumber(r.tempAmount ?? r.amount), 0);

    // advAmt = 90% of total
    const adv = Math.round(total * 0.9);

    // totalBudgetedAmt (your earlier forms: usually same as total, or depends on dts)
    // Here: budgeted = total (simple + consistent). If your Java does: total - dts + adv etc. adjust.
    const budgeted = total;

    const dto = this.claims.yatLtcClaimDTOs[0];
    dto.totalAmt = String(total);
    dto.dtsAmount = String(dts);
    dto.advAmt = String(adv);
    dto.totalBudgetedAmt = String(budgeted);
  }

  // ---------- Actions (wire to your real services) ----------
  loadInitialMasterData(): void {
    this.loadPresentUnitStatus();
    this.loadDoeDifference();
    this.loadLtcFamilyDetails();
    this.ltcChange('s', true);
  }

  private loadPresentUnitStatus(): void {
    const config = {
      headers: {
        presentUnit: this.userIdDetails?.unitId,
        pid: this.userIdDetails?.userId,
      },
    };

    this.$codeUnitApi.getPresentUnitStatus(config).subscribe(
      (response: any) => {
        if (response?.status === true) {
          this.presentUnitStatus = response.object;
        }
      },
      (error: any) => {
        console.error('Error while loading present unit status.', error);
      }
    );
  }

  private isSpecialIslandLtcType(ltcTypeId: any): boolean {
    const typeId = String(ltcTypeId || '');
    return typeId === 'AFSP' || typeId === 'ESP' || typeId === 'SFL';
  }

  private validateAdditionalLtcIfRequired(): void {
    const adv = this.claims.yatLtcClaimDTOs[0];
    const ltcTypeId = adv.codeLtcTypeDTO?.ltcTypeId;
    if (String(ltcTypeId || '') !== 'ALTC' || !adv.blockYear) {
      return;
    }

    const config = {
      headers: {
        userId: this.userIdDetails?.userId,
        blockYear: adv.blockYear,
        ltcType: ltcTypeId,
      },
    };

    this.$ltcClmApi.validateAdditionalLtc(config).subscribe(
      () => {},
      (error: any) => {
        console.error('Error while validating additional LTC.', error);
      }
    );
  }

  private loadLtcFamilyDetails(): void {
    const config = {
      headers: {
        userId: this.userIdDetails?.userId,
      },
    };

    this.$ltcAvailedHistApi.getFamilyDetails(config).subscribe(
      (response: any) => {
        if (response?.status && Array.isArray(response.object)) {
          this.claims.yatFamilyDetailDTOs = response.object;
        }
      },
      (error: any) => {
        console.error('Error while loading LTC family details.', error);
      }
    );
  }

  private loadDoeDifference(): void {
    const config = {
      headers: {
        userId: this.userIdDetails?.userId,
      },
    };

    this.$ltcAvailedHistApi.getDoeDifference(config).subscribe(
      (response: any) => {
        if (response?.status) {
          this.doe = this.toNumber(response.object);
        }
      },
      (error: any) => {
        console.error('Error while loading LTC DOE difference.', error);
      }
    );
  }

  private loadLtcBlockYears(
    type: 's' | 'f',
    ltcTypeId?: string | number | null
  ): void {
    const config = {
      headers: {
        type,
        userId: this.userIdDetails?.userId,
        calledFrom: this.codeClaim.ltcClm,
        ltcTypeId: ltcTypeId || '',
        isDropdown: '1',
      },
    };

    this.$ltcClmApi.getBlockYears(config).subscribe(
      (response: any) => {
        if (response?.status && Array.isArray(response.object)) {
          this.blockYears = response.object;
        }
      },
      (error: any) => {
        console.error('Error while loading LTC block years.', error);
      }
    );
  }

  private loadLtcTypes(type: 's' | 'f'): void {
    const config = {
      headers: {
        type,
      },
    };

    this.$codeLtcTypeApi.getAll(config).subscribe(
      (response: any) => {
        if (response?.status && Array.isArray(response.object)) {
          this.allCodeLtcType = response.object;
        }
      },
      (error: any) => {
        console.error('Error while loading LTC types.', error);
      }
    );
  }

  getFormDetails(): void {
    try {
      this.$common.showLoader();

      const headers: any = {
        isPreview: 'false',
        userId: this.userIdDetails?.userId ?? '',
        subFormId: this.activeSubFormId,
        isFetch: 'true',
        claimId: this.claimIdParam || '',
      };
      if (this.supplementaryId) {
        headers.supCLaimId = this.supplementaryId;
      }

      this.$claimApi.getSingleClaim({ headers }).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.$common.showMessage(
              response?.message || 'Unable to load LTC Claim details.',
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

          const adv = this.claims.yatLtcClaimDTOs[0];
          const dto =
            Array.isArray(obj.yatLtcClaimDTOs) && obj.yatLtcClaimDTOs.length > 0
              ? obj.yatLtcClaimDTOs[0]
              : null;

          if (dto) {
            adv.ltcClmId = dto.ltcClmId ?? '';
            adv.name = dto.name ?? adv.name ?? '';
            adv.rank = dto.rank ?? adv.rank ?? '';
            adv.pno = dto.pno ?? adv.pno ?? '';
            adv.payLevel = dto.payLevel ?? adv.payLevel ?? '';
            adv.basicPay = dto.basicPay ?? adv.basicPay ?? '';
            adv.gxNumber = dto.gxNumber ?? '';
            adv.gxDate = this.formatDateInput(dto.gxDate);
            adv.ltcType = dto.ltcType ?? adv.ltcType ?? this.yatLtcSubTypes.self;
            adv.blockYearType = dto.blockYearType ?? '';
            adv.blockYear = dto.blockYear ?? '';
            adv.joiningDate = this.formatDateInput(dto.joiningDate);
            adv.placeOfVisit = dto.placeOfVisit ?? '';
            adv.isDts = dto.isDts ?? adv.isDts ?? 'Yes';
            adv.arrFare = dto.arrFare ?? '';
            adv.arrBtnFare = dto.arrBtnFare ?? '';
            adv.totalAmt = dto.totalAmt ?? '0';
            adv.advAmt = dto.advAmt ?? '0';
            adv.totalBudgetedAmt = dto.totalBudgetedAmt ?? '0';
            adv.dtsAmount = dto.dtsAmount ?? '0';
            adv.isDeclared = !!dto.isDeclared;
            adv.isUndertaking = !!dto.isUndertaking;
            adv.place = dto.place ?? '';
            adv.date = this.formatDateInput(dto.date);
            adv.others = dto.others ?? '';
            adv.reasonForNoDts = dto.reasonForNoDts ?? '';
            adv.codeLtcTypeDTO = dto.codeLtcTypeDTO || adv.codeLtcTypeDTO;
            adv.codeHrPincodeVillageDTOs = Array.isArray(
              dto.codeHrPincodeVillageDTOs
            )
              ? dto.codeHrPincodeVillageDTOs
              : adv.codeHrPincodeVillageDTOs;
            this.applySelectedHomeTown(adv);
            adv.ltcPlace = dto.ltcPlace ?? '';
            adv.gxUnit = dto.gxUnit ?? '';
            adv.isNewlyMarried = dto.isNewlyMarried === 'Yes' ? 'Yes' : 'No';
            adv.yatSpouseDetailDTO =
              dto.yatSpouseDetailDTO || adv.yatSpouseDetailDTO;
            adv.appliedTo = dto.appliedTo ?? '';
            adv.unitList = Array.isArray(dto.unitList) ? dto.unitList : [];
          } else if (obj.userBasicDetailDTO) {
            const user = obj.userBasicDetailDTO;
            adv.pno = user.pno ?? user.persNo ?? '';
            adv.name = user.name ?? user.userName ?? '';
            adv.rank = user.rank ?? user.rankName ?? '';
            adv.payLevel = user.payLevel ?? '';
            adv.basicPay = user.basicPay ?? user.basPay ?? '';
            adv.gxUnit = user.unitName ?? user.unit ?? '';
          }

          this.claims = {
            ...this.claims,
            ...obj,
            occDate: this.formatDateInput(obj.occDate),
            gxFormFileUrl: obj.gxFormFileUrl || this.claims.gxFormFileUrl,
            yatLtcClaimDTOs: [{ ...adv }],
            yatFamilyDetailDTOs: Array.isArray(obj.yatFamilyDetailDTOs)
              ? obj.yatFamilyDetailDTOs
              : this.claims.yatFamilyDetailDTOs,
            yatDtsDetailDTOs: Array.isArray(obj.yatDtsDetailDTOs)
              ? this.normalizeLtcTravelRows(obj.yatDtsDetailDTOs)
              : this.claims.yatDtsDetailDTOs,
            yatDocsDTOs: Array.isArray(obj.yatDocsDTOs) ? obj.yatDocsDTOs : [],
            yatClaimBankDetailDTO: this.normalizeBankDetail(obj.yatClaimBankDetailDTO),
          };
          if (this.resubClaimId) {
            (this.claims as any).refAdvanceId = this.resubClaimId;
          }

          this.showGxFileBrowse = !this.claims.gxFormFileUrl;
          this.documentDtos = this.claims.yatDocsDTOs || [];
          this.$codeDocInfo.setDocument(this.documentDtos as []);
          this.checkForPreviewBtn();
          this.calculateAmount();
        },
        (error: any) => {
          this.$common.hideLoader();
          console.error('Error while loading LTC Claim details.', error);
          this.$common.showMessage(
            'Error while loading LTC Claim details.',
            'danger'
          );
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      console.error('Exception in getFormDetails()', e);
      this.$common.showMessage(
        'Error while loading LTC Claim details.',
        'danger'
      );
    }
  }

  checkForPreviewBtn(): void {
    this.isPreviewDisabled = !this.claims?.claimId;
  }

  private applySelectedHomeTown(adv: YatLtcClaimDTO): void {
    const selectedVillage = (adv.codeHrPincodeVillageDTOs || []).find(
      (item: any) => String(item?.isSelected) === '1'
    );

    if (selectedVillage?.village) {
      adv.placeOfVisit = selectedVillage.village;
      this.disableHomeTown = true;
    }
  }

  checkValidSignType(): void {
    // your real rule depends on "appliedTo" etc.
    // keep minimal: if eSign selected but appliedTo empty => block
    if (
      this.claims.signWith === this.codeSignType.eSign &&
      !this.claims.yatLtcClaimDTOs[0].appliedTo
    ) {
      this.$dialog.message({
        title: 'Alert',
        message: 'Please select Applied To before choosing eSign.',
        type: 'danger',
      });
      this.claims.signWith = this.codeSignType.inkSign;
    }
  }

  checkEsignAvailability(): void {
    const claimId = this.claims?.claimId;
    if (!claimId) {
      this.$common.showMessage(
        `Please save the ${this.getFormDisplayName()} before checking eSign availability.`,
        'danger'
      );
      this.claims.signWith = this.codeSignType.inkSign;
      return;
    }

    const config = {
      headers: {
        claimId,
        subFormId: this.activeSubFormId,
        userId: this.userIdDetails?.userId ?? '',
        gxUnitId: String(this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || ''),
      },
    };

    this.$esignApi.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status !== true) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message || `eSign is not available for this ${this.getFormDisplayName()}.`,
            'danger'
          );
        }
      },
      error: () => {
        this.claims.signWith = this.codeSignType.inkSign;
        this.$common.showMessage(
          'Unable to verify eSign availability.',
          'danger'
        );
      },
    });
  }

  getTransBasicPay(): void {
    // your old logic ties occDate + blockYear + refAdvanceId etc.
    // call API if required
  }

  getLtcEntitled(): void {
    const config = {
      headers: {
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
      },
    };

    this.$common.showLoader();
    this.$ltcAvailedHistApi.getLtcEntitled(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status === true) {
          this.ltcEntitled = response.object || {
            singleBlockYear: [],
            listYearsAvailed: [],
          };
          this.showLtcEntitledModal = true;
        } else {
          this.$common.showMessage(
            response?.message || 'Unable to load LTC entitlement.',
            'danger'
          );
        }
      },
      error: (error: any) => {
        this.$common.hideLoader();
        console.error('Error while loading LTC entitlement.', error);
        this.$common.showMessage('Unable to load LTC entitlement.', 'danger');
      },
    });
  }

  closeLtcEntitledModal(): void {
    this.showLtcEntitledModal = false;
  }

  getEntitlementCell(row: any, index: number): any {
    const prefixes = ['first', 'second', 'third', 'fourth'];
    const prefix = prefixes[index] || prefixes[0];
    return {
      availed: row?.[`${prefix}YearAvailed`],
      members: row?.[`${prefix}ListMember`] || [],
    };
  }

  getLtcAvailedHistory(): void {
    const config = {
      headers: {
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
      },
    };

    this.$common.showLoader();
    this.$ltcAvailedHistApi.getLtcAvailedEntitledHistory(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status === true) {
          this.ltcAvailedHistory = response.object || {
            singleBlockYear: [],
            listYearsAvailed: [],
          };
          this.showLtcAvailedHistoryModal = true;
        } else {
          this.$common.showMessage(
            response?.message || 'Unable to load LTC availed history.',
            'danger'
          );
        }
      },
      error: (error: any) => {
        this.$common.hideLoader();
        console.error('Error while loading LTC availed history.', error);
        this.$common.showMessage(
          'Unable to load LTC availed history.',
          'danger'
        );
      },
    });
  }

  closeLtcAvailedHistoryModal(): void {
    this.showLtcAvailedHistoryModal = false;
  }

  formatDisplayDate(value: any): string {
    return this.datePipe.transform(value, 'dd-MMM-yyyy') || '-';
  }

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
      userId: this.claims?.aclUserDTO?.userId || this.userIdDetails?.userId || null,
    };
    const config: any = { headers: {} };

    if (this.claims?.claimId) {
      config.headers.claimId = this.claims.claimId;
    }

    this.$common.showLoader();
    this.$bankIfscApi.createOrUpdate(bankObj, config).subscribe({
      next: (response: any) => {
        const data: any = this.$common.parseResponse(response);
        this.$common.hideLoader();

        if (data?.status === true) {
          this.claims.yatClaimBankDetailDTO.ifscCode =
            data.object?.[0]?.ifscCode || ifscCode;
          this.$common.showMessage(
            data.message || 'IFSC Code updated successfully.',
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
      error: (error: any) => {
        this.$common.hideLoader();
        console.error('Error while updating IFSC:', error);
        this.$common.showMessage('Error while updating IFSC code.', 'danger');
      },
    });
  }

  navigatePreview(): void {
    const claimId = this.claims?.claimId || this.claimIdParam;
    if (!claimId) {
      this.$common.showMessage('Please save the LTC form first.', 'danger');
      return;
    }

    const route = this.getPreviewRoute();
    const queryParams = {
      id: claimId,
      subFormId: this.activeSubFormId,
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
    this.previewWindow.openUrl(previewUrl);
  }

  private navigateAfterSave(
    status: string,
    savedClaimId?: string | null
  ): void {
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
    if (!moduleUrl) return;

    if (status === this.codeClaimState.outbox) {
      this.router.navigateByUrl(moduleUrl + `/claim-new`);
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
        `Unable to submit ${this.getFormDisplayName()} without claim id.`,
        'danger'
      );
      this.$common.hideLoader();
      this.disableBtn = false;
      return;
    }

    const payload = this.buildClaimRemarkPayload(this.codeClaimState.outbox, claimId);
    const isESign = this.claims.signWith === this.codeSignType.eSign;
    const statusRequest$ = isESign
      ? this.$esignApi.prepareForESign(payload)
      : this.$claimStateApi.changeStatusById(payload);

    statusRequest$.subscribe(
      (response: any) => {
        this.$common.hideLoader();
        this.disableBtn = false;

        if (!response?.status) {
          this.$common.showMessage(
            response?.message || `Unable to submit ${this.getFormDisplayName()}.`,
            'danger'
          );
          return;
        }

        this.$claimStateApi.notifyStatusCountRefresh();

        if (isESign) {
          this.eSignTempFormObj = response.object || payload;
          if (typeof $ !== 'undefined') {
            $('#esign_modal').modal('show');
          }
          return;
        }

        const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
        if (moduleUrl) {
          this.router.navigateByUrl(moduleUrl + '/claim-new');
        }
      },
      () => {
        this.$common.hideLoader();
        this.disableBtn = false;
        this.$common.showMessage(
          `Unable to submit ${this.getFormDisplayName()}.`,
          'danger'
        );
      }
    );
  }

  formValidate(): void {
    const ok = this.runLtcClientValidationOnly();
    if (!ok) return;

    this.$common.showMessage(
      'Validation successful. Please submit the form to proceed.',
      'success'
    );
  }

  saveDraft(): void {
    this.saveClaim(this.codeClaim.ltcClm, this.codeClaimState.draft);
  }

  submit(form: NgForm): void {
    if (form.invalid) {
      this.$common.showMessage('Please fill all required fields.', 'danger');
      this.jumpToFirstInvalidTab();
      return;
    }

    if (!this.claims?.gxFormFileUrl) {
      this.showErrors = true;
      this.$common.showMessage('Please upload GX Form PDF.', 'danger');
      this.setTab('ship');
      return;
    }

    const ok = this.runLtcClientValidationOnly();
    if (!ok) return;

    this.calculateAmount();
    this.saveClaim(this.codeClaim.ltcClm, this.codeClaimState.outbox);
  }

  private jumpToFirstInvalidTab(): void {
    // Simple heuristic: if basic fields missing => ship; if financial undertakings missing => ship3; etc.
    const dto = this.claims.yatLtcClaimDTOs[0];
    if (
      !dto.name ||
      !dto.rank ||
      !dto.pno ||
      !dto.gxNumber ||
      !dto.gxDate ||
      !this.claims.occDate
    ) {
      this.setTab('ship');
      return;
    }
    if (!dto.codeLtcTypeDTO?.ltcTypeId || !dto.blockYear) {
      this.setTab('ship2');
      return;
    }
    if (!dto.place || !dto.isUndertaking) {
      this.setTab('ship3');
      return;
    }
    this.setTab('ship');
  }

  validateSection(sectionId: string): boolean {
    const section = document.getElementById(sectionId);
    if (!section) return true;

    return validateLegacyRequiredSection(section);
  }

  clearLegacyInvalid(event: Event): void {
    clearLegacyInvalidFromEvent(event);
  }

  goBack(): void {
    if (window.history.length > 1) this.location.back();
    else window.close();
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
        this.showGxFileBrowse = false;
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
    this.gxFile = null;
    this.gxFileName = '';
    if (this.gxFilePreviewUrl) URL.revokeObjectURL(this.gxFilePreviewUrl);
    this.gxFilePreviewUrl = '';
    this.showGxFileBrowse = true;
  }

  openSelectedGxFile() {
    if (!this.gxFilePreviewUrl) return;
    window.open(this.gxFilePreviewUrl, '_blank');
  }

  viewExistingGxFile() {
    if (!this.claims?.gxFormFileUrl) return;
    this.$auth.viewFile(this.claims.gxFormFileUrl);
  }

  private runLtcClientValidationOnly(): boolean {
    const tabSections = ['ship', 'ship2', 'ship3', 'ship4', 'ship5', 'ship7', 'ship6'];
    for (const sectionId of tabSections) {
      if (!this.validateSection(sectionId)) {
        this.setTab(sectionId as any);
        this.$common.showMessage(
          'Please complete the required fields before proceeding.',
          'danger'
        );
        return false;
      }
    }

    const adv = this.claims?.yatLtcClaimDTOs?.[0];
    if (!adv) {
      this.setTab('ship');
      this.$common.showMessage('LTC details are required.', 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxUnit)) {
      this.setTab('ship');
      this.$common.showMessage('Please select Gx Unit.', 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxNumber)) {
      this.setTab('ship');
      this.$common.showMessage('Please fill Gx Number.', 'danger');
      return false;
    }

    if (this.isNullOrEmpty(adv.gxDate)) {
      this.setTab('ship');
      this.$common.showMessage('Please select Gx Date.', 'danger');
      return false;
    }

    if (!this.claims?.gxFormFileUrl) {
      this.showErrors = true;
      this.setTab('ship');
      this.$common.showMessage('Please upload GX Form PDF.', 'danger');
      return false;
    }

    if (!this.claims?.yatDtsDetailDTOs?.length) {
      this.setTab('ship2');
      this.$common.showMessage(
        'Please add at least one travel detail row.',
        'danger'
      );
      return false;
    }

    if ((adv?.isDts || '').trim() === 'No' && !(adv?.reasonForNoDts || '').trim()) {
      this.setTab('ship');
      this.$common.showMessage(
        'Please fill the reason for not taking DTS.',
        'danger'
      );
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
        : 'Please fill the reason for not taking DTS for all non-DTS travel detail rows.';
      this.setTab('ship2');
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
          ? { id: codeDocInfoDTO.id, docName: codeDocInfoDTO.docName }
          : null,
        descr: doc?.otherDocName || doc?.descr || null,
      };
    });
  }

  private mapTravelRowsForSave(rows: any[]): any[] {
    return (rows || []).map((row) => {
      const amount =
        this.normalizeAmountString(row?.tempAmount) ||
        this.normalizeAmountString(row?.amount, '0');
      const cleaned = {
        ...row,
        amount,
      };
      delete cleaned.tempAmount;
      return cleaned;
    });
  }

  saveClaim(type: string, status: string): void {
    if (type !== this.codeClaim.ltcClm) return;

    this.calculateAmount();
    this.removeEmoji();
    this.normalizeFinancialPlace();
    this.normalizeLtcPlace();
    this.disableBtn = true;
    this.$common.showLoader();

    try {
      const tempClaim: any = JSON.parse(JSON.stringify(this.claims));

      tempClaim.claimState = status;
      tempClaim.roleTypeId = this.userIdDetails?.roleTypeId;
      tempClaim.aclUserDTO = tempClaim.aclUserDTO || {
        userId: this.userIdDetails?.userId,
      };
      tempClaim.codeSubFormDTO = tempClaim.codeSubFormDTO || {
        subFormId: this.codeClaim.ltcClm,
      };

      if (tempClaim.codeUnitDTO?.unit || this.claims?.codeUnitDTO?.unit) {
        tempClaim.codeUnitDTO = {
          unit: tempClaim.codeUnitDTO?.unit || this.claims.codeUnitDTO?.unit,
        };
      }

      tempClaim.codeSubFormDTO = {
        ...(tempClaim.codeSubFormDTO || {}),
        subFormId: this.activeSubFormId,
      };

      tempClaim.yatDocsDTOs = this.mapClaimDocumentsForSave(this.claims.yatDocsDTOs || []);
      tempClaim.yatDtsDetailDTOs = this.mapTravelRowsForSave(
        tempClaim.yatDtsDetailDTOs || []
      );
      if (this.supplementaryId) tempClaim.supClaimId = this.supplementaryId;
      if (this.resubClaimId) tempClaim.refAdvanceId = this.resubClaimId;
      tempClaim.ifscnull = !tempClaim.yatClaimBankDetailDTO?.ifscCode;
      tempClaim.occDate = this.UtilService.toMillis(tempClaim.occDate);

      tempClaim.yatLtcClaimDTOs = (tempClaim.yatLtcClaimDTOs || []).map(
        (adv: any) => ({
          ...adv,
          gxDate: this.UtilService.toMillis(adv.gxDate),
          joiningDate: this.UtilService.toMillis(adv.joiningDate),
          date: this.UtilService.toMillis(adv.date),
        })
      );

      const formData = new FormData();
      formData.append('yatClaimDTO', JSON.stringify(tempClaim));

      this.$claimApi.createOrUpdateClaim(formData, null).subscribe(
        (res: any) => {
          const obj = Array.isArray(res?.object)
            ? res.object[0]
            : res?.object || res?.obj || res;

          if (obj?.claimId || obj?.id) {
            this.claims.claimId = obj.claimId || obj.id;
          }
          this.mergeSavedLtcResponse(obj);

          const moduleUrl = this.$auth.getModuleName
            ? this.$auth.getModuleName()
            : '';

          if (status === this.codeClaimState.outbox) {
            this.$common.showMessage(
              res?.message || `${this.getFormDisplayName()} submitted successfully!`,
              'success'
            );
          } else {
            this.$common.showMessage(
              res?.message || `${this.getFormDisplayName()} draft saved successfully.`,
              'success'
            );
          }
          const savedClaimId =
            obj.claimId || obj.id || this.claims.claimId || this.claimIdParam;
          if (status === this.codeClaimState.outbox) {
            this.completeSubmitStatusTransition(savedClaimId);
          } else {
            this.navigateAfterSave(status, savedClaimId);
            this.$common.hideLoader();
            this.disableBtn = false;
          }
          this.checkForPreviewBtn();
        },
        (err: any) => {
          console.error(`Error while saving ${this.getFormDisplayName()}`, err);
          this.$common.showMessage(`Error while saving ${this.getFormDisplayName()}.`, 'danger');
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error(`Exception while saving ${this.getFormDisplayName()}`, err);
      this.$common.showMessage(`Error while saving ${this.getFormDisplayName()}.`, 'danger');
      this.$common.hideLoader();
      this.disableBtn = false;
    }
  }

  // ---------- Travel details ----------
  onIsDtsChangeLtc(row: any) {
    // When DTS = Yes/NA, clear reason and remove error
    if (row.isDts === 'Yes' || row.isDts === 'NA') {
      row.reasonForNoDts = '';
      row._reasonForNoDtsError = false;
      return;
    }

    // When DTS = No, validate immediately
    this.validateLtcTravel(row, 'reasonForNoDts');
  }

  validateLtcTravel(row: any, field: string) {
    if (!row) return;

    if (field === 'modeOfTravel') {
      const mode = (row.modeOfTravel || '').trim();
      this.otherMode = mode === 'Others';
      this.boolIsDts = mode === 'Air' || mode === 'Train';
      this.isDtsDisabled = !!mode && !this.boolIsDts;

      if (!this.otherMode) {
        row.otherModeOfTravel = '';
      }

      if (this.isDtsDisabled) {
        row.isDts = 'NA';
        row.reasonForNoDts = '';
        row._reasonForNoDtsError = false;
        this.reasonDisable = true;
      } else if (row.isDts === 'NA') {
        row.isDts = '';
      }
    }

    if (field === 'isDts') {
      this.reasonDisable = row.isDts !== 'No';
      if (this.reasonDisable) {
        row.reasonForNoDts = '';
        row._reasonForNoDtsError = false;
      }
    }

    // only validate reason when DTS is No
    if (field === 'reasonForNoDts') {
      row._reasonForNoDtsError =
        row.isDts === 'No' &&
        (!row.reasonForNoDts || row.reasonForNoDts.trim() === '');
    }

    // you can extend this for other fields if you want same style validations
  }

  private resolveSubFormId(rawSubFormId: any): string {
    const id = String(rawSubFormId || '').toUpperCase();
    if (id === 'LTC' || id === 'LTCCLM' || id === 'L' || id === 'LC') return this.codeClaim.ltcClm;
    return this.codeClaim.ltcClm;
  }

  private getCurrentFormRoute(): string {
    return 'form-ltc-claim';
  }

  private getPreviewRoute(): string {
    return 'preview-ltc-claim';
  }

  private getFormDisplayName(): string {
    return 'LTC claim';
  }
}




