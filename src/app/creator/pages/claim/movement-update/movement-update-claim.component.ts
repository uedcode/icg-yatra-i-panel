import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { CodeGxTypeApiService } from 'src/app/service/api/code/code-gx-type-api.service';

interface MovementGxDetail {
  gxType?: string | null;
  unit?: string | null;
  gxDate?: string | null;
  gxNo?: string | null;
  dateOfTravel?: string | null;
}

interface MovementModel {
  claimId?: string | number | null;
  claimMode?: string | null;
  advanceMode?: string | null;
  subFormId?: string | null;
  purpose?: string | null;
  voucherNo?: string | null;
  voucherDate?: string | null;
  voucherAmt?: number | string | null;
  drawnFrom?: string | null;
  drawnFromOther?: string | null;
  creditDebitNo?: string | null;
  claimPassAmt?: number | string | null;
  claimAmt?: number | string | null;
  unitId?: string | null;
  letterNo?: string | null;
  letterNoDated?: string | null;
  isClaimAlreadySubmitted?: string | null;
  isClaimSettle?: string | null;
  yatTempDutyClaimGxDTOs: MovementGxDetail[];
  codeUnitDTO?: any;
  aclUserDTO?: any;
  signWith?: string | null;
  gxFormFileUrl?: string | null;
}

@Component({
  selector: 'app-movement-update-claim',
  templateUrl: './movement-update-claim.component.html',
  styleUrls: ['./movement-update-claim.component.scss'],
  standalone: false,
})
export class MovementUpdateClaimComponent implements OnInit {
  readonly yatTravelMode = {
    yatra: 'YT',
    manual: 'MN',
    nil: 'NL',
    supplementary: 'SP',
  } as const;

  readonly codeClaim = {
    pmtAdv: 'P',
    tyAdv: 'T',
    ltcAdv: 'L',
    fteAdv: 'F',
    resettleClm: 'RS',
  } as const;

  readonly codeClaimState = {
    draft: '',
  } as const;

  claimId = '';
  routeSubFormId = '';
  userIdDetails: any;
  movement: MovementModel = this.createEmptyMovement();
  tempGxDetails: MovementGxDetail = this.createEmptyGxDetail();
  voucherList: any[] = [];
  validationResult: any = null;
  allUnits: any[] = [];
  gxTypes: any[] = [];
  selectedGxIndex: number | null = null;
  saveButtonLabel = 'Save';
  isSaving = false;
  claimSubmitted = false;
  claimSettled = false;

  readonly modeOptions = [
    { id: this.yatTravelMode.yatra, label: 'YATRA Advance' },
    { id: this.yatTravelMode.manual, label: 'Manual Advance' },
    { id: this.yatTravelMode.nil, label: 'Nil Advance' },
    { id: this.yatTravelMode.supplementary, label: 'Supplementary' },
  ];

