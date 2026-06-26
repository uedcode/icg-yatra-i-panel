import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { PayStateApiService } from 'src/app/service/api/payment/pay-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-pay-outbox',
  templateUrl: './pay-outbox.component.html',
  styleUrls: ['./pay-outbox.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    private $auth: AuthService,
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
        userId: '',
        unitId: '',
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
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
}


