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

@Component({
  selector: 'app-approver-claim-preview-ltc',
  templateUrl: './claim-preview-ltc.component.html',
  styleUrls: ['./claim-preview-ltc.component.scss'],
  standalone: false,
})
export class ClaimPreviewLtcComponent implements OnInit {
  readonly codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
    inkSignAlt: 'INK_SIGN',
    eSignAlt: 'E_SIGN',
  } as const;
  claimId: string | null = null;
  subFormId: string | null = null;
  supplementaryId: string | null = null;
  statusId: string | null = null;
  actionable = false;
  formObj: any = null;
  documentDtos: any[] = [];
  stateHistory: any[] = [];
  claimRemarkSummary: any = null;
  remark = '';
  actionLoading = false;
  isLegacyPreviewContext = false;
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

    this.isLegacyPreviewContext = this.checkLegacyPreviewContext();
    this.handleEsignFeedback();

    this.route.queryParamMap.subscribe((params) => {
      const routeParams = this.route.snapshot.paramMap;
      this.claimId = params.get('claimId') || params.get('id') || routeParams.get('claimId');
      this.supplementaryId = params.get('supId');
      this.subFormId = this.normalizeSubFormId(
        params.get('subFormId') || routeParams.get('subFormId') || this.route.snapshot.data?.['subFormId']
      );
      this.statusId = params.get('statusId') || routeParams.get('statusId');
      this.actionable =
        (params.get('actionable') === '1' || routeParams.get('actionable') === '1') &&
        !this.isLegacyPreviewContext;
      this.reviewSections = [];
      this.activeReviewSectionKey = '';
      if (this.claimId && this.subFormId) {
        this.loadClaim();
        this.loadStateHistory();
        this.loadClaimRemarkSummary();
      }
    });
  }

  loadClaim(): void {
    this.$common.showLoader();
    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.subFormId,
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    };
    if (this.supplementaryId) {
      (config.headers as any).supCLaimId = this.supplementaryId;
    }

    this.$claim.getSingleClaimPreview(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        let obj = response?.object;
        if (Array.isArray(obj)) obj = obj[0] || null;
        this.formObj = obj;
        this.documentDtos = Array.isArray(obj?.yatDocsDTOs) ? obj.yatDocsDTOs : [];
        this.reviewSections = this.buildReviewSections();
        this.activeReviewSectionKey = this.reviewSections[0]?.key || '';
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage(
          'Unable to load claim details.',
          'danger'
        );
      },
    });
  }

  loadStateHistory(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
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

  loadClaimRemarkSummary(): void {
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

  canTakeAction(): boolean {
    if (!this.actionable) return false;
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

  get allSectionsReviewed(): boolean {
    return this.reviewSections.every((section) => section.checked);
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

  getActionLabel(): string {
    if (this.isVerifier1()) {
      return 'Verify & Forward';
    }
    return 'Approve';
  }

  getTertiaryActionStatus(): string {
    return '';
  }

  getTertiaryActionLabel(): string {
    return '';
  }

  private checkLegacyPreviewContext(): boolean {
    const path = this.route.snapshot.routeConfig?.path || '';
    const previewPaths = [
      'preview-voucher',
      'movement-update-claim',
      'preview-pmt-duty-claim',
      'preview-ty-duty-claim',
      'preview-fte-claim',
      'preview-ltc-claim',
      'preview-resettlement-claim',
      'preview-resettlement',
      'preview-pm-resettlementaim',
    ];
    return previewPaths.includes(path);
  }

  isResettlementSubForm(): boolean {
    return this.subForm() === 'RS';
  }

  isVerifierResettlementMode(): boolean {
    return this.isVerifier1() && this.isResettlementSubForm();
  }

  private isLocallyAllowedTargetStatus(status: string): boolean {
    const allowed = [this.codeStatus?.outbox, this.codeStatus?.returned];
    return allowed.includes(status);
  }

  private validateActionTransition(status: string): Promise<boolean> {
    if (!this.claimId) {
      return Promise.resolve(false);
    }

    if (!this.canTakeAction() || !this.isLocallyAllowedTargetStatus(status)) {
      this.$common.showMessage(
        'This claim is not in a valid state for the requested action.',
        'danger'
      );
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
              response?.message || 'Claim transition validation failed.',
              'danger'
            );
            resolve(false);
            return;
          }
          resolve(true);
        },
        error: () => {
          // Keep the workflow usable even if the optional validator endpoint
          // is unavailable; local guards above still protect obvious mistakes.
          resolve(true);
        },
      });
    });
  }

  async submitAction(status: string): Promise<void> {
    if (!this.claimId) return;
    if (!this.allSectionsReviewed) {
      this.$common.showMessage('Please complete the review checklist first.', 'danger');
      return;
    }

    if (status === this.codeStatus?.outbox && !this.allUploadedDocumentsVerified) {
      this.selectReviewSection('documents');
      this.$common.showMessage('Please verify all the documents before forwarding.', 'danger');
      return;
    }

    const remark = this.getRemarkForStatus(status);
    if (!remark) {
      this.$common.showMessage('Remark is required.', 'danger');
      return;
    }

    const okToProceed = await this.validateActionTransition(status);
    if (!okToProceed) {
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
      financialYear: this.userIdDetails?.financialYear,
      moduleId: this.userIdDetails?.moduleId,
      subFormId: this.subFormId,
      status,
      remark,
    };

    this.actionLoading = true;
    this.$common.showLoader();
    this.$claim.changeClaimStatusById(payload).subscribe({
      next: (response: any) => {
        this.actionLoading = false;
        this.$common.hideLoader();
        if (response?.status === true) {
          this.$common.showMessage(
            response?.message || 'Claim status updated successfully.',
            'success'
          );
          this.$claim.notifyStatusCountRefresh();
          this.router.navigateByUrl(this.$auth.getModuleName() + '/inbox-claim');
          return;
        }
        this.$common.showMessage(
          response?.message || 'Unable to update claim status.',
          'danger'
        );
      },
      error: () => {
        this.actionLoading = false;
        this.$common.hideLoader();
        this.$common.showMessage(
          'Unable to update claim status.',
          'danger'
        );
      },
    });
  }

  getActionPreviewRemark(status: string): string {
    return this.getRemarkForStatus(status, false);
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

  goBack(): void {
    this.location.back();
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

  openPreview(): void {
    if (!this.claimId || !this.subFormId) {
      this.$common.showMessage('Preview route is not available.', 'danger');
      return;
    }

    const route = this.getPreviewRoute();
    if (!route) {
      this.$common.showMessage('Preview route is not available.', 'danger');
      return;
    }

    const url =
      `${this.$auth.getModuleName()}/${route}` +
      `?claimId=${encodeURIComponent(this.claimId)}` +
      `&subFormId=${encodeURIComponent(this.subFormId)}`;
    window.open(url, '_blank');
  }

  display(value: any): string {
    if (value === null || value === undefined) return '-';
    const str = String(value).trim();
    return str ? str : '-';
  }

  asDate(value: any): string {
    if (!value) return '-';
    return this.datePipe.transform(value, 'dd-MMM-yyyy') || '-';
  }

  toNumber(value: any): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  subForm(): string {
    return this.canonicalSubFormId(this.subFormId);
  }

  get primaryAdvanceDetails(): any {
    switch (this.subForm()) {
      case 'P':
      case 'RS':
      case 'RES':
      case 'R':
        return this.formObj?.yatPermDutyAdvDTOs?.[0] || null;
      case 'T':
        return this.formObj?.yatTempDutyAdvDTOs?.[0] || null;
      case 'F':
        return this.formObj?.yatForeignDutyAdvDTOs?.[0] || null;
      case 'L':
        return this.formObj?.yatLtcAdvDTOs?.[0] || null;
      default:
        return null;
    }
  }

  get primaryClaimDetails(): any {
    switch (this.subForm()) {
      case 'P':
      case 'RS':
      case 'RES':
      case 'R':
        return this.formObj?.yatPermDutyClaimDTOs?.[0] || null;
      case 'T':
        return this.formObj?.yatTempDutyClaimDTOs?.[0] || null;
      case 'F':
        return this.formObj?.yatForeignDutyClaimDTOs?.[0] || null;
      case 'L':
        return this.formObj?.yatLtcClaimDTOs?.[0] || null;
      default:
        return null;
    }
  }

  get familyDetails(): any[] {
    return Array.isArray(this.formObj?.yatFamilyDetailDTOs) ? this.formObj.yatFamilyDetailDTOs : [];
  }

  get lostDocuments(): any[] {
    return Array.isArray(this.formObj?.lostDocsDTOs) ? this.formObj.lostDocsDTOs : [];
  }

  get tyTravelRows(): any[] {
    return Array.isArray(this.formObj?.yatDtsDetailDTOs) ? this.formObj.yatDtsDetailDTOs : [];
  }

  get tyDtsAmount(): number {
    return this.tyTravelRows
      .filter((row) => row?.isDts !== 'NA' && row?.isDts !== 'No')
      .reduce((sum, row) => sum + this.toNumber(row?.tempAmount ?? row?.amount), 0);
  }

  get tyNonDtsAmount(): number {
    return this.tyTravelRows
      .filter((row) => row?.isDts === 'NA' || row?.isDts === 'No')
      .reduce((sum, row) => sum + this.toNumber(row?.tempAmount ?? row?.amount), 0);
  }

  historyStateLabel(row: any): string {
    return (
      row?.formState ||
      row?.claimState ||
      row?.claimStateId ||
      row?.statusId ||
      '-'
    );
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

  viewSignedDocument(): void {
    const signedUrl = this.formObj?.signedFileUrl;
    if (!signedUrl) {
      this.$common.showMessage('Signed document is not available.', 'danger');
      return;
    }
    this.formObj.signedCheckedIndicator = true;
    this.$auth.viewFile(signedUrl);
  }

  openRelatedPreview(route: string, claimId: any, subFormId?: string): void {
    if (!route || !claimId) {
      this.$common.showMessage('Preview route is not available.', 'danger');
      return;
    }

    const query = [`claimId=${encodeURIComponent(String(claimId))}`];
    const relatedSubFormId = this.relatedPreviewSubFormId(route, subFormId);
    if (relatedSubFormId) {
      query.push(`subFormId=${encodeURIComponent(relatedSubFormId)}`);
    }
    window.open(`${this.$auth.getModuleName()}/${route}?${query.join('&')}`, '_blank');
  }

  private getRemarkForStatus(status: string, mutateField = true): string {
    const typedRemark = (this.remark || '').trim();
    if (typedRemark) {
      return typedRemark;
    }

    let fallbackRemark = '';
    if (status === this.codeStatus?.outbox) {
      if (this.isVerifier1()) {
        fallbackRemark = 'Verified';
      } else if (this.isApprovingRole()) {
        fallbackRemark = 'Approved';
      } else {
        fallbackRemark = 'Verified';
      }
    } else if (status === this.codeStatus?.returned) {
      fallbackRemark = 'Returned';
    } else if (
      status === this.codeStatus?.notApproved ||
      status === this.codeStatus?.rejected ||
      status === this.codeStatus?.notPassed
    ) {
      fallbackRemark = status === this.codeStatus?.notPassed ? 'Not Passed' : 'Rejected';
    }

    if (mutateField && fallbackRemark) {
      this.remark = fallbackRemark;
    }
    return fallbackRemark;
  }

  private isVerifier1(): boolean {
    return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier1;
  }

  private isApprovingRole(): boolean {
    return (
      this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier2 ||
      this.userIdDetails?.roleTypeId === this.codeRoleType?.approver
    );
  }

  private startESignFlow(remark: string): void {
    this.eSignTempFormObj = {
      id: this.claimId,
      formRemarks: remark,
      recommendedAmount:
        this.formObj?.recommendedAmount ??
        this.primaryClaimDetails?.recommendedAmount ??
        this.primaryClaimDetails?.claimAmt ??
        this.formObj?.claimAmt,
      allotedBudget: this.formObj?.allotedBudget,
      balanceAmount: this.formObj?.balanceAmount,
      progressiveExpenditureAmt: this.formObj?.progressiveExpenditureAmt,
      balance: this.formObj?.balance,
    };
    $('#esign_modal').modal('show');
  }

  private buildReviewSections(): ReviewSection[] {
    const sections: ReviewSection[] = [
      { key: 'personal', label: 'Personal Details', checked: false },
      { key: 'travel', label: this.subForm() === 'T' ? 'Travel / Daily Allowance' : 'Travel Details', checked: false },
      { key: 'financial', label: 'Financial Details', checked: false },
      { key: 'documents', label: 'Supporting Documents', checked: false },
    ];

    if (this.formObj?.yatClaimBankDetailDTO) {
      sections.push({ key: 'bank', label: 'Bank Details', checked: false });
    }

    if (this.formObj?.internalRemarks || this.claimRemarkSummary) {
      sections.push({ key: 'remarks', label: 'Remarks', checked: false });
    }

    return sections;
  }

  private getActiveReviewSectionIndex(): number {
    return this.reviewSections.findIndex((section) => section.key === this.activeReviewSectionKey);
  }

  public getPreviewRoute(): string {
    const previewMap: Record<string, string> = {
      P: 'preview-pmt-duty-claim',
      T: 'preview-ty-duty-claim',
      F: 'preview-fte-claim',
      L: 'preview-ltc-claim',
      RS: 'preview-resettlement-claim',
      RES: 'preview-resettlement-claim',
      R: 'preview-resettlement-claim',
    };
    return previewMap[this.subForm()] || '';
  }

  getAdvancePreviewRoute(): string {
    const previewMap: Record<string, string> = {
      P: 'preview-pmt-duty',
      T: 'preview-ty-duty',
      F: 'preview-fte-advance',
      L: 'preview-ltc-advance',
      RS: 'preview-resettlement',
      RES: 'preview-resettlement',
      R: 'preview-resettlement',
    };
    return previewMap[this.subForm()] || '';
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'R' || id === 'RES' || id === 'RESCLM') return 'RS';
    return id;
  }

  private canonicalSubFormId(subFormId: any): string {
    const id = this.normalizeSubFormId(subFormId);
    if (id === 'PMT' || id === 'PMTA' || id === 'PMTCLM') return 'P';
    if (id === 'TYD' || id === 'TYA' || id === 'TY' || id === 'TYCLM') return 'T';
    if (id === 'FTE' || id === 'FTEA' || id === 'FTECLM') return 'F';
    if (id === 'LTC' || id === 'LTCA' || id === 'LTCCLM') return 'L';
    return id;
  }

  private relatedPreviewSubFormId(route: string, subFormId?: string): string {
    const id = this.normalizeSubFormId(subFormId || this.subFormId);
    if (route === 'preview-pmt-duty' || route === 'preview-ty-duty' || route === 'preview-fte-advance' || route === 'preview-ltc-advance') {
      return this.canonicalSubFormId(id);
    }
    return this.legacyClaimSubFormId(id);
  }

  private legacyClaimSubFormId(subFormId: any): string {
    const id = this.canonicalSubFormId(subFormId);
    if (id === 'P') return 'PMT';
    if (id === 'T') return 'TYD';
    if (id === 'F') return 'FTE';
    if (id === 'L') return 'LTC';
    if (id === 'RS' || id === 'R' || id === 'RES') return 'RS';
    return this.normalizeSubFormId(subFormId);
  }
}


