import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { PayStateApiService } from 'src/app/service/api/pay-state/pay-state-api.service';
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
    private $payStateApi: PayStateApiService,
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
        unitId: '',
        gxUnitId: this.userIdDetails?.gxUnitId || '',
        state: this.codeStatus?.outbox,
        isArchive: '0',
        formId: '',
        pno: '',
        searchedName: '',
      },
    };
    this.$payStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
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


