import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { FormService } from 'src/app/service/form.service';
import { ImportExportAuditService } from 'src/app/service/importExportAudit.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
    selector: 'app-exported',
    templateUrl: './exported.component.html',
    styleUrls: ['./exported.component.scss'],
    standalone: false
})
export class ExportedComponent implements OnInit {


  codeStatus: { imported: string; exported: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $importExport: ImportExportAuditService,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;

  config: any;
  formObj: any = {};

  searchObj1: any;
  searchObj2: any;
  noOfPage1: any = 10;
  noOfPage2: any = 10;
  p1: any = 1;
  p2: any = 1;

  allAdminForm: any = [];
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
          'type': "EX",
          'isArchived': "0",
          'isStaging': "0"
        }
      }
      this.$importExport.getBatchList(config).subscribe(
        (response: any) => {
          if (response.status == true) {
            this.batchList = response.object;
          }
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
      this.$importExport.getBatchChildren(importExportObject, this.codeStatus, 'EX').subscribe(
        (response: any) => {
          if (response.status) {
            this.showBatchChilds = true;
            this.batchChildList = response.object;
            this.$common.hideLoader();
          }
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
  currentSnoPage: number = 1;
  count: number = 10;
  downloadExportBatch(importExportId, firstTimeIndicator, procIds) {
    try {

      this.$common.showLoader();
      let config = {
        headers: {
          "importExportId": importExportId,
          "type": "EX"
        }
      }
      this.$importExport.downloadExportBatch(config).subscribe((response: any) => {
        if (response.status == true) {
          if (firstTimeIndicator == 1) {
            // this.getStateCount();
          }
          if (this.exportType) {
            $('#exportChangeStatusModal').modal('hide');
            if (this.exportType == "Selected") {
              if (procIds) {
                this.allAdminForm = this.allAdminForm.filter(element => {
                  if (procIds.indexOf(element.procID) == -1) {
                    return element;
                  }
                });
              }
            } else if (this.exportType == "All") {
              this.allAdminForm = [];
            }
          }
          var responseObject = response.object[0]
          this.$importExport.downloadBatchFromResponse(responseObject);

          this.$common.hideLoader();
        }
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
          'isArchive': isArchive,
          'type': "EX"
        }
      };

      this.$importExport.changeStatusArchive(config).subscribe((response: any) => {
        if (response.status == true) {

          this.batchList.splice(this.index, 1);
          $('#changeBatchStatusModal').modal('hide');
          // this.getStateCount();
          this.$common.hideLoader();
        }
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
