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
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
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
  claimId?: number | null;
  claimState?: string | null;
  signWith: string;
  occDate: string;
  gxFormFileUrl: string;
  internalRemarks: string;
  gxFormModel?: any;
  codeSubFormDTO?: any;
  codeUnitDTO?: any;
  aclUserDTO?: any;

  yatLtcAdvDTOs: YatLtcAdvDTO[];
  yatFamilyDetailDTOs: YatFamilyDetailDTO[];
  yatDtsDetailDTOs: YatDtsDetailDTO[];
  yatDocsDTOs: any[];

  yatClaimBankDetailDTO: ClaimBankDetailDTO;
}

@Component({
  selector: 'app-form-ltc',
  templateUrl: './form-ltc.component.html',
  styleUrls: ['./form-ltc.component.css'],
  standalone: false,
})
export class FormLtcAdvanceComponent implements OnInit {
  activeFormKind: 'advance' | 'claim' = 'advance';
  activeSubFormId = 'L';
  removeEmoji() {
    this.claims.internalRemarks = (this.claims.internalRemarks || '').replace(
      /[\u{1F300}-\u{1FAFF}]/gu,
      ''
    );
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
  userIdDetails: any;
  claimIdParam: string | null = null;
  supplementaryId: string | null = null;
  documentDtos: any[] = [];
  codeClaim = { ltcAdv: 'L' } as const;
  codeClaimState = {
    draft: 'DR',
    outbox: 'OB',
  } as const;

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
    private $formManage: FormManageService,
    private $codeDocInfo: CodeDocInfoService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.activeFormKind = this.resolveFormKind(this.route.snapshot.data?.['formKind']);
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
    this.claimIdParam = qp.get('claimId');
    this.supplementaryId = qp.get('supId');
  }

