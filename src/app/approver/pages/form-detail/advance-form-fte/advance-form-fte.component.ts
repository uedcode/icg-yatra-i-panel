import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';
declare var $: any;

type ReviewSection = {
  key: string;
  label: string;
  checked: boolean;
};

type LtcBucketGroup = {
  key: string;
  label: string;
  rows: any[];
};

@Component({
  selector: 'app-approver-advance-form-fte',
  templateUrl: './advance-form-fte.component.html',
  styleUrls: ['./advance-form-fte.component.scss'],
  standalone: false,
})
export class AdvanceFormFteComponent implements OnInit {
  readonly codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
    inkSignAlt: 'INK_SIGN',
    eSignAlt: 'E_SIGN',
  } as const;
  readonly advanceCeilingOptions = Array.from({ length: 61 }, (_, index) => 30 + index);
  claimId: string | null = null;
  formId: string | null = null;
  subFormId = '';
  statusId = '';
  actionable = false;
  previewMode = false;
  formObj: any = null;
  availedHistoryObj: any = null;
  availedHistoryRows: any[] = [];
  documentDtos: any[] = [];
  stateHistory: any[] = [];
  claimRemarkSummary: any = null;
  remark = '';
  redPercentage: number | null = null;
  redAmount: string = '';
  redRemarks = '';
  maxRedAmt: number | null = null;
  actionLoading = false;
  reviewSections: ReviewSection[] = [];
  activeReviewSectionKey = '';
  eSignTempFormObj: any = null;
  userIdDetails: any;
  codeStatus: any;
  codeRoleType: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.codeRoleType = this.$auth.codeRoleType();
    this.previewMode = this.isPreviewRoute();
    this.handleEsignFeedback();

    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('claimId') || params.get('id') || null;
      this.formId = params.get('id') || this.claimId;
      this.subFormId = this.normalizeSubFormId(
        params.get('subFormId'),
        this.route.snapshot.routeConfig?.path || ''
      );
      this.statusId = params.get('statusId') || '';
      this.actionable = params.get('actionable') === '1' && !this.previewMode;
      this.reviewSections = [];
      this.documentDtos = [];
      this.stateHistory = [];
      this.claimRemarkSummary = null;
      this.resetAdvanceCeiling();

      if (!this.claimId) {
        return;
      }

      if (this.isLtcHistory()) {
        this.loadLtcAvailedHistory();
      } else {
        this.loadAdvanceClaim();
      }
      this.loadStateHistory();
      this.loadClaimRemarkSummary();
    });
  }

  get pageTitle(): string {
    const titles: Record<string, string> = {
      P: 'PMT Advance Review',
      T: 'TY Duty Advance Review',
      F: 'FTE Advance Review',
      L: 'LTC Advance Review',
      M: 'Manual Advance Review',
      H: 'LTC Availed History Review',
    };
    return titles[this.subFormId] || 'Advance Review';
  }

  get primaryActionLabel(): string {
    return this.isApprovingRole() ? 'Approve' : 'Verify';
  }

  get canReject(): boolean {
    return this.isApprovingRole();
  }

  get uploadedDocuments(): any[] {
    return this.documentDtos.filter((doc) => !!(doc?.url || doc?.fileUrl || doc?.docUrl));
  }

  get allUploadedDocumentsVerified(): boolean {
    return this.uploadedDocuments.every((doc) => !!doc?.checkedIndicator);
  }

  get pendingUploadedDocumentCount(): number {
    return this.uploadedDocuments.filter((doc) => !doc?.checkedIndicator).length;
  }

  get requiresESignForForward(): boolean {
    const signWith = String(this.formObj?.signWith || '').toUpperCase();
    const isESign =
      signWith === this.codeSignType.eSign ||
      signWith === this.codeSignType.eSignAlt;
    return isESign && this.isApprovingRole();
  }

  get allSectionsReviewed(): boolean {
    return this.reviewSections.every((section) => section.checked);
  }

  get showAdvanceCeilingControls(): boolean {
    return ['P', 'T', 'F', 'L'].includes(this.subFormId) && this.canTakeAction();
  }

  get hasFamilyDetails(): boolean {
    return Array.isArray(this.formObj?.yatFamilyDetailDTOs) && this.formObj.yatFamilyDetailDTOs.length > 0;
  }

  get advanceCeilingRemarksMaxLength(): number {
    return this.subFormId === 'T' ? 500 : 1000;
  }

  get displayedAdvanceAmount(): string {
    if (this.redPercentage !== null && this.redAmount) {
      return this.redAmount;
    }
    return this.display(this.primaryAdvanceDetails?.advAmt);
  }

  get displayedTotalBudgetedAmount(): string {
    if (this.redPercentage !== null && this.redAmount) {
      const adjusted = this.calculateAdjustedTotalBudgeted(this.redAmount);
      return adjusted !== null ? String(adjusted) : this.display(this.primaryAdvanceDetails?.totalBudgetedAmt);
    }
    return this.display(this.primaryAdvanceDetails?.totalBudgetedAmt);
  }

  get manualAdvanceDetails(): any {
    return this.subFormId === 'M' ? this.primaryAdvanceDetails : null;
  }

  get currentReviewSection(): ReviewSection | null {
    return this.reviewSections.find((section) => section.key === this.activeReviewSectionKey) || null;
  }

  get canGoToPreviousSection(): boolean {
    return this.getActiveReviewSectionIndex() > 0;
  }

  get canGoToNextSection(): boolean {
    const index = this.getActiveReviewSectionIndex();
    return index > -1 && index < this.reviewSections.length - 1;
  }

  get ltcBucketGroups(): LtcBucketGroup[] {
    if (!this.availedHistoryRows?.length) {
      return [];
    }

    const order = [
      'hometownSelfLTCList',
      'hometownSingleLTCList',
      'hometownPartialLTCList',
      'allindiaSelfLTCList',
      'allindiaSingleLTCList',
      'allindiaPartialLTCList',
      'specialplaceSelfLTCList',
      'specialplaceSingleLTCList',
      'specialplacePartialLTCList',
      'afspltclist',
      'espltclist',
      'additionalLTC',
    ];

    return order
      .map((key) => ({
        key,
        label: this.getLtcBucketLabel(key),
        rows: this.availedHistoryRows.filter((row) => row?._bucket === key),
      }))
      .filter((group) => group.rows.length);
  }

  private isApprovingRole(): boolean {
    return (
      this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier2 ||
      this.userIdDetails?.roleTypeId === this.codeRoleType?.approver
    );
  }

  private isPreviewRoute(): boolean {
    const path = this.route.snapshot.routeConfig?.path || '';
    return path.startsWith('preview-');
  }

  private normalizeSubFormId(subFormId: string | null, routePath: string): string {
    const explicitId = String(subFormId || '').toUpperCase();
    if (explicitId === 'PMTA' || explicitId === 'PMT' || explicitId === 'P') return 'P';
    if (explicitId === 'TYA' || explicitId === 'TY' || explicitId === 'T') return 'T';
    if (explicitId === 'FTEA' || explicitId === 'FTE' || explicitId === 'F') return 'F';
    if (explicitId === 'LTCA' || explicitId === 'LTC' || explicitId === 'L') return 'L';
    if (explicitId === 'MANUALADV' || explicitId === 'M') return 'M';
    if (explicitId === 'LTCHISTORY' || explicitId === 'LH' || explicitId === 'H') return 'H';

    const routeMap: Record<string, string> = {
      'form-pmt-duty': 'P',
      'preview-pmt-duty': 'P',
      'form-ty-duty': 'T',
      'preview-ty-duty': 'T',
      'form-fte-advance': 'F',
      'preview-fte-advance': 'F',
      'form-ltc-advance': 'L',
      'preview-ltc-advance': 'L',
      'form-manual-adv': 'M',
      'preview-manual-adv': 'M',
      'form-ltc-availed-history': 'H',
      'preview-ltc-availed-history': 'H',
    };

    return routeMap[routePath] || explicitId || '';
  }

  isLtcHistory(): boolean {
    return this.subFormId === 'H';
  }

  private loadAdvanceClaim(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.subFormId,
        isPreview: 'true',
      },
    };

    this.$common.showLoader();
    this.$claim.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(
            response?.message || 'Unable to load advance review details.',
            'danger'
          );
          return;
        }

        const obj = Array.isArray(response?.object)
          ? response.object[0]
          : response?.object;
        this.formObj = obj || {};
        this.documentDtos = Array.isArray(this.formObj?.yatDocsDTOs)
          ? this.formObj.yatDocsDTOs
          : [];
        this.reviewSections = this.buildReviewSections();
        this.initializeActiveReviewSection();
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to load advance review details.', 'danger');
      },
    });
  }

  private loadLtcAvailedHistory(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        isFetch: '1',
      },
    };

    this.$common.showLoader();
    this.$claim.getLtcAvailedHistory(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true || !Array.isArray(response?.object) || !response.object.length) {
          this.$common.showMessage(
            response?.message || 'Unable to load LTC availed history review.',
            'danger'
          );
          return;
        }

        this.availedHistoryObj = response.object[0];
        this.availedHistoryRows = this.flattenLtcAvailedRows(this.availedHistoryObj);
        this.reviewSections = this.buildReviewSections();
        this.initializeActiveReviewSection();
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to load LTC availed history review.', 'danger');
      },
    });
  }

  private flattenLtcAvailedRows(source: any): any[] {
    const rows: any[] = [];
    const keys = [
      'hometownSelfLTCList',
      'hometownSingleLTCList',
      'hometownPartialLTCList',
      'allindiaSelfLTCList',
      'allindiaSingleLTCList',
      'allindiaPartialLTCList',
      'specialplaceSelfLTCList',
      'specialplaceSingleLTCList',
      'specialplacePartialLTCList',
      'additionalLTC',
      'afspltclist',
      'espltclist',
    ];

    keys.forEach((bucket) => {
      (source?.[bucket] || []).forEach((row: any) => {
        rows.push({
          ...row,
          _bucket: bucket,
          _bucketLabel: this.getLtcBucketLabel(bucket),
          _familyCount: Array.isArray(row?.yatLTCHistoryFamilyDetailDTOs)
            ? row.yatLTCHistoryFamilyDetailDTOs.filter((item: any) => item?.availed).length
            : 0,
          _selectedFamilyMembers: this.getSelectedFamilyMembers(row?.yatLTCHistoryFamilyDetailDTOs),
        });
      });
    });

    return rows;
  }

  private loadStateHistory(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
      },
    };

    this.$claim.getClaimStates(config).subscribe({
      next: (response: any) => {
        this.stateHistory = Array.isArray(response?.object) ? response.object : [];
      },
      error: () => {
        this.stateHistory = [];
      },
    });
  }

  private loadClaimRemarkSummary(): void {
    const config = {
      headers: {
        claimId: this.claimId,
      },
    };

    this.$claim.getClaimRemarkSummary(config).subscribe({
      next: (response: any) => {
        const remarks = Array.isArray(response?.object) ? response.object : [];
        this.claimRemarkSummary = remarks[0] || null;
      },
      error: () => {
        this.claimRemarkSummary = null;
      },
    });
  }

  private buildReviewSections(): ReviewSection[] {
    if (this.isLtcHistory()) {
      return [
        'Home Town',
        'All India',
        'Special Place',
        'AFSP',
        'EPC',
        'Additional',
      ].map((label, index) => ({
        key: `ltc-${index + 1}`,
        label,
        checked: false,
      }));
    }

    if (this.subFormId === 'M') {
      return ['Personal Details', 'Bank Details'].map((label, index) => ({
        key: `manual-${index + 1}`,
        label,
        checked: false,
      }));
    }

    const labels = ['Personal Details', 'Travel Details', 'Financial Terms', 'Bank Details'];
    if (this.formObj?.internalRemarks) {
      labels.push('Remarks');
    }

    return labels.map((label, index) => ({
      key: `advance-${index + 1}`,
      label,
      checked: false,
    }));
  }

  private initializeActiveReviewSection(): void {
    this.activeReviewSectionKey = this.reviewSections[0]?.key || '';
  }

  private getActiveReviewSectionIndex(): number {
    return this.reviewSections.findIndex((section) => section.key === this.activeReviewSectionKey);
  }

  selectReviewSection(sectionKey: string): void {
    if (!sectionKey) return;
    this.activeReviewSectionKey = sectionKey;
  }

  goToNextSection(): void {
    const index = this.getActiveReviewSectionIndex();
    if (index > -1 && index < this.reviewSections.length - 1) {
      this.activeReviewSectionKey = this.reviewSections[index + 1].key;
    }
  }

  goToPreviousSection(): void {
    const index = this.getActiveReviewSectionIndex();
    if (index > 0) {
      this.activeReviewSectionKey = this.reviewSections[index - 1].key;
    }
  }

  isActiveSection(sectionKey: string): boolean {
    return this.activeReviewSectionKey === sectionKey;
  }

  showPersonalSection(): boolean {
    return this.subFormId === 'M'
      ? this.isActiveSection('manual-1')
      : this.isActiveSection('advance-1');
  }

  showTravelSection(): boolean {
    return this.subFormId === 'M'
      ? this.isActiveSection('manual-1')
      : this.isActiveSection('advance-2');
  }

  showFinancialSection(): boolean {
    return this.subFormId !== 'M' && !this.isLtcHistory() && this.isActiveSection('advance-3');
  }

  showBankSection(): boolean {
    return this.subFormId === 'M'
      ? this.isActiveSection('manual-2')
      : this.isActiveSection('advance-4');
  }

  showRemarksSection(): boolean {
    return this.isActiveSection('advance-5');
  }

  hasDedicatedRemarksReviewSection(): boolean {
    return this.reviewSections.some((section) => section.key === 'advance-5');
  }

  shouldShowRemarksCard(): boolean {
    const hasRemarks = !!(this.formObj?.internalRemarks || this.claimRemarkSummary);
    if (!hasRemarks) {
      return false;
    }
    return this.hasDedicatedRemarksReviewSection()
      ? this.showRemarksSection()
      : true;
  }

  get visibleLtcBucketGroups(): LtcBucketGroup[] {
    const sectionMap: Record<string, string[]> = {
      'ltc-1': [
        'hometownSelfLTCList',
        'hometownSingleLTCList',
        'hometownPartialLTCList',
      ],
      'ltc-2': [
        'allindiaSelfLTCList',
        'allindiaSingleLTCList',
        'allindiaPartialLTCList',
      ],
      'ltc-3': [
        'specialplaceSelfLTCList',
        'specialplaceSingleLTCList',
        'specialplacePartialLTCList',
      ],
      'ltc-4': ['afspltclist'],
      'ltc-5': ['espltclist'],
      'ltc-6': ['additionalLTC'],
    };

    const allowedKeys = sectionMap[this.activeReviewSectionKey] || [];
    return this.ltcBucketGroups.filter((group) => allowedKeys.includes(group.key));
  }

  canTakeAction(): boolean {
    if (!this.actionable || this.previewMode) return false;
    const closedStates = [
      this.codeStatus?.approved,
      this.codeStatus?.notApproved,
      this.codeStatus?.rejected,
      this.codeStatus?.returned,
      this.codeStatus?.passed,
      this.codeStatus?.notPassed,
    ].filter(Boolean);
    return !closedStates.includes(this.statusId);
  }

  private resetAdvanceCeiling(): void {
    this.redPercentage = null;
    this.redAmount = '';
    this.redRemarks = '';
    this.maxRedAmt = null;
  }

  clearAdvanceCeiling(): void {
    this.resetAdvanceCeiling();
  }

  setRecommendAmount(input: any): void {
    if (input === null || input === undefined || input === '') {
      this.resetAdvanceCeiling();
      return;
    }

    const baseAdvanceAmount = this.toNumber(this.primaryAdvanceDetails?.advAmt);
    const percentage = this.toNumber(input);
    if (!baseAdvanceAmount || !percentage) {
      this.redPercentage = percentage;
      this.redAmount = '';
      this.maxRedAmt = null;
      return;
    }

    this.redPercentage = percentage;
    const calculatedAmount = Math.round(this.roundToPreviousHundred((percentage / 100) * baseAdvanceAmount));
    this.maxRedAmt = calculatedAmount;
    this.updateAdmissibleAmt(calculatedAmount);
  }

  updateAdmissibleAmt(input: any): void {
    if (input === null || input === undefined || input === '') {
      this.redAmount = '';
      return;
    }

    let amount = Math.trunc(this.toNumber(input));
    if (this.maxRedAmt !== null && amount > this.maxRedAmt) {
      amount = this.maxRedAmt;
    }
    if (amount < 0) {
      amount = 0;
    }

    this.redAmount = amount ? String(amount) : '0';
  }

  private roundToPreviousHundred(value: number): number {
    if (!value) return 0;
    return Math.floor(value / 100) * 100;
  }

  private calculateAdjustedTotalBudgeted(advanceAmount: any): number | null {
    const amount = this.toNumber(advanceAmount);
    if (!amount) {
      return null;
    }

    const dtsAmount = this.toNumber(this.primaryAdvanceDetails?.dtsAmount);
    return dtsAmount ? amount + dtsAmount : amount;
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private isAdvanceCeilingValid(): boolean {
    if (this.redPercentage === null) {
      return true;
    }

    if (!this.redAmount || this.redAmount.trim() === '') {
      this.$common.showMessage('Please Enter Advance Ceiling Amount', 'danger');
      return false;
    }

    if (this.toNumber(this.redAmount) < 1) {
      this.$common.showMessage('Advance Ceiling Amount can not be zero', 'danger');
      return false;
    }

    if (this.maxRedAmt !== null && this.toNumber(this.redAmount) > this.maxRedAmt) {
      this.$common.showMessage(
        `Advance Ceiling Amount can not exceed ${this.maxRedAmt}.`,
        'danger'
      );
      return false;
    }

    return true;
  }

  private isAllowedTargetStatus(status: string): boolean {
    const allowed = [this.codeStatus?.outbox, this.codeStatus?.returned];
    if (this.canReject) {
      allowed.push(this.codeStatus?.notApproved);
    }
    return allowed.includes(status);
  }

  private validateActionTransition(status: string): Promise<boolean> {
    if (!this.claimId) {
      return Promise.resolve(false);
    }

    if (!this.canTakeAction() || !this.isAllowedTargetStatus(status)) {
      this.$common.showMessage(
        'This form is not in a valid state for the requested action.',
        'danger'
      );
      return Promise.resolve(false);
    }

    if (!this.allSectionsReviewed) {
      this.$common.showMessage('Please complete the review checklist first.', 'danger');
      return Promise.resolve(false);
    }

    const config = {
      headers: {
        claimId: this.claimId,
        userId: this.userIdDetails?.userId ?? '',
        roleTypeId: this.userIdDetails?.roleTypeId ?? '',
        statusId: status,
        subFormId: this.subFormId ?? '',
      },
    };

    return new Promise((resolve) => {
      this.$claim.validateClaimState(config).subscribe({
        next: (response: any) => {
          if (response?.status === false) {
            this.$common.showMessage(
              response?.message || 'Advance transition validation failed.',
              'danger'
            );
            resolve(false);
            return;
          }
          resolve(true);
        },
        error: () => {
          resolve(true);
        },
      });
    });
  }

  async submitAction(status: string): Promise<void> {
    if (!this.claimId) return;
    if (!this.isAdvanceCeilingValid()) {
      return;
    }

    const allowed = await this.validateActionTransition(status);
    if (!allowed) {
      return;
    }

    if (status === this.codeStatus?.outbox && !this.allUploadedDocumentsVerified) {
      this.selectReviewSection(this.subFormId === 'M' ? 'manual-1' : 'advance-2');
      this.$common.showMessage('Please verify all the documents before forwarding.', 'danger');
      return;
    }

    const remark = this.getRemarkForStatus(status);
    if (!remark) {
      this.$common.showMessage('Remark is required.', 'danger');
      return;
    }

    if (status === this.codeStatus?.outbox && this.requiresESignForForward) {
      this.startESignFlow(remark);
      return;
    }

    const payload = {
      claimId: this.claimId,
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status,
      remark,
      redPercent: this.redPercentage ?? undefined,
      redAmount: this.redPercentage !== null ? this.redAmount || undefined : undefined,
      redRemarks: this.redPercentage !== null ? (this.redRemarks || undefined) : undefined,
    };

    this.actionLoading = true;
    this.$common.showLoader();
    this.$claim.changeClaimStatusById(payload).subscribe({
      next: (response: any) => {
        this.actionLoading = false;
        this.$common.hideLoader();
        if (response?.status === true) {
          this.$common.showMessage(
            response?.message || 'Advance status updated successfully.',
            'success'
          );
          this.router.navigateByUrl(this.$auth.getModuleName() + '/inbox');
          return;
        }
        this.$common.showMessage(
          response?.message || 'Unable to update advance status.',
          'danger'
        );
      },
      error: () => {
        this.actionLoading = false;
        this.$common.hideLoader();
        this.$common.showMessage('Unable to update advance status.', 'danger');
      },
    });
  }

  getActionPreviewRemark(status: string): string {
    return this.getRemarkForStatus(status, false);
  }

  openPreview(): void {
    const previewRoute = this.getPreviewRoute();
    if (!previewRoute || !this.claimId) {
      this.$common.showMessage('Preview route is not available.', 'danger');
      return;
    }

    const url =
      `${this.$auth.getModuleName()}/${previewRoute}` +
      `?claimId=${encodeURIComponent(this.claimId)}` +
      `&id=${encodeURIComponent(this.formId || this.claimId)}` +
      `&subFormId=${encodeURIComponent(this.subFormId)}`;
    window.open(url, '_blank');
  }

  private getPreviewRoute(): string {
    const previewRoutes: Record<string, string> = {
      P: 'preview-pmt-duty',
      T: 'preview-ty-duty',
      F: 'preview-fte-advance',
      L: 'preview-ltc-advance',
      M: 'preview-manual-adv',
      H: 'preview-ltc-availed-history',
    };
    return previewRoutes[this.subFormId] || '';
  }

  goBack(): void {
    this.location.back();
  }

  display(value: any): string {
    if (value === null || value === undefined) return '-';
    const str = String(value).trim();
    return str ? str : '-';
  }

  private handleEsignFeedback(): void {
    this.route.queryParamMap.subscribe((params) => {
      const status = params.get('esignStatus');
      const txnId = params.get('txnId');
      if (!status) {
        return;
      }

      if (status === 'SC') {
        this.$common.showMessage(
          txnId
            ? `eSign completed successfully. Transaction ID: ${txnId}`
            : 'eSign completed successfully.',
          'success'
        );
      } else if (status === 'US' || status === 'ER') {
        this.$common.showMessage(
          txnId
            ? `eSign could not be completed. Transaction ID: ${txnId}`
            : 'eSign could not be completed.',
          'danger'
        );
      } else {
        this.$common.showMessage(
          txnId
            ? `eSign status is being processed. Transaction ID: ${txnId}`
            : 'eSign status is being processed.',
          'info'
        );
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { esignStatus: null, txnId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  yesNo(value: any): string {
    if (value === 1 || value === '1' || value === true) return 'Yes';
    if (value === 0 || value === '0' || value === false) return 'No';
    return '-';
  }

  asDate(value: any): string {
    if (!value) return '-';
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return this.datePipe.transform(value, 'dd-MMM-yyyy') || '-';
    }
    return this.datePipe.transform(new Date(parsed), 'dd-MMM-yyyy') || '-';
  }

  viewDocument(url: any): void {
    this.$auth.viewFile(url);
  }

  viewSupportingDocument(doc: any): void {
    const url = doc?.url || doc?.fileUrl || doc?.docUrl;
    if (!url) {
      this.$common.showMessage('Document file is not available.', 'danger');
      return;
    }
    doc.checkedIndicator = true;
    this.$auth.viewFile(url);
  }

  viewManualSignedForm(): void {
    const url = this.manualAdvanceDetails?.manualFormUrl;
    if (!url) {
      this.$common.showMessage('Manual signed form is not available.', 'danger');
      return;
    }
    this.$auth.viewFile(url);
  }

  getLtcBucketLabel(bucket: string): string {
    const labels: Record<string, string> = {
      hometownSelfLTCList: 'Home Town - Self',
      hometownSingleLTCList: 'Home Town - Single Party',
      hometownPartialLTCList: 'Home Town - Partial Party',
      allindiaSelfLTCList: 'All India - Self',
      allindiaSingleLTCList: 'All India - Single Party',
      allindiaPartialLTCList: 'All India - Partial Party',
      specialplaceSelfLTCList: 'Special Place - Self',
      specialplaceSingleLTCList: 'Special Place - Single Party',
      specialplacePartialLTCList: 'Special Place - Partial Party',
      afspltclist: 'AFSP',
      espltclist: 'EPC',
      additionalLTC: 'Additional LTC',
    };
    return labels[bucket] || bucket;
  }

  private getSelectedFamilyMembers(familyRows: any[] | undefined): any[] {
    if (!Array.isArray(familyRows)) {
      return [];
    }
    return familyRows.filter((item: any) => item?.availed === 1 || item?.availed === true);
  }

  get primaryAdvanceDetails(): any {
    if (!this.formObj) return null;
    if (this.subFormId === 'P') return this.formObj?.yatPermDutyAdvDTOs?.[0] || null;
    if (this.subFormId === 'T') return this.formObj?.yatTempDutyAdvDTOs?.[0] || null;
    if (this.subFormId === 'F') return this.formObj?.yatForeignDutyAdvDTOs?.[0] || null;
    if (this.subFormId === 'L') return this.formObj?.yatLtcAdvDTOs?.[0] || null;
    if (this.subFormId === 'M') return this.formObj?.yatManualAdvDTOs?.[0] || null;
    return null;
  }

  private getRemarkForStatus(status: string, mutateField = true): string {
    const typedRemark = (this.remark || '').trim();
    if (typedRemark) {
      return typedRemark;
    }

    let fallbackRemark = '';
    if (status === this.codeStatus?.outbox) {
      fallbackRemark = this.isApprovingRole() ? 'Approved' : 'Verified';
    } else if (status === this.codeStatus?.returned) {
      fallbackRemark = 'Returned';
    } else if (
      status === this.codeStatus?.notApproved ||
      status === this.codeStatus?.rejected
    ) {
      fallbackRemark = 'Rejected';
    }

    if (mutateField && fallbackRemark) {
      this.remark = fallbackRemark;
    }
    return fallbackRemark;
  }

  private startESignFlow(remark: string): void {
    this.eSignTempFormObj = {
      id: this.claimId,
      formRemarks: remark,
      recommendedAmount: this.redPercentage !== null
        ? this.redAmount || this.primaryAdvanceDetails?.advAmt
        : this.primaryAdvanceDetails?.advAmt,
      allotedBudget: this.formObj?.allotedBudget,
      balanceAmount: this.formObj?.balanceAmount,
      progressiveExpenditureAmt: this.formObj?.progressiveExpenditureAmt,
      balance: this.formObj?.balance,
    };
    $('#esign_modal').modal('show');
  }
}


