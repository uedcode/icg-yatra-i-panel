import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { FormService } from 'src/app/service/form/form.service';
import { ImportExportAuditService } from 'src/app/service/admin/importExportAudit.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.css'],
    standalone: false
})
export class ImportComponent implements OnInit {


  codeStatus: { imported: string; exported: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $importExport: ImportExportAuditService,
    private route: ActivatedRoute,
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
  newBatchList: any = [];
  fileUrl = environment.fileUrl;
  private batchType: 'IM' | 'DI' = 'IM';
  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.batchType = this.route.snapshot.routeConfig?.path?.includes('diary') ? 'DI' : 'IM';
    this.loadBatchList();
  }
  loadBatchList() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {
          'type': this.batchType,
          'isArchived': "0",
          'isStaging': "1"
        }
      }
      this.$importExport.getCustomBatch(config).subscribe(
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
      this.$importExport.getBatchChildren(importExportObject, this.codeStatus, this.batchType).subscribe(
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
          "type": this.batchType
        }
      }
      this.$importExport.importBatch({}, config).subscribe((response: any) => {
        if (response.status == true) {
          // this.getStateCount();
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
          'type': this.batchType
        }
      };
      this.$importExport.delete(config).subscribe((response: any) => {
        if (response.status == true) {
          this.batchList.splice(this.index, 1);
          if (this.viewingImportExportId == this.importExportId) {
            this.showBatchChilds = false;
          }

          // this.getStateCount();
          $("#stagingDeleteModal").modal('hide');
          this.$common.hideLoader();
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
    this.batchList.push(Object[0]);
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
