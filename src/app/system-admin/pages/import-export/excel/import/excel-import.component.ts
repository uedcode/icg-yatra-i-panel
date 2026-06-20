import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonService } from 'src/app/service/core/common.service';
import { ImportExportApiService } from 'src/app/service/api/import-export/import-export-api.service';
import { finalize } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-sys-admin-excel-import',
  templateUrl: './excel-import.component.html',
  standalone: false
})
export class SysAdminExcelImportComponent {
  excelObj: any = {
    name: 'Name',
    userName: 'User Name',
    employeeId: 'Employee ID',
    esignId: 'E-Sign ID',
    mobileNo: 'Mobile Number',
    emailId: 'Email ID',
    kycId: 'KYC ID',
  };
  excelFile: File | null = null;
  excelList: any[] = [];
  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  submitBtn = false;
  fileError = '';

  constructor(private $common: CommonService, private $excelImport: ImportExportApiService) {}

  openExcelModal() {
    this.resetFileSelection();
    $('#sysAdminExcelImportModal').modal('show');
  }

  onFileChange(event: any) {
    const input = event?.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    this.excelFile = file;
    this.fileError = '';

    if (!file) {
      return;
    }

    if (!this.isExcelFile(file)) {
      this.fileError = 'Please choose Excel file only.';
      this.$common.showMessage(this.fileError, 'danger');
      this.excelFile = null;
      input.value = '';
    }
  }

  uploadExcelFile() {
    if (!this.excelFile) {
      this.fileError = 'Please choose Excel file.';
      this.$common.showMessage(this.fileError, 'danger');
      return;
    }
    if (!this.isExcelFile(this.excelFile)) {
      this.fileError = 'Please choose Excel file only.';
      this.$common.showMessage(this.fileError, 'danger');
      return;
    }
    this.submitBtn = true;
    this.$common.showLoader();

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);
        const payload = rows.map(row => this.mapExcelRow(row));

        this.$excelImport.importExcel(payload).pipe(
          finalize(() => {
            this.submitBtn = false;
            this.$common.hideLoader();
          })
        ).subscribe((response: any) => {
          if (response.status === true) {
            this.excelList = response.object || [];
            this.resetFileSelection();
            $('#sysAdminExcelImportModal').modal('hide');
          }
        });
      } catch (error) {
        console.error(error);
        this.submitBtn = false;
        this.$common.hideLoader();
        this.$common.showMessage('Unable to read Excel file.', 'danger');
      }
    };
    reader.onerror = () => {
      this.submitBtn = false;
      this.$common.hideLoader();
      this.$common.showMessage('Unable to read Excel file.', 'danger');
    };
    reader.readAsArrayBuffer(this.excelFile);
  }

  private isExcelFile(file: File): boolean {
    const fileName = (file?.name || '').toLowerCase();
    const fileType = (file?.type || '').toLowerCase();
    return (
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.csv') ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'text/csv'
    );
  }

  private mapExcelRow(row: any) {
    return {
      userName: row[this.excelObj.userName],
      name: row[this.excelObj.name],
      employeeId: row[this.excelObj.employeeId],
      esignId: row[this.excelObj.esignId],
      mobileNo: row[this.excelObj.mobileNo],
      emailId: row[this.excelObj.emailId],
      kycId: row[this.excelObj.kycId],
    };
  }

  private resetFileSelection() {
    this.excelFile = null;
    this.fileError = '';
    const input = document.getElementById('sysAdminExcelFile') as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }
}
