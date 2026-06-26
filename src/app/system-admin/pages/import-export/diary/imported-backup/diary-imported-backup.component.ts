import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { BatchDiaryApiService } from 'src/app/service/api/batch/batch-diary-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
declare var $: any;

@Component({
  selector: 'app-diary-imported-backup',
  templateUrl: './diary-imported-backup.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class DiaryImportedBackupComponent implements OnInit {
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
  ids: any;
  index: any;
  showBatchChilds = false;
  key = 'descr';
  reverse = false;

  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    public $diaryBatch: BatchDiaryApiService,
    private $claimStateApi: ClaimStateApiService,
  ) {}

  ngOnInit() {
    this.codeStatus = this.$auth.codeStatus();
    this.loadBatchList();
  }

  loadBatchList() {
    this.$common.showLoader();
    const config = { headers: { type: 'DI', isArchived: '1', isStaging: '0' } };
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
    this.$diaryBatch.getBatchChildren(importExportObject).subscribe((response: any) => {
      if (response.status) {
        this.showBatchChilds = true;
        this.batchChildList = response.object || [];
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  changeBatchStatus(ids: any, indexOnPage: number) {
    this.ids = ids;
    this.index = indexOnPage + (this.p1 - 1) * this.noOfPage1;
    $('#changeBatchStatusModal').modal('show');
  }

  changeStatus(isArchived: any) {
    this.$common.showLoader();
    const config = { headers: { ids: this.ids, isArchived, type: 'DI' } };
    this.$diaryBatch.changeStatusArchive(config).subscribe((response: any) => {
      if (response.status === true) {
        this.batchList.splice(this.index, 1);
        $('#changeBatchStatusModal').modal('hide');
        this.$claimStateApi.notifyStatusCountRefresh();
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }
}