  readonly basePurposeOptions: Array<{ id: string; label: string }> = [
    { id: this.codeClaim.pmtAdv, label: 'PMT Duty Advance' },
    { id: this.codeClaim.tyAdv, label: 'TY Duty Advance' },
    { id: this.codeClaim.ltcAdv, label: 'LTC Advance' },
    { id: this.codeClaim.fteAdv, label: 'FTE Advance' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $codeUnitApi: CodeUnitApiService,
    private $codeGxTypeApi: CodeGxTypeApiService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.loadUnits();

    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || params.get('claimId') || '';
      this.routeSubFormId = this.normalizeSubFormId(params.get('subFormId') || '');
      this.resetScreen();
      if (!this.claimId) {
        return;
      }
      if (this.routeSubFormId) {
        this.movement.subFormId = this.routeSubFormId;
        this.movement.purpose = this.routeSubFormId;
      }
      this.loadMovement();
      this.loadVoucher();
    });
  }

  get purposeOptions(): Array<{ id: string; label: string }> {
    const options = [...this.basePurposeOptions];
    if (this.movement.claimMode === this.yatTravelMode.nil) {
      options.push({
        id: this.codeClaim.resettleClm,
        label: 'Resettlement Claim',
      });
    }
    return options;
  }

  get isNilOrSupplementary(): boolean {
    return (
      this.movement.claimMode === this.yatTravelMode.nil ||
      this.movement.claimMode === this.yatTravelMode.supplementary
    );
  }

  get isManualMode(): boolean {
    return this.movement.claimMode === this.yatTravelMode.manual;
  }

  get visibleModeOptions(): Array<{ id: string; label: string }> {
    return this.modeOptions.filter(
      (option) => option.id !== this.yatTravelMode.yatra || this.movement.claimMode === this.yatTravelMode.yatra
    );
  }

  get canOpenClaimForm(): boolean {
    return !!this.getClaimFormRoute(this.movement.subFormId || '');
  }

  trackByIndex(index: number): number {
    return index;
  }

  loadMovement(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        userId: this.userIdDetails?.userId || '',
      },
    };
    this.$common.showLoader();
    this.$claimApi.getSingleMovement(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        const row = Array.isArray(res?.object) && res.object.length ? res.object[0] : null;
        if (!row) {
          this.movement.claimId = this.claimId;
          return;
        }

        this.saveButtonLabel = 'Update';
        this.movement = {
          ...this.createEmptyMovement(),
          ...row,
          claimId: row?.claimId || this.claimId,
          claimMode: row?.advanceMode || row?.claimMode || '',
          advanceMode: row?.advanceMode || row?.claimMode || '',
          subFormId: this.normalizeSubFormId(
            row?.purpose || row?.subFormId || row?.codeSubFormDTO?.subFormId || ''
          ),
          purpose: this.normalizeSubFormId(
            row?.purpose || row?.subFormId || row?.codeSubFormDTO?.subFormId || ''
          ),
          voucherDate: this.toInputDate(row?.voucherDate),
          letterNoDated: this.toInputDate(row?.letterNoDated),
          yatTempDutyClaimGxDTOs: this.normalizeGxDetails(row?.yatTempDutyClaimGxDTOs),
        };
        if (!this.movement.subFormId && this.routeSubFormId) {
          this.movement.subFormId = this.routeSubFormId;
          this.movement.purpose = this.routeSubFormId;
        }

        this.onClaimModeChange(false);
        this.syncManualSettlementFlags();
        this.loadGxTypes(this.movement.subFormId || '');
        this.loadVoucher();
      },
      () => this.$common.hideLoader()
    );
  }

  loadVoucher(): void {
    const subFormId = this.normalizeSubFormId(this.movement.subFormId || this.routeSubFormId || '');
    const config = {
      headers: {
        claimId: this.claimId,
        ...(subFormId ? { subFormId } : {}),
      },
    };
    this.$claimApi.getAdvanceVoucher(config).subscribe((res: any) => {
      this.voucherList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  loadUnits(): void {
    this.$codeUnitApi.getAllUnits().subscribe((res: any) => {
      this.allUnits = Array.isArray(res?.object) ? res.object : [];
    });
  }

  loadGxTypes(subFormId: string): void {
    if (!subFormId) {
      this.gxTypes = [];
      return;
    }

    const config = {
      headers: {
        tyClaim: subFormId === this.codeClaim.tyAdv ? '1' : '',
        pmtClaim: subFormId === this.codeClaim.pmtAdv ? '1' : '',
        ltcClaim: subFormId === this.codeClaim.ltcAdv ? '1' : '',
        resettleClaim: subFormId === this.codeClaim.resettleClm ? '1' : '',
        fteClaim: subFormId === this.codeClaim.fteAdv ? '1' : '',
      },
    };

    this.$codeGxTypeApi.getAll(config).subscribe((res: any) => {
      this.gxTypes = Array.isArray(res?.object) ? res.object : [];
    });
  }

  validateMovement(openAfterValidate = false): void {
    const config = { headers: { claimId: this.claimId } };
    this.$claimApi.validateMovement(config).subscribe((res: any) => {
      this.validationResult = Array.isArray(res?.object) ? res.object[0] || null : res?.object || null;
      if (res?.status) {
        this.$common.showMessage(res?.message || 'Movement validated successfully.');
        if (openAfterValidate) {
          this.openClaimForm(true);
        }
      }
    });
  }

  onClaimModeChange(clearRows = true): void {
    if (this.isNilOrSupplementary) {
      this.movement.voucherNo = null;
      this.movement.voucherDate = null;
      this.movement.voucherAmt = null;
      this.movement.drawnFrom = null;
      this.movement.drawnFromOther = null;
    }

    if (
      this.movement.claimMode !== this.yatTravelMode.nil &&
      this.movement.subFormId === this.codeClaim.resettleClm
    ) {
      this.movement.subFormId = null;
      this.movement.purpose = null;
    }

    if (clearRows && this.movement.yatTempDutyClaimGxDTOs?.length) {
      this.movement.yatTempDutyClaimGxDTOs = [];
    }

    this.loadGxTypes(this.movement.subFormId || '');
  }

  onPurposeChange(): void {
    this.movement.purpose = this.movement.subFormId || null;
    this.movement.yatTempDutyClaimGxDTOs = [];
    this.resetGxDetails();
    this.loadGxTypes(this.movement.subFormId || '');
  }

  onAlreadySubmittedChange(): void {
    if (this.movement.isClaimAlreadySubmitted === '1') {
      this.claimSubmitted = true;
      return;
    }

    this.claimSubmitted = false;
    this.movement.unitId = null;
    this.movement.claimAmt = null;
    this.movement.isClaimSettle = null;
    this.claimSettled = false;
    this.movement.creditDebitNo = null;
    this.movement.claimPassAmt = null;
    this.movement.letterNo = null;
    this.movement.letterNoDated = null;
  }

  onClaimSettledChange(): void {
    if (this.movement.isClaimSettle === '1') {
      this.claimSettled = true;
      return;
    }

    this.claimSettled = false;
    this.movement.creditDebitNo = null;
    this.movement.claimPassAmt = null;
    this.movement.letterNo = null;
    this.movement.letterNoDated = null;
  }

  addOrUpdateGxDetail(): void {
    if (!this.tempGxDetails.gxType) {
      this.$common.showMessage('Please select GX type.', 'danger');
      return;
    }
    if (!this.tempGxDetails.unit) {
      this.$common.showMessage('Please select GX unit.', 'danger');
      return;
    }
    if (!this.tempGxDetails.gxDate) {
      this.$common.showMessage('Please select GX date.', 'danger');
      return;
    }
    if (!this.tempGxDetails.gxNo) {
      this.$common.showMessage('Please enter GX number.', 'danger');
      return;
    }
    if (!this.tempGxDetails.dateOfTravel) {
      this.$common.showMessage('Please select date of occurrence.', 'danger');
      return;
    }

    const currentGxType = (this.tempGxDetails.gxType || '').trim();
    const isPmtClaim = this.movement.subFormId === this.codeClaim.pmtAdv;
    const allowsTyDuplicates =
      currentGxType === 'Transfer from Ty Unit' ||
      currentGxType === 'Reporting at Ty Unit';
    const existingRows = (this.movement.yatTempDutyClaimGxDTOs || []).filter(
      (_row, index) => this.selectedGxIndex === null || index !== this.selectedGxIndex
    );

    const duplicateExists = existingRows.some(
      (row) =>
        (row?.gxType || '').trim() === currentGxType &&
        !(allowsTyDuplicates || isPmtClaim)
    );
    if (duplicateExists) {
      this.$common.showMessage("GX Type can't be Duplicate", 'danger');
      return;
    }

    let cancelCheckToken = '';
    if (
      currentGxType.includes('Reporting back Parent Unit') ||
      currentGxType === 'Reporting' ||
      currentGxType === 'Completion'
    ) {
      cancelCheckToken = 'R';
    } else if (currentGxType.includes('Cancel')) {
      cancelCheckToken = 'C';
    }

    if (cancelCheckToken) {
      const conflictingRow = existingRows.find((row) => {
        const gxType = (row?.gxType || '').trim();
        if (cancelCheckToken === 'R') {
          return gxType.includes('Cancel');
        }
        return (
          gxType.includes('Reporting back Parent Unit') ||
          gxType === 'Reporting' ||
          gxType === 'Completion'
        );
      });

      if (conflictingRow) {
        const conflictLabel =
          cancelCheckToken === 'R'
            ? currentGxType
            : (conflictingRow?.gxType || '').trim();
        this.$common.showMessage(
          `${conflictLabel} and Cancel Gx can't be availed together`,
          'danger'
        );
        return;
      }
    }

    const normalized = this.normalizeSingleGxDetail(this.tempGxDetails);
    if (this.selectedGxIndex === null) {
      this.movement.yatTempDutyClaimGxDTOs.push(normalized);
      this.$common.showMessage('GX detail added successfully.');
    } else {
      this.movement.yatTempDutyClaimGxDTOs[this.selectedGxIndex] = normalized;
      this.$common.showMessage('GX detail updated successfully.');
    }
    this.resetGxDetails();
  }

  editGxDetail(row: MovementGxDetail, index: number): void {
    this.selectedGxIndex = index;
    this.tempGxDetails = this.normalizeSingleGxDetail(row);
  }

  removeGxDetail(index: number): void {
    this.movement.yatTempDutyClaimGxDTOs.splice(index, 1);
    if (this.selectedGxIndex === index) {
      this.resetGxDetails();
    }
    this.$common.showMessage('GX detail removed successfully.');
  }

  resetGxDetails(): void {
    this.selectedGxIndex = null;
    this.tempGxDetails = this.createEmptyGxDetail();
  }

  saveMovement(): void {
    if (!this.movement.claimMode) {
      this.$common.showMessage('Please select Mode.', 'danger');
      return;
    }
    if (!this.movement.subFormId) {
      this.$common.showMessage('Please select Purpose.', 'danger');
      return;
    }
    if (!this.validateVoucherInputs(this.codeClaimState.draft)) {
      return;
    }
    if (!this.validateManualSettlement()) {
      return;
    }

    const payload = this.buildSavePayload();
    this.isSaving = true;
    this.$common.showLoader();
    this.$claimApi
      .createOrUpdateClaim(payload, {
        headers: {
          claimStateId: this.codeClaimState.draft,
        },
      })
      .subscribe(
        (res: any) => {
          this.isSaving = false;
          this.$common.hideLoader();

          if (!res?.status) {
            this.$common.showMessage(res?.message || 'Movement update save failed.', 'danger');
            return;
          }

          const saved = Array.isArray(res?.object) ? res.object[0] || {} : res?.object || {};
          const nextClaimId = String(saved?.claimId || this.claimId || '');
          this.$common.showMessage(res?.message || 'Movement update saved successfully.', 'success');

          this.claimId = nextClaimId || this.claimId;
          setTimeout(() => {
            this.router.navigate([`${this.$auth.getModuleName()}/claim-new`], {
              queryParams: this.claimId
                ? {
                    id: this.claimId,
                    ...(this.movement.subFormId ? { subFormId: this.movement.subFormId } : {}),
                  }
                : {},
            });
          }, 600);
        },
        () => {
          this.isSaving = false;
          this.$common.hideLoader();
          this.$common.showMessage('Error while saving movement update.', 'danger');
        }
      );
  }

  openVoucherPreview(): void {
    this.router.navigate([`${this.$auth.getModuleName()}/preview-voucher`], {
      queryParams: {
        id: this.claimId,
        ...(this.movement.subFormId ? { subFormId: this.movement.subFormId } : {}),
      },
    });
  }

  openClaimForm(preferValidationRoute = false): void {
    const route = this.resolveClaimFormRoute(preferValidationRoute);
    if (!route) {
      this.$common.showMessage('Claim form route is not available.', 'danger');
      return;
    }

    this.router.navigate([`${this.$auth.getModuleName()}/${route}`], {
      queryParams: {
        id: this.claimId,
        subFormId: this.movement.subFormId,
      },
    });
  }

  getUnitLabel(unit: any): string {
    return unit?.descr || unit?.unitName || unit?.unit || '-';
  }

  private resetScreen(): void {
    this.movement = this.createEmptyMovement();
    this.tempGxDetails = this.createEmptyGxDetail();
    this.voucherList = [];
    this.validationResult = null;
    this.gxTypes = [];
    this.selectedGxIndex = null;
    this.saveButtonLabel = 'Save';
    this.claimSubmitted = false;
    this.claimSettled = false;
  }

  private buildSavePayload(): any {
    const codeUnit = this.movement?.codeUnitDTO?.unit || this.userIdDetails?.unit || this.userIdDetails?.unitId || '';
    const settlementUnit = this.movement.unitId || null;
    const drawnFrom =
      this.movement.drawnFrom === 'Others'
        ? this.movement.drawnFromOther || this.movement.drawnFrom
        : this.movement.drawnFrom;

    const manualRows = this.hasManualSettlementDetails()
      ? [
          {
            creditDebitMemoNo: this.movement.creditDebitNo || null,
            isClaimSetteled: this.movement.isClaimSettle || null,
            claimAmt: this.toNumberOrNull(this.movement.claimAmt),
            unitName: settlementUnit,
            unitId: settlementUnit,
            claimPassAmt: this.toNumberOrNull(this.movement.claimPassAmt),
            letterNo: this.movement.letterNo || null,
            letterNoDated: this.toApiDate(this.movement.letterNoDated),
          },
        ]
      : [];

    return {
      ...this.movement,
      claimId: this.movement.claimId || this.claimId || null,
      claimMode: this.movement.claimMode || null,
      advanceMode: this.movement.claimMode || null,
      subFormId: this.movement.subFormId || null,
      purpose: this.movement.subFormId || null,
      voucherDate: this.toApiDate(this.movement.voucherDate),
      voucherAmt: this.toNumberOrNull(this.movement.voucherAmt),
      drawnFrom: drawnFrom || null,
      drawnFromOther: this.movement.drawnFrom === 'Others' ? this.movement.drawnFromOther || null : null,
      claimPassAmt: this.toNumberOrNull(this.movement.claimPassAmt),
      claimRecAmt: this.toNumberOrNull(this.movement.claimPassAmt),
      claimAmt: this.toNumberOrNull(this.movement.claimAmt),
      aclUserDTO: {
        ...(this.movement.aclUserDTO || {}),
        userId: this.userIdDetails?.userId || '',
      },
      codeUnitDTO: {
        ...(this.movement.codeUnitDTO || {}),
        unit: codeUnit,
      },
      codeSubFormDTO: {
        subFormId: this.movement.subFormId || null,
      },
      yatClaimManualDTOs: manualRows,
      yatClaimGxDetailsDTOs: this.movement.yatTempDutyClaimGxDTOs.map((row) => ({
        ...row,
        gxDate: this.toApiDate(row.gxDate),
        dateOfTravel: this.toApiDate(row.dateOfTravel),
      })),
    };
  }

  private hasManualSettlementDetails(): boolean {
    return !!(
      this.movement.creditDebitNo ||
      this.movement.claimPassAmt ||
      this.movement.claimAmt ||
      this.movement.unitId ||
      this.movement.letterNo ||
      this.movement.letterNoDated ||
      this.movement.isClaimSettle
    );
  }

  private validateManualSettlement(): boolean {
    if (this.movement.isClaimAlreadySubmitted !== '1') {
      return true;
    }

    if (!this.movement.unitId) {
      this.$common.showMessage('Please fill Submitted to (Unit).', 'danger');
      return false;
    }

    if (this.toNumberOrNull(this.movement.claimAmt) == null) {
      this.$common.showMessage('Please fill Total Claimed Amount.', 'danger');
      return false;
    }

    if (this.movement.isClaimSettle !== '0' && this.movement.isClaimSettle !== '1') {
      this.$common.showMessage('Please select whether the claim is settled.', 'danger');
      return false;
    }

    if (this.movement.isClaimSettle !== '1') {
      return true;
    }

    if (!this.movement.creditDebitNo) {
      this.$common.showMessage('Please fill Credit/Debit No.', 'danger');
      return false;
    }

    if (this.toNumberOrNull(this.movement.claimPassAmt) == null) {
      this.$common.showMessage('Please fill Total Amount Passed.', 'danger');
      return false;
    }

    if (!this.movement.letterNo) {
      this.$common.showMessage('Please fill Letter No.', 'danger');
      return false;
    }

    if (!this.movement.letterNoDated) {
      this.$common.showMessage('Please fill Letter Date.', 'danger');
      return false;
    }

    return true;
  }

  private validateVoucherInputs(claimStateId: string): boolean {
    if (claimStateId !== 'INIT' || this.movement.claimMode !== this.yatTravelMode.manual) {
      return true;
    }
    if (this.isNilOrSupplementary) {
      return true;
    }

    if (!this.movement.voucherNo) {
      this.$common.showMessage('Please enter Voucher Number.', 'danger');
      return false;
    }
    if (!this.movement.voucherDate) {
      this.$common.showMessage('Please enter Voucher Date.', 'danger');
      return false;
    }
    if (this.toNumberOrNull(this.movement.voucherAmt) == null) {
      this.$common.showMessage('Please enter Amount.', 'danger');
      return false;
    }
    if (!this.movement.drawnFrom) {
      this.$common.showMessage('Please enter Drawn from.', 'danger');
      return false;
    }
    if (this.movement.drawnFrom === 'Others' && !this.movement.drawnFromOther) {
      this.$common.showMessage('Please enter Other Drawn from.', 'danger');
      return false;
    }
    return true;
  }

  private syncManualSettlementFlags(): void {
    this.claimSubmitted = this.movement.isClaimAlreadySubmitted === '1';
    this.claimSettled = this.movement.isClaimSettle === '1';
  }

  private resolveClaimFormRoute(preferValidationRoute = false): string | null {
    if (preferValidationRoute) {
      const validatedRoute = this.getClaimFormRouteFromValidation(this.validationResult);
      if (validatedRoute) {
        return validatedRoute;
      }
    }
    return this.getClaimFormRoute(this.movement.subFormId || '');
  }

  private getClaimFormRouteFromValidation(validationResult: any): string | null {
    const formUrl = String(validationResult?.formUrl || validationResult?.url || '').toLowerCase();
    if (!formUrl) {
      return null;
    }
    if (formUrl.includes('form-pmt-duty-claim')) return 'form-pmt-duty-claim';
    if (formUrl.includes('form-ty-duty-claim')) return 'form-ty-duty-claim';
    if (formUrl.includes('form-fte-claim')) return 'form-fte-claim';
    if (formUrl.includes('form-ltc-claim')) return 'form-ltc-claim';
    if (formUrl.includes('form-resettlement-claim')) return 'form-resettlement-claim';
    if (formUrl.includes('form-pmt-duty')) return 'form-pmt-duty-claim';
    if (formUrl.includes('form-ty-duty')) return 'form-ty-duty-claim';
    if (formUrl.includes('form-fte-advance')) return 'form-fte-claim';
    if (formUrl.includes('form-ltc-advance')) return 'form-ltc-claim';
    if (formUrl.includes('resettlement')) return 'form-resettlement-claim';
    return null;
  }

  private getClaimFormRoute(subFormId: string): string | null {
    const id = String(subFormId || '').toUpperCase();
    if (id === this.codeClaim.pmtAdv || id === 'PMT' || id === 'PMTA') return 'form-pmt-duty-claim';
    if (id === this.codeClaim.tyAdv || id === 'TY' || id === 'TYA' || id === 'TYD') return 'form-ty-duty-claim';
    if (id === this.codeClaim.fteAdv || id === 'FTE' || id === 'FTEA') return 'form-fte-claim';
    if (id === this.codeClaim.ltcAdv || id === 'LTC' || id === 'LTCA') return 'form-ltc-claim';
    if (id === this.codeClaim.resettleClm || id === 'RES' || id === 'RESCLM' || id === 'R') return 'form-resettlement-claim';
    return null;
  }

  private normalizeSubFormId(subFormId: string): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'R' || id === 'RES' || id === 'RESCLM') return this.codeClaim.resettleClm;
    return id;
  }

  private createEmptyMovement(): MovementModel {
    return {
      claimId: this.claimId || null,
      claimMode: null,
      advanceMode: null,
      subFormId: null,
      purpose: null,
      voucherNo: null,
      voucherDate: null,
      voucherAmt: null,
      drawnFrom: null,
      drawnFromOther: null,
      creditDebitNo: null,
      claimPassAmt: null,
      claimAmt: null,
      unitId: null,
      letterNo: null,
      letterNoDated: null,
      isClaimAlreadySubmitted: null,
      isClaimSettle: null,
      yatTempDutyClaimGxDTOs: [],
    };
  }

  private createEmptyGxDetail(): MovementGxDetail {
    return {
      gxType: null,
      unit: null,
      gxDate: null,
      gxNo: null,
      dateOfTravel: null,
    };
  }

  private normalizeGxDetails(list: any): MovementGxDetail[] {
    return Array.isArray(list) ? list.map((row) => this.normalizeSingleGxDetail(row)) : [];
  }

  private normalizeSingleGxDetail(row: any): MovementGxDetail {
    return {
      gxType: row?.gxType || null,
      unit: row?.unit || null,
      gxDate: this.toInputDate(row?.gxDate),
      gxNo: row?.gxNo || null,
      dateOfTravel: this.toInputDate(row?.dateOfTravel),
    };
  }

  private toInputDate(value: any): string | null {
    if (!value && value !== 0) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      const text = String(value);
      return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
    }
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  private toApiDate(value: any): string | null {
    if (!value) {
      return null;
    }
    const text = String(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? text
      : this.datePipe.transform(new Date(value), 'yyyy-MM-dd');
  }

  private toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
}


