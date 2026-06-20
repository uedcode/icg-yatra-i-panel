import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { FormManageService } from 'src/app/service/core/form-manage.service';
import { CodeSubFormApiService } from 'src/app/service/api/code-sub-form/code-sub-form-api.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;


@Component({
    selector: 'app-approver-claim-outbox',
    templateUrl: './claim-outbox.component.html',
    styleUrls: ['./claim-outbox.component.css'],
    standalone: false
})
export class ClaimOutboxComponent implements OnInit {

  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormApiService,
    private router: Router,
    private $formManage: FormManageService,
    private $codeSubForm: CodeSubFormApiService,
    private $claimApi: ClaimApiService, private $claimStateApi: ClaimStateApiService,
    private route: ActivatedRoute

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
  queueModule: 'ADV' | 'CLM' = 'ADV';

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    const routeData = this.route.snapshot?.data || {};
    this.queueModule = routeData['queueModule'] === 'CLM' ? 'CLM' : 'ADV';
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
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.outbox,
        formId: this.resolveQueueFormId(),
      }, codeRoleList),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
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
          formId: this.resolveQueueFormId(),
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
  claimId;
  viewHistory(formId: any, claimId: any = null): void {
    this.formId = formId;
    this.claimId = claimId || null;
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

  private resolveQueueFormId(): string {
    return this.queueModule === 'CLM' ? 'CLM' : 'ADV';
  }
}

