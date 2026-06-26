import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ImportExportApiService } from 'src/app/service/api/batch/import-export-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
declare var $: any;

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ImportComponent implements OnInit {


  codeStatus: { imported: string; exported: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $importExportBatch: ImportExportApiService,
    private $claimStateApi: ClaimStateApiService,
  ) { }

  id: any;
  config: any;
  
  searchObj1: any;
  searchObj2: any;
  noOfPage1: any = 5;
  noOfPage2: any = 5;
  p1: any = 1;
  p2: any = 1;

  batchList: any = [];
  batchChildList: any = [];
  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.loadBatchList();
  }

  private buildNormalImportHeaders(isStaging: string) {
    return {
      type: this.codeStatus.imported,
      isArchived: '0',
      isStaging,
    };
  }

  loadBatchList() {
    try {
      this.$common.showLoader();
      const config = {
        headers: this.buildNormalImportHeaders('1')
      };
      this.$importExportBatch.getBatchList(config).subscribe(
        (response: any) => {
          if (response.status == true) {
            this.batchList = response.object;
          }
          this.$common.hideLoader();
        }, err => {
          this.$common.hideLoader();
        })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  showBatchChilds = false;
  batchNo;
  viewingImportExportId;
  getAllBatchChilds(importExportObject) {
    try {
      this.$common.showLoader();
      this.batchNo = importExportObject.batchNo;
      this.viewingImportExportId = importExportObject.importExportId;
      this.$importExportBatch.getBatchChildren(importExportObject, this.codeStatus).subscribe(
        (response: any) => {
          if (response.status) {
            this.showBatchChilds = true;
            this.batchChildList = response.object;
          }
          this.$common.hideLoader();
        }, err => {
          this.$common.hideLoader();
        })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }


  filterDataObj
  exportType;
  submitBtn = false;

  ids;
  isArchive;
  index;
  importExportId;
  changeData;
  changeStagingStatus(importExportId, indexOnPage) {
    this.importExportId = importExportId;
    const actualIndex = indexOnPage + (this.p1 - 1) * this.noOfPage1;
    this.index = actualIndex;
    $('#stagingChangeStatusModal').modal('show');
  }
  deleteBatchStaging(importExportId, indexOnPage) {
    this.importExportId = importExportId;
    const actualIndex = indexOnPage + (this.p1 - 1) * this.noOfPage1;
    this.index = actualIndex;
    $('#stagingDeleteModal').modal('show');
  }

  changeStagingStatusFinally() {
    try {

      this.$common.showLoader();
      var config = {
        headers: {
          "importExportId": this.importExportId,
        }
      }
      this.$importExportBatch.importBatch({}, config).subscribe((response: any) => {
        if (response.status == true) {
          this.$claimStateApi.notifyStatusCountRefresh();
          this.batchList.splice(this.index, 1);
          if (this.viewingImportExportId == this.importExportId) {
            this.showBatchChilds = false;
          }
          $('#stagingChangeStatusModal').modal('hide');
        }
        this.$common.hideLoader();
      },
        (err) => {
          this.$common.hideLoader();
          console.error(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.error(error);
    }
  }
  deleteRow() {
    try {
      this.$common.showLoader();
      var config = {
        headers: {
          'ids': this.importExportId,
        }
      };
      this.$importExportBatch.delete(config).subscribe((response: any) => {
        if (response.status == true) {
          this.batchList.splice(this.index, 1);
          if (this.viewingImportExportId == this.importExportId) {
            this.showBatchChilds = false;
          }

          this.$claimStateApi.notifyStatusCountRefresh();
          $("#stagingDeleteModal").modal('hide');
        }
        this.$common.hideLoader();
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  updateData(Object) {
    if (Object?.length) {
      this.batchList.splice(0, 0, Object[0]);
      this.$claimStateApi.notifyStatusCountRefresh();
    }
  }


  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

}

