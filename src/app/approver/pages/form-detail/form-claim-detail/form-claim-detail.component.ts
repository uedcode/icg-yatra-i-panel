import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-form-claim-detail',
  templateUrl: './form-claim-detail.component.html',
  styleUrls: ['./form-claim-detail.component.css'],
  standalone: false,
})
export class FormClaimDetailComponent implements OnInit {
  claimId: string | null = null;
  subFormId: string | null = null;
  statusId: string | null = null;
  actionable = false;
  formObj: any = null;
  documentDtos: any[] = [];
  stateHistory: any[] = [];
  claimRemarkSummary: any = null;
  remark = '';
  actionLoading = false;
  isLegacyPreviewContext = false;
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

    this.route.queryParamMap.subscribe((params) => {
      const routeParams = this.route.snapshot.paramMap;
      this.claimId = params.get('claimId') || params.get('id') || routeParams.get('claimId');
      this.subFormId = params.get('subFormId') || routeParams.get('subFormId');
      this.statusId = params.get('statusId') || routeParams.get('statusId');
      this.actionable =
        (params.get('actionable') === '1' || routeParams.get('actionable') === '1') &&
        !this.isLegacyPreviewContext;
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
      },
    };

    this.$claim.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        let obj = response?.object;
        if (Array.isArray(obj)) obj = obj[0] || null;
        this.formObj = obj;
        this.documentDtos = Array.isArray(obj?.yatDocsDTOs) ? obj.yatDocsDTOs : [];
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
        unitId: this.userIdDetails?.unitId,
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
      this.codeStatus?.rejected,
      this.codeStatus?.returned,
      this.codeStatus?.passed,
      this.codeStatus?.notPassed,
    ].filter(Boolean);
    return !closedStates.includes(this.statusId);
  }

  getActionLabel(): string {
    if (this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier) {
      return 'Verify & Forward';
    }
    return 'Approve';
  }

  getTertiaryActionStatus(): string {
    if (this.isVerifierResettlementMode()) {
      return this.codeStatus?.notPassed;
    }
    return this.codeStatus?.rejected;
  }

  getTertiaryActionLabel(): string {
    if (this.isVerifierResettlementMode()) {
      return 'Not Passed';
    }
    return 'Reject';
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

  private isResettlementSubForm(): boolean {
    const id = (this.subFormId || '').toUpperCase();
    return id === 'RS' || id === 'RES' || id === 'R';
  }

  isVerifierResettlementMode(): boolean {
    return (
      this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier &&
      this.isResettlementSubForm()
    );
  }

  private isLocallyAllowedTargetStatus(status: string): boolean {
    const allowed = this.isVerifierResettlementMode()
      ? [this.codeStatus?.outbox, this.codeStatus?.returned, this.codeStatus?.notPassed]
      : [this.codeStatus?.outbox, this.codeStatus?.returned, this.codeStatus?.rejected];
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
    const remark = (this.remark || '').trim();
    if (!remark) {
      this.$common.showMessage('Remark is required.', 'danger');
      return;
    }

    const okToProceed = await this.validateActionTransition(status);
    if (!okToProceed) {
      return;
    }

    const payload = {
      claimId: this.claimId,
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
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
          this.router.navigateByUrl(this.$auth.getModuleName() + '/inbox');
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

  goBack(): void {
    this.location.back();
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

  subForm(): string {
    return (this.subFormId || '').toUpperCase();
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
}
