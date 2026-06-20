import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { TyDutyPurposeApiService } from 'src/app/service/api/masters/ty-duty-purpose-api.service';

declare var $: any;

@Component({
  selector: 'app-ty-duty-purpose',
  templateUrl: './ty-duty-purpose.component.html',
  styleUrls: ['./ty-duty-purpose.component.scss'],
  standalone: false,
})
export class TyDutyPurposeComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $tyDutyPurpose: TyDutyPurposeApiService
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
      this.$tyDutyPurpose.get(this.config).subscribe(
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
    $('#addTyDutyPurpose').modal('show');
  }

  editRecord(record: any) {
    this.dataObj = { ...record };
    $('#addTyDutyPurpose').modal('show');
  }

  deleteList(id: string) {
    try {
      this.$common.showLoader();
      const config = {
        headers: {
          ids: id,
        },
      };
      this.$tyDutyPurpose.delete(config).subscribe(
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
