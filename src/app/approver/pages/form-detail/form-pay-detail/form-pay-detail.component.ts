import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-pay-detail',
  templateUrl: './form-pay-detail.component.html',
  styleUrls: ['./form-pay-detail.component.css'],
  standalone: false,
})
export class FormPayDetailComponent implements OnInit {
  payDetails: any = {};
  mode: 'view' | 'action' = 'view';
  codeStatus: any;
  codeRoleType: any;
  userIdDetails: any;
  formRemark = '';
  readonly payStateCodes = {
    outbox: 'OB',
    approved: 'AP',
    notApproved: 'NA',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.codeRoleType = this.$auth.codeRoleType();
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id') || '';
      this.mode = (params.get('mode') as 'view' | 'action') || 'view';
      if (!id) return;
      this.loadDetails(id);
    });
  }

  private loadDetails(id: string): void {
    const config = { headers: { id } };
    this.$common.showLoader();
    this.$claim.getPayDetails(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        if (res?.status && Array.isArray(res.object) && res.object.length) {
          this.payDetails = res.object[0];
          if (this.mode === 'action') {
            this.formRemark = this.getDefaultRemark(this.payStateCodes.outbox);
          }
        }
      },
      () => this.$common.hideLoader()
    );
  }

  getPrimaryActionLabel(): string {
    return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier1
      ? 'Verify'
      : 'Approve';
  }

  get canReject(): boolean {
    const role = this.userIdDetails?.roleTypeId;
    return role === this.codeRoleType?.verifier1 || role === this.codeRoleType?.verifier2;
  }

  get currentState(): string {
    return this.payDetails?.statusId || this.payDetails?.payState || this.payDetails?.formState || '';
  }

  get canTakeAction(): boolean {
    if (this.mode !== 'action') {
      return false;
    }

    const role = this.userIdDetails?.roleTypeId;
    const validRole =
      role === this.codeRoleType?.verifier1 || role === this.codeRoleType?.verifier2;

    return validRole && this.currentState === this.codeStatus?.inbox;
  }

  getActionPlaceholder(status: string): string {
    return this.getDefaultRemark(status) || 'Enter remark';
  }

  setActionRemark(status: string): void {
    this.formRemark = this.getDefaultRemark(status);
  }

  viewDocument(): void {
    const docUrl = this.payDetails?.docUrl;
    if (!docUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    this.$auth.viewFile(docUrl);
  }

  applyAction(status: string): void {
    const payId = this.payDetails?.id;
    if (!payId) return;
    if (!this.canTakeAction) {
      this.$common.showMessage(
        'This pay detail is not in a valid inbox state for action.',
        'danger'
      );
      return;
    }

    const remark = (this.formRemark || '').trim() || this.getDefaultRemark(status);
    if (!remark) {
      this.$common.showMessage('Remark is required.', 'danger');
      return;
    }

    if (!this.isAllowedTargetStatus(status)) {
      this.$common.showMessage('This action is not allowed for the current role.', 'danger');
      return;
    }

    const payload = {
      claimId: payId,
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status,
      remark,
    };
    this.$claim.changePayStatusById(payload).subscribe((res: any) => {
      if (res?.status) {
        this.$common.showMessage(res?.message || 'Status updated successfully.');
        this.router.navigateByUrl(`${this.$auth.getModuleName()}/pay-inbox`);
      }
    });
  }

  private isAllowedTargetStatus(status: string): boolean {
    const role = this.userIdDetails?.roleTypeId;
    if (role === this.codeRoleType?.verifier1) {
      return (
        status === this.payStateCodes.outbox ||
        status === this.payStateCodes.notApproved
      );
    }
    if (role === this.codeRoleType?.verifier2) {
      return (
        status === this.payStateCodes.outbox ||
        status === this.payStateCodes.notApproved
      );
    }
    return false;
  }

  private getDefaultRemark(status: string): string {
    if (status === this.payStateCodes.outbox) {
      return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier1
        ? 'Verified'
        : 'Approved';
    }
    if (status === this.payStateCodes.notApproved) {
      return 'Rejected';
    }
    return '';
  }
}

