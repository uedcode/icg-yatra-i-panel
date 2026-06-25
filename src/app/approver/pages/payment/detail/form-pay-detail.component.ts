import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { PayStateApiService } from 'src/app/service/api/payment/pay-state-api.service';
import { YatPayDetailsApiService } from 'src/app/service/api/payment/yat-pay-details-api.service';
import { CommonService } from 'src/app/service/core/common.service';
declare var $: any;

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
  selectedStatus = '';
  readonly payStateCodes = {
    outbox: 'OB',
    approved: 'AP',
    notApproved: 'NA',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService,
    private $claimStateApi: ClaimStateApiService,
    private $payStateApi: PayStateApiService,
    private $payDetailsApi: YatPayDetailsApiService,
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
    const config = {
      headers: {
        pid: this.userIdDetails?.userId,
        id,
      },
    };
    this.$common.showLoader();
    this.$payDetailsApi.getAll(config).subscribe(
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
    return (
      this.payDetails?.statusId ||
      this.payDetails?.payState ||
      this.payDetails?.formState ||
      this.payDetails?.state ||
      ''
    );
  }

  get canTakeAction(): boolean {
    if (this.mode !== 'action') {
      return false;
    }

    const role = this.userIdDetails?.roleTypeId;
    const validRole =
      role === this.codeRoleType?.verifier1 || role === this.codeRoleType?.verifier2;

    const state = (this.currentState || '').toString().trim();
    return validRole && (!state || state === this.codeStatus?.inbox);
  }

  get showActionSection(): boolean {
    return this.mode === 'action' && this.canTakeAction;
  }

  getActionPlaceholder(status: string): string {
    return this.getDefaultRemark(status) || 'Enter remark';
  }

  openRemarkModal(status: string): void {
    this.formRemark = this.getDefaultRemark(status);
    this.selectedStatus = status;
    $('#payRemarkModal').modal('show');
  }

  viewDocument(): void {
    const docUrl = this.payDetails?.docUrl;
    if (!docUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    this.$auth.viewFile(docUrl);
  }

  applyAction(status: string = this.selectedStatus): void {
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
    this.$payStateApi.changeStatusById(payload).subscribe((res: any) => {
      if (res?.status) {
        this.$common.showMessage(res?.message || 'Status updated successfully.');
        $('#payRemarkModal').modal('hide');
        this.$claimStateApi.notifyStatusCountRefresh();
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
    return '';
  }
}


