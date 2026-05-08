import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-pay-inbox',
  templateUrl: './pay-inbox.component.html',
  styleUrls: ['./pay-inbox.component.css'],
  standalone: false,
})
export class PayInboxComponent implements OnInit {
  dataList: any[] = [];
  userIdDetails: any;
  codeStatus: any;
  codeRoleType: any;
  noOfPage = 10;
  p = 1;

  constructor(
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.codeRoleType = this.$auth.codeRoleType();
    this.loadData();
  }

  loadData(): void {
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        state: this.codeStatus?.inbox,
      },
    };
    this.$claim.getPayStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(row: any): void {
    const payId = row?.yatPayDetailsDTO?.id || row?.id;
    if (!payId) return;
    this.router.navigateByUrl(
      `${this.$auth.getModuleName()}/form-pay-detail?id=${payId}&mode=action`
    );
  }

  getPrimaryActionLabel(): string {
    return this.userIdDetails?.roleTypeId === this.codeRoleType?.verifier
      ? 'Verify'
      : 'Approve';
  }

  submitAction(row: any, isReturn = false): void {
    const payId = row?.yatPayDetailsDTO?.id || row?.id;
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
        this.loadData();
      }
    });
  }
}

