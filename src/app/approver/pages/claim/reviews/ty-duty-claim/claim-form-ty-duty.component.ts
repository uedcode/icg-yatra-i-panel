import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { ApproverActionRemarkModalService } from 'src/app/service/core/approver-action-remark-modal.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { isManualClaimModeValue, isYatraClaimModeValue } from 'src/app/shared/utils/claim-review-mode.util';
import { legacyDate, legacyDateTime, legacyValue } from 'src/app/shared/utils/legacy-display.util';
declare var $: any;

@Component({
  selector: 'app-approver-claim-form-ty-duty',
  templateUrl: './claim-form-ty-duty-legacy.component.html',
  styleUrls: ['./claim-form-ty-duty.component.css'],
  standalone: false,
})
export class ClaimFormTyDutyComponent implements OnInit {
  readonly codeSignType = {
    inkSign: 'IS',
    eSign: 'ES',
    inkSignAlt: 'INK_SIGN',
    eSignAlt: 'E_SIGN',
  } as const;

  claimId: string | null = null;
  subFormId = 'TYD';
  supplementaryId: string | null = null;
  statusId = '';
  formObj: any = null;
  claimRemarkSummary: any = null;
  remark = '';
  actionLoading = false;
  isLegacyPreviewContext = false;
  activeTab = 'ship';
  form1 = false;
  form2 = false;
  form3 = false;
  form4 = false;
  form5 = false;
  form6 = false;
  form7 = false;
  parallelView = false;
  parallelViewerUrl = '';
  parallelViewerTitle = '';
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
    this.isLegacyPreviewContext = this.checkLegacyPreviewContext();
    this.handleEsignFeedback();

    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || this.route.snapshot.paramMap.get('id');
      this.supplementaryId = params.get('supId');
      this.subFormId = 'TYD';
      this.statusId = params.get('statusId') || this.route.snapshot.paramMap.get('statusId') || '';
      this.claimRemarkSummary = null;
      this.activeTab = 'ship';
      this.form1 = false;
      this.form2 = false;
      this.form3 = false;
      this.form4 = false;
      this.form5 = false;
      this.form6 = false;
      this.form7 = false;
      this.parallelView = false;
      this.closeParallelViewer();

