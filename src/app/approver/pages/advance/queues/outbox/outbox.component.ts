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
    private $form: FormApiService,
    private router: Router,
    private $formManage: FormManageService,
    private $codeSubForm: CodeSubFormApiService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
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
  uploadTarget: any = null;
  uploadLoadingMap: { [key: string]: boolean } = {};

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
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.outbox,
        formId: 'ADV',
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
          formId: 'ADV',
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
    const routeUrl = this.buildAdvanceViewUrl(data);
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
  }

  downloadRequisition(data: any): void {
    const url = data?.yatClaimDTO?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Download document is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  canDownloadInkSigned(data: any): boolean {
    const ready = data?.yatClaimDTO?.isReady;
    return this.isVerifier2Role() && (ready === 'RFA' || ready === 'DWA');
  }

  canUploadInkSigned(data: any): boolean {
    const ready = data?.yatClaimDTO?.isReady;
    return this.isVerifier2Role() && ready === 'DWA';
  }

  downloadInkSignedForSign(data: any): void {
    const claimId = this.getClaimId(data);
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.downloadRequisition(data);
    if (data?.yatClaimDTO) {
      data.yatClaimDTO.isReady = 'DWA';
    }
    this.$claimApi
      .fileDownloadedForInkSign({
        headers: {
          claimId: String(claimId),
          isInbox: '0',
          isReady: 'DWA',
          signType: 'true',
        },
      })
      .subscribe();
  }

  triggerInkSignedUpload(data: any, input: HTMLInputElement): void {
    this.uploadTarget = data;
    input.value = '';
    input.click();
  }

  uploadInkSignedFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file || !this.uploadTarget) {
      input.value = '';
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf') {
      this.$common.showMessage('Please upload PDF file only.', 'warning');
      input.value = '';
      return;
    }
    if (file.size > 512 * 1024) {
      this.$common.showMessage('File should not be greater than 512 KB.', 'warning');
      input.value = '';
      return;
    }

    const claimId = this.getClaimId(this.uploadTarget);
    const claimStateId = this.getClaimStateId(this.uploadTarget);
    if (!claimId || !claimStateId) {
      this.$common.showMessage('Claim details are not available for upload.', 'warning');
      input.value = '';
      return;
    }

    const listKey = String(claimId);
    this.uploadLoadingMap[listKey] = true;
    const formData = new FormData();
    formData.append('inkSignedFile', file);
    formData.append('claimId', String(claimId));
    formData.append('claimStateId', String(claimStateId));
    formData.append('financialYear', String(this.userIdDetails?.financialYear || this.uploadTarget?.yatClaimDTO?.financialYear || ''));
    formData.append('roleTypeId', String(this.userIdDetails?.roleTypeId || ''));

    this.$claimApi.uploadInkSignedFile(formData).subscribe({
      next: (res: any) => {
        this.uploadLoadingMap[listKey] = false;
        input.value = '';
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Upload failed.', 'danger');
          return;
        }

        const uploadedClaim = Array.isArray(res?.object) ? res.object[0] : res?.object;
        this.dataList = this.dataList.filter((item: any) => this.getClaimId(item) != claimId);
        this.$common.showMessage(res?.message || 'File uploaded successfully.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
        if (uploadedClaim?.isReady === 'DW') {
          this.changeStatusToUploaded(claimId);
        }
        this.uploadTarget = null;
      },
      error: () => {
        this.uploadLoadingMap[listKey] = false;
        input.value = '';
        this.$common.showMessage('Something went wrong while uploading signed form.', 'danger');
      },
    });
  }

  private changeStatusToUploaded(claimId: any): void {
    this.$claimApi.changeStatusToUploaded({ headers: { claimId: String(claimId) } }).subscribe();
  }

  private isVerifier2Role(): boolean {
    const roles = this.$auth.codeRoleType();
    return this.userIdDetails?.roleTypeId === roles?.verifier2;
  }

  private getClaimId(data: any): any {
    return data?.yatClaimDTO?.claimId;
  }

  private getClaimStateId(data: any): any {
    return data?.claimStateId;
  }

  deletePermanently(data: any): void {
    const claimId = this.getClaimId(data);
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const config = {
      headers: {
        ids: [String(claimId)],
      },
    };
    this.$claimApi.deleteClaim(config).subscribe({
      next: (res: any) => {
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Delete failed.', 'danger');
          return;
        }
        this.dataList = this.dataList.filter(
          (item: any) => this.getClaimId(item) != claimId
        );
        this.$common.showMessage(res?.message || 'Claim deleted successfully.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
      },
      error: () => {
        this.$common.showMessage('Something went wrong while deleting claim.', 'danger');
      },
    });
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

  private buildAdvanceViewUrl(data: any): string {
    const claim = data?.yatClaimDTO;
    const viewUrl = claim?.codeSubFormDTO?.viewUrl;
    const claimId = claim?.claimId;
    if (!viewUrl || !claimId) {
      return '';
    }
    return `${this.$auth.getModuleName()}/${String(viewUrl).replace(/^\/+/, '')}?id=${encodeURIComponent(claimId)}`;
  }
}

