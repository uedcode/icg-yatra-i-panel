import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { ImportExportAuditService } from 'src/app/service/importExportAudit.service';
import * as XLSX from 'xlsx';
declare var $: any;
@Component({
    selector: 'app-excel-import-modal',
    templateUrl: './excel-import-modal.component.html',
    styleUrls: ['./excel-import-modal.component.scss'],
    standalone: false
})
export class ExcelImportModalComponent implements OnInit {

  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    public $importExport: ImportExportAuditService,
  ) { }
  @Output() changeStatusConfirmed = new EventEmitter();
  ngOnInit() {
  }


  formObj: any = {};
  batchList: any = [];
  disableBtn = false;
  uploadExcelFile() {
    try {
      this.disableBtn = true;
      this.$common.showLoader();

      const fileInput = document.getElementById('uploadExcel') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) {
        throw new Error('No file selected.');
      }

      const filename = file.name;
      const config = {
        headers: {
          fileName: filename,
        },
      };

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const excelSheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

          this.$importExport.importBatchStaging(excelSheet, config).subscribe(
            (response: any) => {
              if (response.status === true) {
                this.changeStatusConfirmed.emit(response.object);
                $("#uploadExcel").val('');
                $("#excelImportModal").modal('hide');
              }
              this.$common.hideLoader();
              this.disableBtn = false;
            },
            (error: any) => {
              console.error('API error:', error);
              this.disableBtn = false;
              this.$common.hideLoader();
            }
          );
        } catch (error) {
          console.error('Error processing file:', error);
          this.disableBtn = false;
          this.$common.hideLoader();
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error:', err.message);
      this.$common.hideLoader();
    }
  }

  resetForm() {
    $("#excelImportModal").modal('hide');
    this.formObj = {};
  }



}
