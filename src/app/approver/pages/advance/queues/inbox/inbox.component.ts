import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form/form.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.css'],
    standalone: false
})
export class InboxComponent implements OnInit {
 
  codeStatus: { activate: string; deactivate: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox:string; manualDraft: string; };
  userIdDetails: any;
  roleCodes: any;
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
  queueModule: 'ADV' | 'CLM' = 'ADV';

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.roleCodes = this.$auth.codeRoleType();
    const routeData = this.route.snapshot?.data || {};
    this.queueModule = routeData['queueModule'] === 'CLM' ? 'CLM' : 'ADV';
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
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.inbox,
        formId: this.resolveQueueFormId(),
      }, codeRoleList),
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(data) {
    if (!this.canViewRow(data)) {
      return;
    }
    const routeUrl = this.$auth.getApproverWorkflowDetailUrl(
      data,
      data?.claimState || this.codeStatus?.inbox,
      true
    );
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
  }

  moveToDraft(data: any): void {
    if (!this.canMoveToDraft(data)) {
      return;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'danger');
      return;
    }

    const payload = {
      claimId,
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status: this.codeStatus?.manualDraft || 'MD',
      remark: 'Moved to Draft',
    };

    this.$common.showLoader();
    this.$claim.changeClaimStatusById(payload).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status === true) {
          this.$common.showMessage(response?.message || 'Moved to draft successfully.', 'success');
          this.dataList = this.dataList.filter(
            (item: any) =>
              (item?.yatClaimDTO?.claimId || item?.claimId || item?.formId || item?.id) != claimId
          );
          this.router.navigateByUrl(this.$auth.getModuleName() + '/manual-draft');
          return;
        }
        this.$common.showMessage(response?.message || 'Unable to move request to draft.', 'danger');
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to move request to draft.', 'danger');
      },
    });
  }

  isVerifier1(): boolean {
    return this.userIdDetails?.roleTypeId === this.roleCodes?.verifier1;
  }

  hasClaimState(data: any): boolean {
    const claimState = data?.yatClaimDTO?.claimState || data?.claimState || data?.statusId;
    return !this.$auth.isNullOrEmpty(claimState);
  }

  canViewRow(data: any): boolean {
    return String(data?.viewIndicator || '') === '1' && this.hasClaimState(data);
  }

  canMoveToDraft(data: any): boolean {
    return String(data?.viewIndicator || '') === '1' && !this.hasClaimState(data);
  }

  showDisabledView(data: any): boolean {
    return String(data?.viewIndicator || '') === '0' && this.hasClaimState(data);
  }

  showDisabledMoveToDraft(data: any): boolean {
    return String(data?.viewIndicator || '') === '0' && !this.hasClaimState(data);
  }

  canShowPreviousAdvance(data: any): boolean {
    if (this.queueModule === 'CLM') {
      return false;
    }
    const claim = data?.yatClaimDTO || {};
    const subFormId = String(claim?.codeSubFormDTO?.subFormId || data?.subFormId || '').toUpperCase();
    const refAdvanceId = claim?.refAdvanceId || data?.refAdvanceId;
    return subFormId === 'T' && !this.$auth.isNullOrEmpty(refAdvanceId);
  }

  isClaimQueue(): boolean {
    return this.queueModule === 'CLM';
  }

  canShowViewHistory(data: any): boolean {
    if (!this.isClaimQueue()) {
      return false;
    }
    return !this.$auth.isNullOrEmpty(data?.yatClaimDTO?.initClaimId);
  }

  openPreviousAdvance(data: any): void {
    if (!this.canShowPreviousAdvance(data)) {
      return;
    }

    const claim = data?.yatClaimDTO || {};
    this.formId = null;
    this.claimId = claim?.refAdvanceId || data?.refAdvanceId || null;
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
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
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  private resolveQueueFormId(): string {
    return this.queueModule === 'CLM' ? 'CLM' : 'ADV';
  }
}