  // ---------- Defaults ----------
  private defaultClaims(): ClaimsModel {
    return {
      claimId: null,
      claimState: null,
      signWith: this.codeSignType.inkSign,
      occDate: '',
      gxFormFileUrl: '',
      internalRemarks: '',
      codeSubFormDTO: { subFormId: this.codeClaim.ltcAdv },
      codeUnitDTO: { unit: '', descr: '' },
      yatLtcAdvDTOs: [this.defaultLtcAdv()],
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

  private formatDateInput(value: any): string {
    if (!value) return '';
    const dt = this.datePipe.transform(value, 'yyyy-MM-dd');
    return dt || '';
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

  getFormDetails(): void {
    try {
      this.$common.showLoader();

      const headers: any = {
        isPreview: 'false',
        gxUnitId: this.userIdDetails?.unitId ?? '',
        userId: this.userIdDetails?.userId ?? '',
        subFormId: this.activeSubFormId,
        isFetch: 'true',
        claimId: this.claimIdParam || '',
      };
      if (this.supplementaryId) {
        headers.supCLaimId = this.supplementaryId;
      }

      this.$claim.getSingleClaim({ headers }).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          if (!response || response.status !== true) {
            this.$common.showMessage(
              response?.message || 'Unable to load LTC Advance details.',
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

          const adv = this.claims.yatLtcAdvDTOs[0];
          const dto =
            Array.isArray(obj.yatLtcAdvDTOs) && obj.yatLtcAdvDTOs.length > 0
              ? obj.yatLtcAdvDTOs[0]
              : null;

          if (dto) {
            adv.ltcAdvId = dto.ltcAdvId ?? '';
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
            adv.isDts = dto.isDts ?? '';
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
            adv.ltcPlace = dto.ltcPlace ?? '';
            adv.gxUnit = dto.gxUnit ?? '';
            adv.isNewlyMarried = !!dto.isNewlyMarried;
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
            yatLtcAdvDTOs: [{ ...adv }],
            yatFamilyDetailDTOs: Array.isArray(obj.yatFamilyDetailDTOs)
              ? obj.yatFamilyDetailDTOs
              : this.claims.yatFamilyDetailDTOs,
            yatDtsDetailDTOs: Array.isArray(obj.yatDtsDetailDTOs)
              ? obj.yatDtsDetailDTOs.map((row: any) => ({
                  ...row,
                  tempAmount: row?.tempAmount ?? row?.amount ?? '',
                }))
              : this.claims.yatDtsDetailDTOs,
            yatDocsDTOs: Array.isArray(obj.yatDocsDTOs) ? obj.yatDocsDTOs : [],
            yatClaimBankDetailDTO: {
              ...this.claims.yatClaimBankDetailDTO,
              ...(obj.yatClaimBankDetailDTO || {}),
            },
          };

          this.showGxFileBrowse = !this.claims.gxFormFileUrl;
          this.documentDtos = this.claims.yatDocsDTOs || [];
          this.$codeDocInfo.setDocument(this.documentDtos as []);
          this.checkForPreviewBtn();
          this.calculateAmount();
        },
        (error: any) => {
          this.$common.hideLoader();
          console.error('Error while loading LTC Advance details.', error);
          this.$common.showMessage(
            'Error while loading LTC Advance details.',
            'danger'
          );
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      console.error('Exception in getFormDetails()', e);
      this.$common.showMessage(
        'Error while loading LTC Advance details.',
        'danger'
      );
    }
  }

  checkForPreviewBtn(): void {
    this.isPreviewDisabled = !this.claims?.claimId;
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
    const claimId = this.claims?.claimId;
    if (!claimId) {
      this.$common.showMessage(
        'Please save the LTC claim before checking eSign availability.',
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
      },
    };

    this.$claim.checkEsignAvailability(config).subscribe({
      next: (response: any) => {
        if (response?.status !== true) {
          this.claims.signWith = this.codeSignType.inkSign;
          this.$common.showMessage(
            response?.message || 'eSign is not available for this claim.',
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
    this.$common.showMessage('LTC entitlement lookup is not configured yet.', 'danger');
  }

  getLtcAvailedHistory(): void {
    const moduleUrl = this.$auth.getModuleName
      ? this.$auth.getModuleName()
      : '';
    const query: any = {};
    if (this.claims?.claimId) {
      query.id = this.claims.claimId;
    }
    if (moduleUrl) {
      this.router.navigate([`${moduleUrl}/form-ltc-availed-history`], {
        queryParams: query,
      });
    } else {
      this.router.navigate(['../form-ltc-availed-history'], {
        relativeTo: this.route,
        queryParams: query,
      });
    }
  }

  openIfscModal(): void {
    this.$common.showMessage('IFSC modal flow is not configured yet.', 'danger');
  }

  navigatePreview(): void {
    const claimId = this.claims?.claimId || this.claimIdParam;
    if (!claimId) {
      this.$common.showMessage('Please save the LTC form first.', 'danger');
      return;
    }

    this.router.navigate([`../${this.getPreviewRoute()}`], {
      relativeTo: this.route,
      queryParams: {
        claimId,
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

  formValidate(): void {
    const ok = this.runLtcClientValidationOnly();
    if (!ok) return;

    this.$common.showMessage(
      'Validation successful. Please submit the form to proceed.',
      'success'
    );
  }

  saveDraft(): void {
    this.saveClaim(this.codeClaim.ltcAdv, this.codeClaimState.draft);
  }

  submit(form: NgForm): void {
    if (form.invalid) {
      this.$common.showMessage('Please fill all required fields.', 'danger');
      this.jumpToFirstInvalidTab();
      return;
    }

    if (this.showGxFileBrowse && !this.gxFile) {
      this.$common.showMessage('Please upload GX Form PDF.', 'danger');
      this.setTab('ship');
      return;
    }

    const ok = this.runLtcClientValidationOnly();
    if (!ok) return;

    this.calculateAmount();
    this.saveClaim(this.codeClaim.ltcAdv, this.codeClaimState.outbox);
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

  validateSection(sectionId: string): boolean {
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
        this.showGxFileBrowse = false;
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
      this.showGxFileBrowse = true;
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

  private runLtcClientValidationOnly(): boolean {
    const tabSections = ['ship', 'ship2', 'ship3', 'ship4', 'ship5'];
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

    if (!this.claims?.yatDtsDetailDTOs?.length) {
      this.setTab('ship2');
      this.$common.showMessage(
        'Please add at least one travel detail row.',
        'danger'
      );
      return false;
    }

    const adv = this.claims?.yatLtcAdvDTOs?.[0];
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

  saveClaim(type: string, status: string): void {
    if (type !== this.codeClaim.ltcAdv) return;

    this.calculateAmount();
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
        subFormId: this.codeClaim.ltcAdv,
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

      tempClaim.yatDocsDTOs = this.mapClaimDocumentsForSave(this.documentDtos);
      if (this.supplementaryId) tempClaim.supClaimId = this.supplementaryId;
      tempClaim.ifscnull = !tempClaim.yatClaimBankDetailDTO?.ifscCode;
      tempClaim.occDate = this.UtilService.toMillis(tempClaim.occDate);

      tempClaim.yatLtcAdvDTOs = (tempClaim.yatLtcAdvDTOs || []).map(
        (adv: any) => ({
          ...adv,
          gxDate: this.UtilService.toMillis(adv.gxDate),
          joiningDate: this.UtilService.toMillis(adv.joiningDate),
          date: this.UtilService.toMillis(adv.date),
        })
      );

      const formData = new FormData();
      formData.append('yatClaimDTO', JSON.stringify(tempClaim));

      this.$claim.createOrUpdateClaim(formData, null).subscribe(
        (res: any) => {
          const obj = Array.isArray(res?.object)
            ? res.object[0]
            : res?.object || res?.obj || res;

          if (obj?.claimId || obj?.id) {
            this.claims.claimId = obj.claimId || obj.id;
          }

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
          this.navigateAfterSave(
            status,
            obj.claimId || obj.id || this.claims.claimId || this.claimIdParam
          );

          this.$common.hideLoader();
          this.disableBtn = false;
          this.checkForPreviewBtn();
        },
        (err: any) => {
          console.error('Error while saving LTC claim', err);
          this.$common.showMessage('Error while saving LTC claim.', 'danger');
          this.$common.hideLoader();
          this.disableBtn = false;
        }
      );
    } catch (err) {
      console.error('Exception while saving LTC claim', err);
      this.$common.showMessage('Error while saving LTC claim.', 'danger');
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

    // only validate reason when DTS is No
    if (field === 'reasonForNoDts') {
      row._reasonForNoDtsError =
        row.isDts === 'No' &&
        (!row.reasonForNoDts || row.reasonForNoDts.trim() === '');
    }

    // you can extend this for other fields if you want same style validations
  }

  private resolveFormKind(rawFormKind: any): 'advance' | 'claim' {
    return String(rawFormKind || '').toLowerCase() === 'claim' ? 'claim' : 'advance';
  }

  private resolveSubFormId(rawSubFormId: any): string {
    const id = String(rawSubFormId || '').toUpperCase();
    if (id === 'LTC' || id === 'L' || id === 'LC') return 'L';
    return 'L';
  }

  private getCurrentFormRoute(): string {
    return this.activeFormKind === 'claim' ? 'form-ltc-claim' : 'form-ltc';
  }

  private getPreviewRoute(): string {
    return this.activeFormKind === 'claim' ? 'preview-ltc-claim' : 'preview-ltc-advance';
  }

  private getFormDisplayName(): string {
    return this.activeFormKind === 'claim' ? 'LTC claim' : 'LTC advance';
  }
}