      if (this.claimId) {
        this.loadClaim();
        this.loadClaimRemarkSummary();
      }
    });
  }

  get pageTitle(): string {
    return `${this.supplementaryId ? 'Supplementary ' : ''}TY Duty Claim`;
  }

  get primaryActionLabel(): string {
    return this.isApprovingRole() ? 'Approve' : 'Verify';
  }

  get allSectionsReviewed(): boolean {
    const bankReviewed = !this.isBankVisible || this.form7;
    const remarksReviewed = !this.isRemarksVisible || this.form6;
    return this.form1 && this.form2 && this.form3 && this.form5 && this.form4 && bankReviewed && remarksReviewed;
  }

  get allUploadedDocumentsVerified(): boolean {
    return this.supportingDocuments.every((doc) => !doc?.url || doc?.checkedIndicator === true);
  }

  get pendingUploadedDocumentCount(): number {
    return this.supportingDocuments.filter((doc) => doc?.url && doc?.checkedIndicator !== true).length;
  }

  get requiresESignForForward(): boolean {
    const signWith = String(this.formObj?.signWith || '').toUpperCase();
    const isESign = signWith === this.codeSignType.eSign || signWith === this.codeSignType.eSignAlt;
    return isESign && this.isApprovingRole();
  }

  get reviewTabs(): Array<{ key: string; label: string }> {
    const tabs = [
      { key: 'ship', label: 'Personal Details' },
      { key: 'ship2', label: 'Travel Details' },
      { key: 'ship3', label: 'Daily Allowance Details' },
      { key: 'ship4', label: 'Financial Details' },
      { key: 'ship5', label: 'Supporting Documents' },
    ];
    if (this.isBankVisible) {
      tabs.push({ key: 'ship7', label: 'Bank Details' });
    }
    if (this.isRemarksVisible) {
      tabs.push({ key: 'ship6', label: 'Remarks' });
    }
    return tabs;
  }

  get isBankVisible(): boolean {
    return !!this.formObj?.yatClaimBankDetailDTO;
  }

  get isRemarksVisible(): boolean {
    return !!String(this.formObj?.internalRemarks ?? '').trim();
  }

  isYatraClaimMode(): boolean {
    return isYatraClaimModeValue(this.formObj?.claimMode);
  }

  isManualClaimMode(): boolean {
    return isManualClaimModeValue(this.formObj?.claimMode);
  }

  get showUnitName(): boolean {
    return this.isUnitTransferType(this.claimDetails?.tempTransferToType);
  }

  get showDutyStation(): boolean {
    return !this.showUnitName && !this.isBlank(this.claimDetails?.dutyStation);
  }

  get showStationProceedingTo(): boolean {
    return this.showUnitName && !this.isBlank(this.claimDetails?.stationProceedingTo);
  }

  get canGoToPreviousSection(): boolean {
    return this.getActiveTabIndex() > 0;
  }

  get canGoToNextSection(): boolean {
    const index = this.getActiveTabIndex();
    return index > -1 && index < this.reviewTabs.length - 1;
  }

  private loadClaim(): void {
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

    this.$claimApi.getSingleClaimPreview(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        let obj = response?.object;
        if (Array.isArray(obj)) obj = obj[0] || null;
        this.formObj = obj || {};
        this.initializeSupportingDocumentVerification();
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage(`Unable to load claim details.`, 'danger');
      },
    });
  }

  private loadClaimRemarkSummary(): void {
    const config = { headers: { claimId: this.claimId } };
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

  canTakeAction(): boolean {
    return !this.isLegacyPreviewContext;
  }

  getTertiaryActionStatus(): string {
    return this.isApprovingRole() ? this.codeStatus?.notApproved : '';
  }

  getTertiaryActionLabel(): string {
    return this.isApprovingRole() ? 'Reject' : '';
  }

  private isAllowedTargetStatus(status: string): boolean {
    const allowed = [this.codeStatus?.outbox, this.codeStatus?.returned];
    if (this.isApprovingRole()) {
      allowed.push(this.codeStatus?.notApproved);
    }
    return allowed.includes(status);
  }

  private validateActionTransition(status: string): Promise<boolean> {
    if (!this.claimId) {
      return Promise.resolve(false);
    }

    if (!this.canTakeAction() || !this.isAllowedTargetStatus(status)) {
      this.$common.showMessage(`This  is not in a valid state for the requested action.`, 'danger');
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
        subFormId: this.subFormId,
      },
    };

    return new Promise((resolve) => {
      this.$claimApi.validateClaimState(config).subscribe({
        next: (response: any) => {
          if (response?.status === false) {
            this.$common.showMessage(response?.message || `${this.pageTitle} transition validation failed.`, 'danger');
            resolve(false);
            return;
          }
          resolve(true);
        },
        error: () => resolve(true),
      });
    });
  }

  openActionRemarkModal(status: string): void {
    if (!status) return;
    if (status === this.codeStatus?.outbox && !this.allUploadedDocumentsVerified) {
      this.setTab('ship5');
      this.$common.showMessage('Please verify all the documents before forwarding.', 'danger');
      return;
    }
    this.$actionRemarkModal
      .open({
        statusId: status,
        remark: this.getRemarkForStatus(status, false),
        requireForwardDeclarations: status === this.codeStatus?.outbox,
      })
      .then((remark) => {
        if (remark !== null) {
          this.submitAction(status, remark);
        }
      });
  }

  async submitAction(status: string, remarkFromModal?: string): Promise<void> {
    if (!this.claimId) return;

    const okToProceed = await this.validateActionTransition(status);
    if (!okToProceed) {
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
    this.$claimStateApi.changeStatusById(payload).subscribe({
      next: (response: any) => {
        this.actionLoading = false;
        this.$common.hideLoader();
        if (response?.status === true) {
          this.$common.showMessage(response?.message || 'Claim status updated successfully.', 'success');
          this.$claimStateApi.notifyStatusCountRefresh();
          this.router.navigateByUrl(this.$auth.getModuleName() + '/inbox-claim');
          return;
        }
        this.$common.showMessage(response?.message || 'Unable to update claim status.', 'danger');
      },
      error: () => {
        this.actionLoading = false;
        this.$common.hideLoader();
        this.$common.showMessage('Unable to update claim status.', 'danger');
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
        this.$common.showMessage(txnId ? `eSign completed successfully. Transaction ID: ` : 'eSign completed successfully.', 'success');
      } else if (status === 'US' || status === 'ER') {
        this.$common.showMessage(txnId ? `eSign could not be completed. Transaction ID: ` : 'eSign could not be completed.', 'danger');
      } else {
        this.$common.showMessage(txnId ? `eSign status is being processed. Transaction ID: ` : 'eSign status is being processed.', 'info');
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { esignStatus: null, txnId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  openPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Preview route is not available.', 'danger');
      return;
    }
    const url = `${this.$auth.getModuleName()}/preview-ty-duty-claim?id=${encodeURIComponent(this.claimId)}&subFormId=${encodeURIComponent(this.subFormId)}`;
    this.previewWindow.openUrl(url);
  }

  openRelatedPreview(route: string, relatedClaimId: any, subFormId?: string): void {
    if (!route || !relatedClaimId) {
      this.$common.showMessage('Preview route is not available.', 'danger');
      return;
    }
    const query = [`id=${encodeURIComponent(String(relatedClaimId))}`];
    if (subFormId) {
      query.push(`subFormId=${encodeURIComponent(subFormId)}`);
    }
    this.previewWindow.openUrl(`${this.$auth.getModuleName()}/${route}?${query.join('&')}`);
  }
  goBack(): void {
    this.location.back();
  }

  getActiveTabIndex(): number {
    return this.reviewTabs.findIndex((tab) => tab.key === this.activeTab);
  }

  setTab(tab: string): void {
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

  display(value: any): string {
    return legacyValue(value);
  }

  inputValue(value: any): string {
    return legacyValue(value, '');
  }

  displayNil(value: any): string {
    return legacyValue(value, 'Nil');
  }

  asDate(value: any): string {
    return legacyDate(value);
  }

  inputDate(value: any): string {
    return legacyDate(value, 'dd-MMM-yyyy', '');
  }

  asDateTime(value: any): string {
    return legacyDateTime(value);
  }

  toNumber(value: any): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  yesNo(value: any): string {
    if (value === 1 || value === '1' || value === true || value === 'Yes') return 'Yes';
    if (value === 0 || value === '0' || value === false || value === 'No') return 'No';
    return '-';
  }

  async viewDocument(url: any): Promise<void> {
    if (!url) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    await this.openDocumentUrl(url, 'Signed Documents');
  }

  async viewSupportingDocument(doc: any): Promise<void> {
    if (!doc?.url) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    const opened = await this.openDocumentUrl(doc.url, this.getDocumentTitle(doc));
    if (opened) {
      doc.disableVal = true;
    }
  }

  closeParallelViewer(): void {
    this.parallelViewerUrl = '';
    this.parallelViewerTitle = '';
  }

  private async openDocumentUrl(url: any, title: string): Promise<boolean> {
    if (this.parallelView) {
      const existingUrl = await this.$auth.resolveExistingFileUrl(url);
      if (!existingUrl) {
        return false;
      }
      this.parallelViewerUrl = existingUrl;
      this.parallelViewerTitle = title;
      return true;
    }

    this.closeParallelViewer();
    return this.$auth.viewFile(url);
  }

  private getDocumentTitle(doc: any): string {
    return (
      doc?.codeDocInfoDTO?.docName ||
      doc?.documentName ||
      doc?.docName ||
      doc?.docNo ||
      'Document'
    );
  }

  private initializeSupportingDocumentVerification(): void {
    this.supportingDocuments.forEach((doc) => {
      if (doc?.url && doc.disableVal === undefined) {
        doc.disableVal = false;
      }
    });
  }

  subForm(): string {
    return 'T';
  }

  get claimDetails(): any {
    return this.formObj?.yatTempDutyClaimDTOs?.[0];
  }

  get familyDetails(): any[] {
    return Array.isArray(this.formObj?.yatFamilyDetailDTOs) ? this.formObj.yatFamilyDetailDTOs : [];
  }

  get travelDetails(): any[] {
    return Array.isArray(this.formObj?.yatClaimTravelDetailsDTOs) ? this.formObj.yatClaimTravelDetailsDTOs : [];
  }

  get supportingDocuments(): any[] {
    return Array.isArray(this.formObj?.yatDocsDTOs) ? this.formObj.yatDocsDTOs : [];
  }

  get foreignTravelDetails(): any[] {
    return Array.isArray(this.formObj?.yatForeignTravelDetailDTOs) ? this.formObj.yatForeignTravelDetailDTOs : [];
  }

  get roadMileageRows(): any[] {
    return Array.isArray(this.claimDetails?.yatTempDutyClaimRoadMileageDTOs) ? this.claimDetails.yatTempDutyClaimRoadMileageDTOs : [];
  }

  get leaveRows(): any[] {
    return Array.isArray(this.claimDetails?.yatTempDutyClaimLeaveDTOs) ? this.claimDetails.yatTempDutyClaimLeaveDTOs : [];
  }

  get accommodationRows(): any[] {
    return Array.isArray(this.claimDetails?.yatTempDutyClaimBoarLodDTOs) ? this.claimDetails.yatTempDutyClaimBoarLodDTOs : [];
  }

  get foodRows(): any[] {
    return Array.isArray(this.claimDetails?.yatTempDutyClaimFoodDTOs) ? this.claimDetails.yatTempDutyClaimFoodDTOs : [];
  }

  get cityJourneyRows(): any[] {
    return Array.isArray(this.claimDetails?.yatTempDutyClaimJourneyDTOs) ? this.claimDetails.yatTempDutyClaimJourneyDTOs : [];
  }

  get gxRows(): any[] {
    return Array.isArray(this.formObj?.yatClaimGxDetailsDTOs) ? this.formObj.yatClaimGxDetailsDTOs : [];
  }

  get lostDocumentRows(): any[] {
    return Array.isArray(this.formObj?.lostDocsDTOs) ? this.formObj.lostDocsDTOs : [];
  }

  get shouldShowLostDocuments(): boolean {
    return this.lostDocumentRows.length > 0 && !!this.formObj?.isExistForm43;
  }

  private isUnitTransferType(value: any): boolean {
    return ['CG Unit', 'Army Unit', 'Naval Unit', 'Air Force Unit'].includes(String(value || '').trim());
  }

  private isBlank(value: any): boolean {
    return value === null || value === undefined || String(value).trim() === '';
  }

  private getRemarkForStatus(status: string, mutateField = true): string {
    const typedRemark = (this.remark || '').trim();
    if (typedRemark) {
      return typedRemark;
    }

    let fallbackRemark = '';
    if (status === this.codeStatus?.outbox) {
      fallbackRemark = this.userIdDetails?.roleTypeId === this.codeRoleType?.approver ? 'Approved' : 'Verified';
    } else if (status === this.codeStatus?.returned) {
      fallbackRemark = 'Returned';
    } else if (status === this.codeStatus?.notApproved || status === this.codeStatus?.rejected || status === this.codeStatus?.notPassed) {
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

  private isVerifier2(): boolean {
    return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier2;
  }

  private isApprovingRole(): boolean {
    return this.isVerifier2() || this.userIdDetails?.roleTypeId === this.codeRoleType?.approver;
  }

  private startESignFlow(remark: string): void {
    this.eSignTempFormObj = {
      id: this.claimId,
      formRemarks: remark,
      recommendedAmount: this.claimDetails?.recommendedAmount ?? this.claimDetails?.claimAmt ?? this.formObj?.claimAmt,
      allotedBudget: this.formObj?.allotedBudget,
      balanceAmount: this.formObj?.balanceAmount,
      progressiveExpenditureAmt: this.formObj?.progressiveExpenditureAmt,
      balance: this.formObj?.balance,
    };
    $('#esign_modal').modal('show');
  }

  private checkLegacyPreviewContext(): boolean {
    const path = this.route.snapshot.routeConfig?.path || '';
    return path.startsWith('preview-') || path === 'movement-update-claim';
  }
}

