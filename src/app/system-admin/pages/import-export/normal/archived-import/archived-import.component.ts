import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ImportExportBatchService } from 'src/app/service/admin/import-export-batch.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
declare var $: any;


@Component({
    selector: 'app-archived-import',
    templateUrl: './archived-import.component.html',
    styleUrls: ['./archived-import.component.css'],
    standalone: false
})
export class ArchivedImportComponent implements OnInit {


  codeStatus: { exported: string; imported: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $importExportBatch: ImportExportBatchService,
    private $claim: ClaimService,
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
  loadBatchList() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {
          'type': this.codeStatus.imported,
          'isArchived': "1",
          'isStaging': "0"
        }
      }
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
  submitBtn = false;
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
          this.$claim.notifyStatusCountRefresh();
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

