import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { FormStateService } from 'src/app/service/formState.service';
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
    public $formManage: FormManageService,
    private router: Router,
    public $formState: FormStateService,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  filterDataObj
  getState() {
    this.$formManage?.getState(this.codeStatus?.inbox);
    this.$formManage?.formStateList.subscribe(res => {
      if (res) {
        this.dataList = res;
      }
    })
  }

  viewForm(data) {

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?id=${data.formId}`
    );
  }


  moveToDraft(data) {
    
    try {
      console.log(this.userIdDetails);
      let config = {
        headers:{
          "formId": data?.formId,
        }
        // "roleTypeId": this.userIdDetails?.roleTypeId,
        // "status": this.codeStatus?.draft,
        // "unitId": data?.unitId,
        
        // "codeFormId": this.userIdDetails?.formId,
      }
      this.$formState.moveToDraft(config).subscribe(response => {
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter(elem => elem?.formId != data?.formId);
          setTimeout(() => {
            let moduleUrl = this.$auth.getModuleName();
            this.router.navigateByUrl(moduleUrl + `/draft`);
          }, 1000);
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
