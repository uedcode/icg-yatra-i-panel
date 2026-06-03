import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { PayLevelService } from 'src/app/service/master/pay-level.service';

declare var $: any;

@Component({
  selector: 'app-pay-level',
  templateUrl: './pay-level.component.html',
  styleUrls: ['./pay-level.component.scss'],
  standalone: false,
})
export class PayLevelComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $payLevel: PayLevelService
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

  openAddModal() {
    this.dataObj = {};
    $('#addPayLevel').modal('show');
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

