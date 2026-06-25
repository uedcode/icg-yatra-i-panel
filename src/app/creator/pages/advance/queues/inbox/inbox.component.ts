import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { Subscription } from 'rxjs';
import { ESignFlowService } from 'src/app/service/core/esign-flow.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.scss'],
    standalone: false
})
export class InboxComponent implements OnInit, OnDestroy {
  readonly codeReadyStatus = {
    readyForDownload: 'RFD',
    downloaded: 'DW',
  } as const;

  codeStatus: { activate: string; deactivate: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private router: Router,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private route: ActivatedRoute,
    private eSignFlow: ESignFlowService,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  filterObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  toggleFilter: any = false;
  readonly moduleType: 'ADV' = 'ADV';
  queueLabel = 'Advance';
  uploadTarget: any = null;
  uploadLoadingMap: { [key: string]: boolean } = {};
  eSignTempFormObj: any = null;
  private eSignFeedbackSubscription?: Subscription;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.queueLabel = 'Advance';
    this.eSignFeedbackSubscription = this.eSignFlow.handleEsignFeedback(this.route);
    this.getState();
  }

  filterDataObj
  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const formId = this.moduleType;
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.inbox,
        formId,
        isArchive: '0',
        searchFormId: searchHeaders.formId,
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      }, codeRoleList),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  private getLegacySearchHeaders(): { formId: string; pno: string; searchedName: string } {
    const formId = (this.filterObj?.formId || '').toString().trim();
    const pno = (this.filterObj?.pno || '').toString().trim();
    const searchedName = (this.filterObj?.searchedName || '').toString().trim();
    if (formId || pno || searchedName) {
      return { formId, pno, searchedName };
    }

    const raw = (this.searchObj || '').toString().trim();
    if (!raw) {
      return { formId: '', pno: '', searchedName: '' };
    }
    if (/^\d+$/.test(raw)) {
      return { formId: raw, pno: raw, searchedName: '' };
    }
    if (/^[A-Za-z0-9/-]+$/.test(raw)) {
      return { formId: '', pno: raw, searchedName: '' };
    }
    return { formId: '', pno: '', searchedName: raw };
  }

  applyServerSearch(): void {
    this.p = 1;
    this.getState();
  }

  onSearchInput(): void {
    if (!(this.searchObj || '').toString().trim()) {
      this.applyServerSearch();
    }
  }

  resetAdvancedFilters(): void {
    this.filterObj = {};
    this.applyServerSearch();
  }

  downloadForInkSign(data: any): void {
    const url = data?.yatClaimDTO?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Signed form is not available for download.', 'danger');
      return;
    }
    this.$common.download(url);
  }

  canPerformEsign(data: any): boolean {
    return String(data?.yatClaimDTO?.isCreatorEsignAgain || '') === '1';
  }

  canMoveToDraft(data: any): boolean {
    const ready = (data?.yatClaimDTO?.isReady || '').toString().trim();
    return !ready && String(data?.yatClaimDTO?.isCreatorEsignAgain || '0') === '0';
  }

  canDownloadInkSigned(data: any): boolean {
    const ready = data?.yatClaimDTO?.isReady;
    return ready === this.codeReadyStatus.readyForDownload || ready === this.codeReadyStatus.downloaded;
  }

  canUploadInkSigned(data: any): boolean {
    return data?.yatClaimDTO?.isReady === this.codeReadyStatus.downloaded;
  }

  getInboxStatusLabel(data: any): string {
    const ready = data?.yatClaimDTO?.isReady;
    if (ready === this.codeReadyStatus.readyForDownload) {
      return 'Approved.Please download for signature';
    }
    if (ready === this.codeReadyStatus.downloaded) {
      return 'Pending for upload';
    }
    return '-';
  }

  performEsign(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.eSignTempFormObj = {
      id: String(claimId),
      claimId: String(claimId),
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status: this.codeStatus?.approved,
      remark: '',
      financialYear: this.userIdDetails?.financialYear,
      moduleId: this.userIdDetails?.moduleId,
    };
  }

  downloadInkSignedForSign(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const config = {
      headers: {
        claimId: String(claimId),
        isInbox: '1',
        isReady: data?.yatClaimDTO?.isReady || '',
        signType: 'true',
      },
    };

    this.$claimApi.fileDownloadedForInkSign(config).subscribe({
      next: (res: any) => {
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Download failed.', 'danger');
          return;
        }

        const responseObject = Array.isArray(res?.object) ? res.object[0] : res?.object;
        const fileUrl = responseObject?.inkSignedFileUrl;
        if (fileUrl) {
          this.$common.download(fileUrl);
        }
        if (data?.yatClaimDTO) {
          data.yatClaimDTO.isReady = responseObject?.isReady || 'DW';
          if (fileUrl) {
            data.yatClaimDTO.inkSignedFileUrl = fileUrl;
          }
        }
        this.$common.showMessage(res?.message || 'Downloaded successfully.', 'success');
      },
      error: () => {
        this.$common.showMessage('Something went wrong while downloading signed form.', 'danger');
      },
    });
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

    const claimId = this.uploadTarget?.yatClaimDTO?.claimId;
    const claimStateId = this.uploadTarget?.claimStateId;
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
        this.dataList = this.dataList.filter(
          (item: any) => item?.yatClaimDTO?.claimId != claimId
        );
        this.$common.showMessage(res?.message || 'File uploaded successfully.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
        if (uploadedClaim?.isReady === 'DW') {
          this.$claimApi.changeStatusToUploaded({ headers: { claimId: String(claimId) } }).subscribe();
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

  deletePermanently(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Unable to identify request for delete.', 'danger');
      return;
    }
    const config = { headers: { ids: [claimId] } };
    this.$claimApi.deleteClaim(config).subscribe((response: any) => {
      if (response?.status === true) {
        this.$common.showMessage(`${response.message}`);
        this.dataList = this.dataList.filter(
          (elem: any) => elem?.yatClaimDTO?.claimId !== claimId
        );
        this.$claimStateApi.notifyStatusCountRefresh();
      }
    });
  }

  viewForm(data) {
    const claim = data?.yatClaimDTO;
    const claimId = claim?.claimId;
    const route = claim?.codeSubFormDTO?.formUrl;

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${route}?id=${claimId}`
      );
    }
  }

  moveToDraft(data) {
    try {
      const claim = data?.yatClaimDTO;
      const claimId = claim?.claimId;
      if (claimId) {
        const payload = {
          claimId: String(claimId),
          roleTypeId: this.userIdDetails?.roleTypeId,
          userId: this.userIdDetails?.userId,
          status: this.codeStatus?.draft,
          remark: '',
          financialYear: this.userIdDetails?.financialYear,
          moduleId: this.userIdDetails?.moduleId,
        };

        this.$claimStateApi.changeStatusById(payload).subscribe(
          (response: any) => {
            if (response.status === true) {
              this.$common.showMessage(`${response.message}`);
              this.dataList = this.dataList.filter(
                (elem: any) => elem?.yatClaimDTO?.claimId != claimId
              );
              this.$claimStateApi.notifyStatusCountRefresh();
              setTimeout(() => {
                let moduleUrl = this.$auth.getModuleName();
                this.router.navigateByUrl(moduleUrl + `/draft`);
              }, 1000);
            }
          },
          () => {
            this.$common.hideLoader();
          }
        );
        return;
      }

      this.$common.showMessage('Unable to identify request for move to draft.', 'danger');
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

  ngOnDestroy(): void {
    this.eSignFeedbackSubscription?.unsubscribe();
  }

}


