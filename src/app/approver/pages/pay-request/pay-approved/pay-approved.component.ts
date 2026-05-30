import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-pay-approved',
  templateUrl: './pay-approved.component.html',
  styleUrls: ['./pay-approved.component.css'],
  standalone: false,
})
export class PayApprovedComponent implements OnInit {
  dataList: any[] = [];
  userIdDetails: any;
  codeStatus: any;
  noOfPage = 10;
  p = 1;
  searchObj = '';

  constructor(
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService,
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
        state: this.codeStatus?.approved,
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

  downloadDocument(row: any): void {
    const docUrl = row?.yatPayDetailsDTO?.docUrl;
    if (!docUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    this.$common.download(docUrl);
  }
}

