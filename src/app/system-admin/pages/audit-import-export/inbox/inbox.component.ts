import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { ImportExportAuditService } from 'src/app/service/importExportAudit.service';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.scss'],
    standalone: false
})
export class InboxComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    public $importExport: ImportExportAuditService,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;
  id: any;
  pageType: any;
  config: any;
  formObj: any = {};
  // ...
  noOfPage: number = 10;
  p: number = 1;
  searchObj: string = '';
  allAdminForm: any = [];
  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();

    this.getAdminForms();
  }

   // Derived, filtered list (used by template)
  get filteredAdminForm(): any[] {
    const q = (this.searchObj || '').toString().trim().toLowerCase();
    if (!q) return this.allAdminForm || [];

    return (this.allAdminForm || []).filter(x => {
      const vals = [
        x?.codeProcessDTO?.process,
        x?.formNo,
        x?.formName,
        x?.formUnitDTO?.descr,
        x?.sysAdminFormDate
      ].map(v => (v ?? '').toString().toLowerCase());

      return vals.some(v => v.includes(q));
    });
  }
  
  getAdminForms() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      this.$importExport.getAdminForms(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status == true) {
            this.allAdminForm = response.object;
          }
        }, err => {
          this.$common.hideLoader();
        })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  exportType;
  exportAudit(exportType) {
    this.exportType = exportType;
    $('#exportChangeStatusModal').modal('show');
  }

  createExportFinally(exportType) {
    if (exportType == "Selected") {
      this.createAuditExport();
    } else if (exportType == "All") {
      this.createExportAuditAll();
    }
  }
  submitBtn = false;
  createAuditExport() {
    try {
      
      let procIds = [];
      this.allAdminForm.map(element => {
        if (element.checked) {
          procIds.push(element.procID)
        }
      });
      if (procIds.length == 0) {
        return this.$common.showMessage("Please select at least one record to export.", 'danger');
      }
      this.$common.showLoader();
      this.downloadForms(procIds);
    } catch (err) {
      this.submitBtn = false;
      this.$common.hideLoader();
      console.log(err.message);
    }
  }

  downloadForms(procIds) {
    try {
      this.$common.showLoader();
      
      var config = {
        headers: {
          "procIds": procIds,
          "codeProcessId": "PC",
          "type": "EX"
        }
      }
      // if (codeProcessId) {
      //   config.headers.codeProcessId = codeProcessId;
      // }
      this.$importExport.createExport(config).subscribe((response: any) => {
        if (response.status === true) {
          this.handleExportCreation(response.object, procIds);
        }
      })
    } catch (err) {
      this.$common.hideLoader();
      console.log(err.message);
    }

  }
  handleExportCreation(exportObjects, procIds = []) {
    const createdExport = exportObjects?.[0];
    if (!createdExport?.importExportId) {
      this.$common.hideLoader();
      return;
    }
    this.downloadExportBatch(createdExport.importExportId, 1, procIds);
  }

  downloadExportBatch(importExportId, firstTimeIndicator = 0, procIds) {
    try {

      this.$common.showLoader();
      let config = {
        headers: {
          "importExportId": importExportId,
          "type": "EX"
        }
      }
      this.$importExport.downloadExportBatch(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          
          if (response.status == true) {
            let object = response.object;
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
            var responseObject = object[0];
            this.$importExport.downloadBatchFromResponse(responseObject);

            this.$common.hideLoader();
          }
        }, err => {
          this.$common.hideLoader();
        })
    } catch (error) {
      this.submitBtn = false;
      this.$common.hideLoader();
      console.log(error);
    }
  }

  createExportAuditAll() {
    try {
      if (this.allAdminForm.length == 0) {
        this.$common.hideLoader();
        return this.$common.showMessage("No Form to Export.", 'danger');
      }
      this.$common.showLoader();
      var config = {
        headers: {
          "type": "EX"
        }
      }
      // if (!$rootScope.isNullOrEmpty(this.codeProcessId)) {
      //   config.headers.codeProcessId = this.codeProcessId;
      // }
      this.$importExport.createExportAll(config).subscribe((response: any) => {
        if (response.status == true) {
          this.handleExportCreation(response.object);
        }
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.submitBtn = false;
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
