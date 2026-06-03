import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-pay-outbox',
  templateUrl: './pay-outbox.component.html',
  styleUrls: ['./pay-outbox.component.scss'],
  standalone: false,
})
export class PayOutboxComponent implements OnInit {
  dataList: any[] = [];
  userIdDetails: any;
  codeStatus: any;
  noOfPage = 10;
  p = 1;
  searchObj = '';

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $claim: ClaimService,
    private router: Router,
    private $common: CommonService
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
    this.router.navigateByUrl(`${this.$auth.getModuleName()}/form-pay-details?id=${payId}`);
  }

  downloadDocument(row: any): void {
    const docUrl = row?.yatPayDetailsDTO?.docUrl;
    if (!docUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    this.$common.download(docUrl);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
}

