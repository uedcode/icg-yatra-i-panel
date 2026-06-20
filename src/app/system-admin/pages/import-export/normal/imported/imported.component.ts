import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ImportExportApiService } from 'src/app/service/api/import-export/import-export-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
declare var $: any;

@Component({
    selector: 'app-imported',
    templateUrl: './imported.component.html',
    styleUrls: ['./imported.component.css'],
    standalone: false
})
export class ImportedComponent implements OnInit {


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

  private buildNormalImportedHeaders() {
    return {
      type: this.codeStatus.imported,
      isArchived: '0',
      isStaging: '0',
    };
  }

  loadBatchList() {
    try {
      this.$common.showLoader();
      const config = {
        headers: this.buildNormalImportedHeaders()
      };
      this.$importExportBatch.getCustomBatch(config).subscribe(
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

  ids;
  isArchive;
  index;
  changeBatchStatus(isArchive, ids, indexOnPage) {
    const actualIndex = indexOnPage + (this.p1 - 1) * this.noOfPage1;
    this.ids = ids;
    this.isArchive = isArchive;
    this.index = actualIndex;
    $('#changeBatchStatusModal').modal('show');
  }


  changeStatus(isArchive) {
    try {
      this.$common.showLoader();
      var config = {
        headers: {
          'ids': this.ids,
          'isArchived': isArchive,
        }
      };
      
      this.$importExportBatch.changeStatusArchive(config).subscribe((response: any) => {
        if (response.status == true) {

          this.batchList.splice(this.index, 1);
          $('#changeBatchStatusModal').modal('hide');
          this.$claimStateApi.notifyStatusCountRefresh();
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

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

}


