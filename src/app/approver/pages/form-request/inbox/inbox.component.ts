import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { ClaimService } from 'src/app/service/claim.service';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.css'],
    standalone: false
})
export class InboxComponent implements OnInit {
 
  codeStatus: { activate: string; deactivate: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox:string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    public $formManage: FormManageService,
    private router: Router,
    private $claim: ClaimService,
    private route: ActivatedRoute
  ) {}

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
    this.handleEsignFeedback();
    this.getState();
  }

  private handleEsignFeedback(): void {
    this.route.queryParamMap.subscribe((params) => {
      const status = params.get('esignStatus');
      const txnId = params.get('txnId');
      if (!status) {
        return;
      }

      if (status === 'SC') {
        this.$common.showMessage(
          txnId
            ? `eSign completed successfully. Transaction ID: ${txnId}`
            : 'eSign completed successfully.',
          'success'
        );
      } else if (status === 'US' || status === 'ER') {
        this.$common.showMessage(
          txnId
            ? `eSign could not be completed. Transaction ID: ${txnId}`
            : 'eSign could not be completed.',
          'danger'
        );
      } else {
        this.$common.showMessage(
          txnId
            ? `eSign status is being processed. Transaction ID: ${txnId}`
            : 'eSign status is being processed.',
          'info'
        );
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { esignStatus: null, txnId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  filterDataObj;
  getState() {
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.inbox,
      },
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(data) {
    const routeUrl = this.$auth.getApproverWorkflowDetailUrl(
      data,
      data?.claimState || this.codeStatus?.inbox,
      true
    );
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
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
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  
}
