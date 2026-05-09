import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { ClaimService } from 'src/app/service/claim.service';
declare var $: any;


@Component({
    selector: 'app-outbox',
    templateUrl: './outbox.component.html',
    styleUrls: ['./outbox.component.css'],
    standalone: false
})
export class OutboxComponent implements OnInit {

  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    public $formManage: FormManageService,
    private $codeSubForm: CodeSubFormService,
    private $claim: ClaimService

  ) {}

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  formObj: any = {};

  noOfPage: any = 10;
  p = 1;
  searchObj;
  toggleFilter:boolean=false;
  filterObj:any={};
  formList;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
    this.getForm();
  }

  filterDataObj;
  getState() {
    this.filterDataObj = {
      formName: this.filterObj?.formName,
      fromDate: new Date(this.filterObj?.fromDate).getTime(),
      toDate: new Date(this.filterObj?.toDate).getTime(),
    };
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.outbox,
      },
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      if (res?.object) {
        this.dataList = Array.isArray(res.object) ? res.object : [];
      }
    });
  }
  getForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.userIdDetails?.formId,
        },
      };
      this.$codeSubForm.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.formList = response?.object;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  viewForm(data) {
    const routeUrl = this.$auth.getApproverWorkflowDetailUrl(
      data,
      data?.claimState || this.codeStatus?.outbox
    );
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
  }

  reset() {
    this.filterObj = {};
    this.getState();
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
   formId;
  viewHistory(formId: any): void {
    
    this.formId = formId; // just set formId
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
  }
  // data shorting start
  key: string = 'occurDate';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}
