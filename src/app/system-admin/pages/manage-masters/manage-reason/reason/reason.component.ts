import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { ReasonApiService } from 'src/app/service/api/masters/reason-api.service';

declare var $: any;

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss'],
  standalone: false,
})
export class ReasonComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $reason: ReasonApiService
  ) {}

  @Input() dataList: Array<any> = [];

  id: any;
  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  config: any;
  dataObj: any = {};
  key = 'createdOn';
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
      this.$reason.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.dataList = Array.isArray(response.object)
              ? response.object
              : [];
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
    $('#addReason').modal('show');
  }

  editRecord(record: any) {
    this.dataObj = { ...record };
    $('#addReason').modal('show');
  }

  deleteList(id: string) {
    try {
      this.$common.showLoader();
      const config = {
        headers: {
          ids: id,
        },
      };
      this.$reason.delete(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(response.message);
            this.dataList = this.dataList.filter((elem) => elem.id !== id);
            $('#delete_modal').modal('hide');
          }
        },
        (error) => {
          this.$common.hideLoader();
          console.log(error);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}
