import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { ApproverActionRemarkModalService } from 'src/app/service/core/approver-action-remark-modal.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { isLegacyBlank, legacyDate, legacyValue } from 'src/app/shared/utils/legacy-display.util';
declare var $: any;

@Component({
  selector: 'app-approver-form-tyduty',
  templateUrl: './form-tyduty.component.html',
  styleUrls: ['./form-tyduty.component.scss'],
  standalone: false,
})
export class FormTydutyComponent implements OnInit {
  readonly codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
    inkSignAlt: 'INK_SIGN',
    eSignAlt: 'E_SIGN',
  } as const;
  readonly advanceCeilingOptions = Array.from({ length: 61 }, (_, index) => 30 + index);
  claimId: string | null = null;
  formId: string | null = null;
  subFormId = 'T';
  statusId = '';
  previewMode = false;
  formObj: any = null;
  claimRemarkSummary: any = null;
  remark = '';
  redPercentage: number | null = null;
  redAmount: string = '';
  redRemarks = '';
  maxRedAmt: number | null = null;
  actionLoading = false;
  activeTab = 'ship';
  form1 = false;
  form2 = false;
  form3 = false;
  form6 = false;
  eSignTempFormObj: any = null;
  userIdDetails: any;
  codeStatus: any;
  codeRoleType: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private previewWindow: PreviewWindowService,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $actionRemarkModal: ApproverActionRemarkModalService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.codeRoleType = this.$auth.codeRoleType();
    this.previewMode = this.isPreviewRoute();
    this.handleEsignFeedback();

    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || null;
      this.formId = this.claimId;
      this.subFormId = 'T';
      this.statusId = params.get('statusId') || '';
      this.claimRemarkSummary = null;
      this.activeTab = 'ship';
      this.form1 = false;
      this.form2 = false;
      this.form3 = false;
      this.form6 = false;
      this.resetAdvanceCeiling();

      if (!this.claimId) {
        return;
      }

      this.loadAdvanceClaim();
      this.loadClaimRemarkSummary();
    });
  }

  get pageTitle(): string {
    return 'REQUISITION FOR TY DUTY ADVANCE';
  }

  get primaryActionLabel(): string {
    return this.isApprovingRole() ? 'Approve' : 'Verify';
  }

  get canReject(): boolean {
    return this.isApprovingRole();
  }

  get allUploadedDocumentsVerified(): boolean {
    return true;
  }

  get pendingUploadedDocumentCount(): number {
    return 0;
  }

  get requiresESignForForward(): boolean {
    const signWith = String(this.formObj?.signWith || '').toUpperCase();
    const isESign =
      signWith === this.codeSignType.eSign ||
      signWith === this.codeSignType.eSignAlt;
    return isESign && this.isApprovingRole();
  }

  get allSectionsReviewed(): boolean {
    return this.form1 && this.form2 && this.form3 && this.form6;
  }

  get showAdvanceCeilingControls(): boolean {
    return this.canTakeAction() && this.isVerifier2Role();
  }

  get advanceCeilingRemarksMaxLength(): number {
    return 500;
  }

  get displayedAdvanceAmount(): string {
    if (this.redPercentage !== null) {
      return this.showZero(this.maxRedAmt);
    }
    return this.showZero(this.primaryAdvanceDetails?.advAmt);
  }

  get displayedTotalBudgetedAmount(): string {
    if (this.redPercentage !== null) {
      return this.showZero(this.maxRedAmt);
    }
    return this.showZero(this.primaryAdvanceDetails?.totalBudgetedAmt);
  }

  get canGoToPreviousSection(): boolean {
    return this.getActiveTabIndex() > 0;
  }

  get canGoToNextSection(): boolean {
    const index = this.getActiveTabIndex();
    return index > -1 && index < this.reviewTabs.length - 1;
  }

  private isVerifier2Role(): boolean {
    return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier2;
  }

  private isApprovingRole(): boolean {
    return (
      this.isVerifier2Role() ||
      this.userIdDetails?.roleTypeId === this.codeRoleType?.approver
    );
  }

  private isPreviewRoute(): boolean {
    const path = this.route.snapshot.routeConfig?.path || '';
    return path.startsWith('preview-');
  }

  private loadAdvanceClaim(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        userId: this.userIdDetails?.userId || '',
        subFormId: this.subFormId,
        isPreview: 'true',
      },
    };

    this.$common.showLoader();
    this.$claimApi.getSingleClaim(config).subscribe({
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
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to load advance review details.', 'danger');
      },
    });
  }

  private loadClaimRemarkSummary(): void {
    const config = {
      headers: {
        claimId: this.claimId,
      },
    };

    this.$claimApi.getClaimRemarkSummary(config).subscribe({
      next: (response: any) => {
        const remarks = Array.isArray(response?.object) ? response.object : [];
        this.claimRemarkSummary = remarks[0] || null;
      },
      error: () => {
        this.claimRemarkSummary = null;
      },
    });
  }

  get reviewTabs(): Array<{ key: string; label: string }> {
    const tabs = [
      { key: 'ship', label: 'Personal Details' },
      { key: 'ship2', label: 'Travel Details' },
      { key: 'ship3', label: 'Financial Terms' },
      { key: 'ship4', label: 'Bank Details' },
    ];
    if (this.formObj?.internalRemarks) {
      tabs.push({ key: 'ship5', label: 'Remarks' });
    }
    return tabs;
  }

  private getActiveTabIndex(): number {
    return this.reviewTabs.findIndex((tab) => tab.key === this.activeTab);
  }

  setTab(tab: string): void {
    if (!tab) return;
    if (!this.reviewTabs.some((reviewTab) => reviewTab.key === tab)) return;
    this.activeTab = tab;
  }

  setTabFromClick(event: Event, tab: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.setTab(tab);
  }

  nextTabActive(): void {
    const index = this.getActiveTabIndex();
    if (index > -1 && index < this.reviewTabs.length - 1) {
      this.activeTab = this.reviewTabs[index + 1].key;
    }
  }

  previousTabActive(): void {
    const index = this.getActiveTabIndex();
    if (index > 0) {
      this.activeTab = this.reviewTabs[index - 1].key;
    }
  }

  canTakeAction(): boolean {
    return !this.previewMode;
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

    if (status === this.codeStatus?.outbox && !this.allSectionsReviewed) {
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
      this.$claimApi.validateClaimState(config).subscribe({
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

  openActionRemarkModal(status: string): void {
    if (!status) return;
    if (!this.isAdvanceCeilingValid()) return;
    if (status === this.codeStatus?.outbox && !this.allUploadedDocumentsVerified) {
      this.setTab('ship2');
      this.$common.showMessage('Please verify all the documents before forwarding.', 'danger');
      return;
    }

    this.$actionRemarkModal
      .open({
        statusId: status,
        remark: this.getRemarkForStatus(status, false),
        requireForwardDeclarations: status === this.codeStatus?.outbox,
        showDteBalance: status === this.codeStatus?.outbox && this.isVerifier2Role(),
        dteBalance: this.getDteBalance(),
      })
      .then((remark) => {
        if (remark !== null) {
          this.submitAction(status, remark);
        }
      });
  }

  async submitAction(status: string, remarkFromModal?: string): Promise<void> {
    if (!this.claimId) return;
    if (!this.isAdvanceCeilingValid()) {
      return;
    }

    const allowed = await this.validateActionTransition(status);
    if (!allowed) {
      return;
    }

    if (status === this.codeStatus?.outbox && !this.allUploadedDocumentsVerified) {
      this.setTab('ship2');
      this.$common.showMessage('Please verify all the documents before forwarding.', 'danger');
      return;
    }

    const remark = (remarkFromModal ?? this.getRemarkForStatus(status)).trim();
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
      subFormId: this.subFormId,
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      financialYear: this.userIdDetails?.financialYear,
      moduleId: this.userIdDetails?.moduleId,
      status,
      remark,
      redPercent: this.redPercentage ?? undefined,
      redAmount: this.redPercentage !== null ? this.redAmount || undefined : undefined,
      redRemarks: this.redPercentage !== null ? (this.redRemarks || undefined) : undefined,
    };

    this.actionLoading = true;
    this.$common.showLoader();
    this.$claimStateApi.changeStatusById(payload).subscribe({
      next: (response: any) => {
        this.actionLoading = false;
        this.$common.hideLoader();
        if (response?.status === true) {
          this.$common.showMessage(
            response?.message || 'Advance status updated successfully.',
            'success'
          );
          this.$claimStateApi.notifyStatusCountRefresh();
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
      `?id=${encodeURIComponent(this.formId ?? this.claimId)}` +
      `&subFormId=${encodeURIComponent(this.subFormId)}`;
    this.previewWindow.openUrl(url);
  }

  openRelatedPreview(relatedClaimId: any): void {
    if (!relatedClaimId) {
      this.$common.showMessage('Related preview id is not available.', 'danger');
      return;
    }
    const url = `${this.$auth.getModuleName()}/preview-ty-duty?id=${encodeURIComponent(relatedClaimId)}`;
    this.previewWindow.openUrl(url);
  }

  private getPreviewRoute(): string {
    return 'preview-ty-duty';
  }

  goBack(): void {
    this.location.back();
  }

  display(value: any): string {
    return legacyValue(value, '');
  }

  showNil(value: any): string {
    return legacyValue(value, 'Nil');
  }

  showZero(value: any): string {
    return isLegacyBlank(value) ? '0' : String(value).trim();
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
    return legacyDate(value, 'dd-MMM-yyyy', '');
  }

  isChecked(value: any): boolean {
    return value === true || value === 1 || value === '1' || value === 'true' || value === 'Y';
  }

  isAvailedCategoryOneOrTwo(value: any): boolean {
    return String(value) === '1' || String(value) === '2';
  }

  isAvailedCategoryZero(value: any): boolean {
    return String(value) === '0';
  }

  viewDocument(url: any): void {
    this.$auth.viewFile(url);
  }

  get primaryAdvanceDetails(): any {
    return this.formObj?.yatTempDutyAdvDTOs?.[0];
  }

  get advanceDetails(): any {
    return this.formObj?.yatTempDutyAdvDTOs?.[0];
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

  private getDteBalance(): string | number | null {
    return this.formObj?.balancePostBooked ?? this.formObj?.balance ?? this.formObj?.balanceAmount ?? null;
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
      redPercent: this.redPercentage ?? undefined,
      redAmount: this.redPercentage !== null ? this.redAmount || undefined : undefined,
      redRemarks: this.redPercentage !== null ? (this.redRemarks || undefined) : undefined,
    };
    $('#esign_modal').modal('show');
  }
}




