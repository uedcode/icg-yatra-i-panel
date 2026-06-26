import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
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
    private router: Router,
    private $claimStateApi: ClaimStateApiService,
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
    this.roleCodes = this.$auth.codeRoleType();
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
        isArchive: '0',
        formId: 'ADV',
      }, codeRoleList),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(data) {
    // if (!this.canViewRow(data)) {
    //   return;
    // }
    const routeUrl = this.buildAdvanceFormUrl(data);
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
  }

  moveToDraft(data: any): void {
    if (!this.canMoveToDraft(data)) {
      return;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId;
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
    this.$claimStateApi.changeStatusById(payload).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status === true) {
          this.$common.showMessage(response?.message || 'Moved to draft successfully.', 'success');
          this.dataList = this.dataList.filter(
            (item: any) => item?.yatClaimDTO?.claimId != claimId
          );
          this.$claimStateApi.notifyStatusCountRefresh();
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
    const claimState = data?.yatClaimDTO?.claimState;
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
    const claim = data?.yatClaimDTO || {};
    const subFormId = String(claim?.codeSubFormDTO?.subFormId || '').toUpperCase();
    const refAdvanceId = claim?.refAdvanceId;
    return subFormId === 'T' && !this.$auth.isNullOrEmpty(refAdvanceId);
  }

  openPreviousAdvance(data: any): void {
    if (!this.canShowPreviousAdvance(data)) {
      return;
    }

    const claim = data?.yatClaimDTO || {};
    this.formId = null;
    this.claimId = claim?.refAdvanceId || null;
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

  private buildAdvanceFormUrl(data: any): string {
    const claim = data?.yatClaimDTO;
    const formUrl = claim?.codeSubFormDTO?.formUrl;
    const claimId = claim?.claimId;
    if (!formUrl || !claimId) {
      return '';
    }
    return `${this.$auth.getModuleName()}/${String(formUrl).replace(/^\/+/, '')}?id=${encodeURIComponent(claimId)}`;
  }
}
