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
        }
      },
      () => this.$common.hideLoader()
    );
  }

  getPrimaryActionLabel(): string {
    return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier
      ? 'Verify'
      : 'Approve';
  }

  applyAction(isReturn = false): void {
    const payId = this.payDetails?.id;
    if (!payId) return;
    const status = isReturn
      ? this.codeStatus?.rejected
      : this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier
      ? this.codeStatus?.outbox
      : this.codeStatus?.approved;
    const remark = isReturn
      ? 'Returned'
      : this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier
      ? 'Verified'
      : 'Approved';
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
}

