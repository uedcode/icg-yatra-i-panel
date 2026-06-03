import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';
import { VersionhistoryService } from 'src/app/service/master/versionhistory.service';

declare var $: any;

@Component({
    selector: 'app-version-history',
    templateUrl: './version-history.component.html',
    styleUrls: ['./version-history.component.scss'],
    standalone: false
})
export class VersionHistoryComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $versionhistory: VersionhistoryService
  ) {}

  @Input() dataList: Array<any> = [];

  fileUrl = environment.fileUrl;
  id: any;
  pageType: any;
  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  config: any;
  dataObj: any = {};

  ngOnInit() {
    this.getAll();
  }

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      this.$versionhistory.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            const list = Array.isArray(response.object) ? response.object : [];
            this.dataList = list;
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
    $('#addVersion').modal('show');
  }

  // edit start
  editRecord(category) {
    $('#addVersion').modal('show');
    this.dataObj = { ...category };
  }
  // edit end

  // delete start
  deleteList(id) {
    try {
      this.$common.showLoader();
      var config = {
        headers: {
          ids: id,
        },
      };
      this.$versionhistory.delete(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(response.message);
            this.dataList = this.dataList.filter((elem) => elem.verHisId != id);
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
  // delete end

  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end
}
