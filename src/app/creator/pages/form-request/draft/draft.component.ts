import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
declare var $: any;

@Component({
    selector: 'app-draft',
    templateUrl: './draft.component.html',
    styleUrls: ['./draft.component.scss'],
    standalone: false
})
export class DraftComponent implements OnInit {
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    public $formManage: FormManageService,

  ) { }

  @Input() dataList: Array<any> = [];
  // @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  formObj: any = {};
  rowId: any;
  noOfPage: any = 10;
  p = 1;
  searchObj;


  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  filterDataObj
  getState() {
    this.$formManage?.getState(this.codeStatus?.draft);
    this.$formManage?.formStateList.subscribe((res) => {
      if (res) {
        this.dataList = res;
      }
    });
  }

  deleteRow(id) {
    let config = {
      headers: {
        ids: id,
      },
    };

    this.$form.delete(config).subscribe(
      (response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter((elem) => elem.formId != id);
        }
        $('#delete_modal').modal('hide');
      },
      (err) => {
        this.$common.hideLoader();
      }
    );

  }

  reset() {
    this.formObj = {};
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  // data shorting start
  key: string = 'updatedOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  actionPage(data) {
    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl +
      `/${data?.formUrl}?id=${data.formId}&subFormId=${data.subFormId}`
    );
  }
}
