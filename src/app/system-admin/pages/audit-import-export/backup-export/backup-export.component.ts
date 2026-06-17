import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ImportExportBatchService } from 'src/app/service/admin/import-export-batch.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
declare var $: any;

@Component({
  selector: 'app-backup-export',
  templateUrl: './backup-export.component.html',
  standalone: false
})
export class BackupExportComponent implements OnInit {
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
  showBatchChilds = false;
  ids: any;
  index: any;
  key = 'descr';
  reverse = false;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $importExportBatch: ImportExportBatchService,
    private $claim: ClaimService,
  ) {}

  ngOnInit() {
    this.codeStatus = this.$auth.codeStatus();
    this.loadBatchList();
  }

  loadBatchList() {
    this.$common.showLoader();
    const config = {
      headers: {
        type: this.codeStatus.exported,
        isArchived: '1',
        isStaging: '0',
      }
    };
    this.$importExportBatch.getBatchList(config).subscribe((response: any) => {
      if (response.status === true) {
        this.batchList = response.object || [];
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  getAllBatchChilds(importExportObject: any) {
    this.$common.showLoader();
    this.batchNo = importExportObject.batchNo;
    this.$importExportBatch.getBatchChildren(importExportObject, this.codeStatus).subscribe((response: any) => {
      if (response.status) {
        this.showBatchChilds = true;
        this.batchChildList = response.object || [];
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  downloadExportBatch(importExportId: any) {
    this.$common.showLoader();
    const config = { headers: { importExportId } };
    this.$importExportBatch.downloadExportBatch(config).subscribe((response: any) => {
      if (response.status === true) {
        this.$importExportBatch.downloadBatchFromResponse(response.object?.[0]);
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
    const config = { headers: { ids: this.ids, isArchived } };
    this.$importExportBatch.changeStatusArchive(config).subscribe((response: any) => {
      if (response.status === true) {
        this.batchList.splice(this.index, 1);
        $('#changeBatchStatusModal').modal('hide');
        this.$claim.notifyStatusCountRefresh();
      }
      this.$common.hideLoader();
    }, () => this.$common.hideLoader());
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
}
