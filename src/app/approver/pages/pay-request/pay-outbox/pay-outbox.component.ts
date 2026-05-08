import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';

@Component({
  selector: 'app-pay-outbox',
  templateUrl: './pay-outbox.component.html',
  styleUrls: ['./pay-outbox.component.css'],
  standalone: false,
})
export class PayOutboxComponent implements OnInit {
  dataList: any[] = [];
  userIdDetails: any;
  codeStatus: any;
  noOfPage = 10;
  p = 1;

  constructor(
    private $auth: AuthService,
    private $claim: ClaimService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.loadData();
  }

  loadData(): void {
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        state: this.codeStatus?.outbox,
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
      `${this.$auth.getModuleName()}/form-pay-detail?id=${payId}&mode=view`
    );
  }
}

