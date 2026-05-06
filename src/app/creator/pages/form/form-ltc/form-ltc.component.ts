import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/service/util.service';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { ClaimService } from 'src/app/service/claim.service';
import { DropdownManageService } from 'src/app/service/dropdownManage.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { take } from 'rxjs/operators';

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

interface YatLtcAdvDTO {
  ltcAdvId: string;
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

  isNewlyMarried: boolean;
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
  signWith: string;
  occDate: string;
  gxFormFileUrl: string;
  internalRemarks: string;
  gxFormModel?: any;

  yatLtcAdvDTOs: YatLtcAdvDTO[];
  yatFamilyDetailDTOs: YatFamilyDetailDTO[];
  yatDtsDetailDTOs: YatDtsDetailDTO[];

  yatClaimBankDetailDTO: ClaimBankDetailDTO;
}

@Component({
  selector: 'app-form-ltc',
  templateUrl: './form-ltc.component.html',
  styleUrls: ['./form-ltc.component.css'],
  standalone: false,
})
export class FormLtcAdvanceComponent implements OnInit {
  removeEmoji() {
    throw new Error('Method not implemented.');
  }
  // UI state
  activeTab: 'ship' | 'ship2' | 'ship3' | 'ship4' | 'ship5' = 'ship';
  disableBtn = false;
  fullFormDisabled = false;
  isPreviewDisabled = false;
  gxFormUploading = false;

  // Sign types (match your old constants concept)
  codeSignType = {
    inkSign: 'INK_SIGN',
    eSign: 'E_SIGN',
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
  doe = 2; // degree of entitlement / family eligibility, replace by API logic

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

  // Temp travel entry
  tempLtcTravelDetails: Partial<YatDtsDetailDTO> = this.defaultTempTravel();

  // Main model
  claims: ClaimsModel = this.defaultClaims();
  disableHomeTown: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private UtilService: UtilService,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $common: CommonService,
    private $claim: ClaimService,
    private $dropdownManage: DropdownManageService,
    private $formManage: FormManageService
  ) {}

  ngOnInit(): void {
    // Replace these with your real API calls
    this.loadInitialMasterData();
    this.calculateAmount();
  }

  // ---------- Defaults ----------
  private defaultClaims(): ClaimsModel {
    return {
      signWith: this.codeSignType.inkSign,
      occDate: '',
      gxFormFileUrl: '',
      internalRemarks: '',
      yatLtcAdvDTOs: [this.defaultLtcAdv()],
      yatFamilyDetailDTOs: [],
      yatDtsDetailDTOs: [],
      yatClaimBankDetailDTO: {
        bankName: '',
        ifscCode: '',
        bankAccNo: '',
        micrCode: '',
      },
    };
  }

