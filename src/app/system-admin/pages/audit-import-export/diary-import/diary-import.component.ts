import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { DiaryBatchService } from 'src/app/service/admin/diary-batch.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
declare var $: any;

@Component({
  selector: 'app-diary-import',
  templateUrl: './diary-import.component.html',
  standalone: false
})
export class DiaryImportComponent implements OnInit {
  codeStatus: any;
  searchObj1: any;
  searchObj2: any;
  noOfPage1: any = 5;
  noOfPage2: any = 5;
  p1: any = 1;
  p2: any = 1;
  batchList: any[] = [];
  batchChildList: any[] = [];
  batchNo: any;
  viewingImportExportId: any;
  importExportId: any;
  index: any;
  showBatchChilds = false;
  key = 'descr';
  reverse = false;

  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    public $diaryBatch: DiaryBatchService,
    private $claim: ClaimService,
  ) {}

  ngOnInit() {
    this.codeStatus = this.$auth.codeStatus();
    this.loadBatchList();
  }

  loadBatchList() {
    this.$common.showLoader();
    const config = { headers: { type: 'DI', isArchived: '0', isStaging: '1' } };
    this.$diaryBatch.getBatchList(config).subscribe((response: any) => {
      if (response.status === true) {
        this.batchList = response.object || [];
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  getAllBatchChilds(importExportObject: any) {
    this.$common.showLoader();
    this.batchNo = importExportObject.batchNo;
    this.viewingImportExportId = importExportObject.importExportId;
    this.$diaryBatch.getBatchChildren(importExportObject).subscribe((response: any) => {
      if (response.status) {
        this.showBatchChilds = true;
        this.batchChildList = response.object || [];
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  changeStagingStatus(importExportId: any, indexOnPage: number) {
    this.importExportId = importExportId;
    this.index = indexOnPage + (this.p1 - 1) * this.noOfPage1;
    $('#stagingChangeStatusModal').modal('show');
  }

  deleteBatchStaging(importExportId: any, indexOnPage: number) {
    this.importExportId = importExportId;
    this.index = indexOnPage + (this.p1 - 1) * this.noOfPage1;
    $('#stagingDeleteModal').modal('show');
  }

  changeStagingStatusFinally() {
    this.$common.showLoader();
    const config = { headers: { importExportId: this.importExportId, type: 'DI' } };
    this.$diaryBatch.importBatch({}, config).subscribe((response: any) => {
      if (response.status === true) {
        this.batchList.splice(this.index, 1);
        this.$claim.notifyStatusCountRefresh();
        if (this.viewingImportExportId === this.importExportId) {
          this.showBatchChilds = false;
        }
        $('#stagingChangeStatusModal').modal('hide');
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  deleteRow() {
    this.$common.showLoader();
    const config = { headers: { ids: this.importExportId, type: 'DI' } };
    this.$diaryBatch.delete(config).subscribe((response: any) => {
      if (response.status === true) {
        this.batchList.splice(this.index, 1);
        this.$claim.notifyStatusCountRefresh();
        if (this.viewingImportExportId === this.importExportId) {
          this.showBatchChilds = false;
        }
        $('#stagingDeleteModal').modal('hide');
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  updateData(object: any[]) {
    if (object?.length) {
      this.batchList.splice(0, 0, object[0]);
      this.$claim.notifyStatusCountRefresh();
    }
  }
}
