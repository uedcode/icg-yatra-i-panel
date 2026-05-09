import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

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

    const remark = (this.formRemark || '').trim() || this.getDefaultRemark(status);
    if (!remark) {
      this.$common.showMessage('Remark is required.', 'danger');
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
