import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { BatchDiaryApiService } from 'src/app/service/api/batch/batch-diary-api.service';
import { ImportExportApiService } from 'src/app/service/api/batch/import-export-api.service';
import { Router } from '@angular/router';
declare var $: any;
@Component({
    selector: 'app-batch-import-modal',
    templateUrl: './batch-import-modal.component.html',
    styleUrls: ['./batch-import-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class BatchImportModalComponent implements OnInit {

  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    public $importExportBatch: ImportExportApiService,
    public $diaryBatch: BatchDiaryApiService,
    private router: Router,
  ) { }
  @Output() batchImported = new EventEmitter();
  ngOnInit() {
  }


  formObj: any = {};
  batchList: any = [];
  disableBtn = false;
  selectedBatchFile: File | null = null;
  fileError = '';

  onBatchFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    this.selectedBatchFile = file;
    this.fileError = '';

    if (!file) {
      return;
    }

    if (!this.isZipFile(file)) {
      this.fileError = 'Please choose ZIP file only.';
      this.$common.showMessage(this.fileError, 'danger');
      this.clearFileInput(input);
    }
  }

  uploadBatchZip() {
    try {
      const fileInput = document.getElementById('batchZipFile') as HTMLInputElement;
      const file = this.selectedBatchFile || fileInput?.files?.[0];
      if (!file) {
        this.fileError = 'Please choose ZIP file.';
        this.$common.showMessage(this.fileError, 'danger');
        return;
      }

      if (!this.isZipFile(file)) {
        this.fileError = 'Please choose ZIP file only.';
        this.$common.showMessage(this.fileError, 'danger');
        this.clearFileInput(fileInput);
        return;
      }

      this.disableBtn = true;
      this.$common.showLoader();

      const formData = new FormData();
      formData.append('batchFile', file);
      const isDiaryPage = this.router.url.includes('diary');
      const config = {
        headers: {
          ...(isDiaryPage ? { type: 'DI' } : {}),
        },
      };

      const uploadRequest = isDiaryPage
        ? this.$diaryBatch.importBatchStaging(formData, config)
        : this.$importExportBatch.importBatchStaging(formData, config);

      uploadRequest.subscribe(
        (response: any) => {
          if (response.status === true) {
            this.batchImported.emit(response.object);
            this.clearFileInput(fileInput);
            $("#batchImportModal").modal('hide');
          }
          this.disableBtn = false;
          this.$common.hideLoader();
        },
        (error: any) => {
          console.error('API error:', error);
          this.disableBtn = false;
          this.$common.hideLoader();
        }
      );
    } catch (err) {
      console.error('Error:', err?.message || err);
      this.disableBtn = false;
      this.$common.hideLoader();
    }
  }

  resetForm() {
    $("#batchImportModal").modal('hide');
    this.formObj = {};
    this.fileError = '';
    this.clearFileInput(document.getElementById('batchZipFile') as HTMLInputElement);
  }

  private isZipFile(file: File): boolean {
    const fileName = (file?.name || '').toLowerCase();
    const fileType = (file?.type || '').toLowerCase();
    return fileName.endsWith('.zip') || fileType === 'application/zip' || fileType === 'application/x-zip-compressed';
  }

  private clearFileInput(fileInput?: HTMLInputElement | null): void {
    if (fileInput) {
      fileInput.value = '';
    } else {
      $("#batchZipFile").val('');
    }
    this.selectedBatchFile = null;
    this.formObj.batchZipFile = null;
  }



}
