import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { PayLevelApiService } from 'src/app/service/api/masters/pay-level-api.service';

declare var $: any;

@Component({
  selector: 'app-pay-level',
  templateUrl: './pay-level.component.html',
  styleUrls: ['./pay-level.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PayLevelComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $payLevel: PayLevelApiService
  ) {}

  @Input() dataList: Array<any> = [];

  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  config: any;
  dataObj: any = {};
  key = 'payLevel';
  reverse = false;

  ngOnInit() {
    this.getAll();
  }

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      this.$payLevel.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.dataList = Array.isArray(response.object) ? response.object : [];
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  editRecord(record: any) {
    this.dataObj = { ...record };
    $('#addPayLevel').modal('show');
  }

  sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}