  private defaultLtcAdv(): YatLtcAdvDTO {
    return {
      ltcAdvId: '',
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
      isDts: '',
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
      isNewlyMarried: false,
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
    const order: any[] = ['ship', 'ship2', 'ship3', 'ship4', 'ship5'];
    const idx = order.indexOf(this.activeTab);
    if (idx < order.length - 1) this.activeTab = order[idx + 1];
  }

  previousTabActive(): void {
    const order: any[] = ['ship', 'ship2', 'ship3', 'ship4', 'ship5'];
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

  private toNumber(v: any): number {
    const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  // ---------- GX file ----------
  onGxFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF allowed.');
      input.value = '';
      return;
    }

    const max = 512 * 1024;
    if (file.size > max) {
      alert('PDF must be upto 512 KB.');
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
  changeLtcType(): void {
    // your Java logic likely toggles hometown enable/disable etc.
    // keep minimal: reset place fields when type changes
    this.hideDiv();
  }

  hideDiv(): void {
    // replicate your logic if any UI sections depend on blockYear
    // currently no-op
  }

  isPlaceVisitRequired(): boolean {
    const id = this.claims.yatLtcAdvDTOs[0].codeLtcTypeDTO?.ltcTypeId;
    return (
      id === this.yatLtcTypes.placeAnywhereInIndia ||
      id === this.yatLtcTypes.specialPlace
    );
  }

  ltcChange(_mode: 's' | 'f', _calc: boolean): void {
    // you probably also recalc entitlement/selected family members
    // keep minimal
  }

  resetSpouseDetails(): void {
    if (!this.claims.yatLtcAdvDTOs[0].isNewlyMarried) {
      this.claims.yatLtcAdvDTOs[0].yatSpouseDetailDTO = {
        memberName: '',
        age: '',
        relation: '',
        occupation: '',
      };
    }
  }

  addOrUpdateLtcTravelDetails(): void {
    // Hard validation (don’t depend only on required attr)
    const t = this.tempLtcTravelDetails;

    if (!t.source || !t.destination || !t.modeOfTravel || !t.isDts) {
      alert('Please fill From/To/Mode/DTS.');
      return;
    }
    if (this.otherMode && !(t.otherModeOfTravel || '').trim()) {
      alert('Please fill Other Mode of Travel.');
      return;
    }
    if (!String(t.amount || '').trim()) {
      alert('Please fill Amount.');
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
    this.reasonDisable = !(row.isDts === 'No');
    this.setTab('ship2');
  }

  deleteLtcTravelDetails(index: number): void {
    this.claims.yatDtsDetailDTOs.splice(index, 1);
    this.calculateAmount();
  }

  resetTempLtcTravelDetails(): void {
    this.tempLtcTravelDetails = this.defaultTempTravel();
    this.otherMode = false;
    this.reasonDisable = true;
    this.editIndex = -1;
    this.isEdit = false;
    this.travelBtnName = 'Add';
  }

  // ---------- Amount calculations ----------
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

    const dto = this.claims.yatLtcAdvDTOs[0];
    dto.totalAmt = String(total);
    dto.dtsAmount = String(dts);
    dto.advAmt = String(adv);
    dto.totalBudgetedAmt = String(budgeted);
  }

  // ---------- Actions (wire to your real services) ----------
  loadInitialMasterData(): void {
    // Replace by API calls

    this.allUnits = ['UNIT A', 'UNIT B', 'UNIT C'];
    this.blockYears = ['2024-2025', '2026-2027', '2028-2029'];

    this.allCodeLtcType = [
      {
        ltcTypeId: this.yatLtcTypes.placeAnywhereInIndia,
        descr: 'Place Anywhere in India',
      },
      { ltcTypeId: this.yatLtcTypes.specialPlace, descr: 'Special Place' },
      { ltcTypeId: 'HOMETOWN', descr: 'Home Town' },
    ];

    // Example unit list for Applied To
    this.claims.yatLtcAdvDTOs[0].unitList = [
      'Directorate',
      'GC Delhi',
      'Unit XYZ',
    ];

    // Example villages
    this.claims.yatLtcAdvDTOs[0].codeHrPincodeVillageDTOs = [
      { village: 'SONIPAT' },
      { village: 'DELHI' },
    ];

    // Example family
    this.claims.yatFamilyDetailDTOs = [
      {
        memberName: 'Self',
        age: '30',
        relation: 'Self',
        occupation: 'Service',
        checkedIndicator: true,
      },
    ];

    // Bank example
    this.claims.yatClaimBankDetailDTO = {
      bankName: 'SBI',
      ifscCode: 'SBIN0000000',
      bankAccNo: '1234567890',
      micrCode: '110002345',
    };
  }

  checkValidSignType(): void {
    // your real rule depends on "appliedTo" etc.
    // keep minimal: if eSign selected but appliedTo empty => block
    if (
      this.claims.signWith === this.codeSignType.eSign &&
      !this.claims.yatLtcAdvDTOs[0].appliedTo
    ) {
      alert('Please select Applied To before choosing eSign.');
      this.claims.signWith = this.codeSignType.inkSign;
    }
  }

  checkEsignAvailability(): void {
    // call your API if needed
  }

  getTransBasicPay(): void {
    // your old logic ties occDate + blockYear + refAdvanceId etc.
    // call API if required
  }

  getLtcEntitled(): void {
    // open modal or route; implement as per your Angular project
    alert('Hook LTC Entitled modal/API here.');
  }

  getLtcAvailedHistory(): void {
    // open modal or route
    alert('Hook LTC Availed History modal/API here.');
  }

  openIfscModal(): void {
    // open your Angular modal (ng-bootstrap/material/etc.)
    alert('Hook IFSC update modal here.');
  }

  navigatePreview(): void {
    // route to preview page
    // this.router.navigate([...])
    alert('Hook preview navigation here.');
  }

  formValidate(): void {
    // do your full validation before submit
    alert('Hook your validation logic here (same as TY/FTE/PMT).');
  }

  saveDraft(): void {
    // call save API with draft state
    alert('Hook save draft API here.');
  }

  submit(form: NgForm): void {
    if (form.invalid) {
      alert('Please fill all required fields.');
      this.jumpToFirstInvalidTab();
      return;
    }

    // Additional hard checks
    if (this.showGxFileBrowse && !this.gxFile) {
      alert('Please upload GX Form PDF.');
      this.setTab('ship');
      return;
    }

    // Ensure calculations are current
    this.calculateAmount();

    // Call your submit API
    console.log('Submitting LTC Advance', this.claims);
    alert('Hook submit API here.');
  }

  private jumpToFirstInvalidTab(): void {
    // Simple heuristic: if basic fields missing => ship; if financial undertakings missing => ship3; etc.
    const dto = this.claims.yatLtcAdvDTOs[0];
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

    this.$formManage.uploadImg(event);
    this.$formManage.docFileUrl.pipe(take(1)).subscribe((res: unknown) => {
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
    if (!this.claims?.gxFormFileUrl) return;
    const ok = window.confirm('Do you really want to delete this GX Form?');
    if (!ok) return;

    this.$formManage.deleteByUrl(this.claims.gxFormFileUrl);
    this.$formManage.docFileUrlDeleted.pipe(take(1)).subscribe(() => {
      this.claims.gxFormFileUrl = null;
    });
  }

  openSelectedGxFile() {
    if (!this.gxFilePreviewUrl) return;
    window.open(this.gxFilePreviewUrl, '_blank');
  }

  viewExistingGxFile() {
    if (!this.claims?.gxFormFileUrl) return;
    window.open(this.fileUrl + this.claims.gxFormFileUrl, '_blank');
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

    // only validate reason when DTS is No
    if (field === 'reasonForNoDts') {
      row._reasonForNoDtsError =
        row.isDts === 'No' &&
        (!row.reasonForNoDts || row.reasonForNoDts.trim() === '');
    }

    // you can extend this for other fields if you want same style validations
  }
}
