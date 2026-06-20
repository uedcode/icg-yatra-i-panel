import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-claim-inbox',
    templateUrl: './claim-inbox.component.html',
    styleUrls: ['./claim-inbox.component.scss'],
    standalone: false
})
export class ClaimInboxComponent implements OnInit {
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
    private route: ActivatedRoute,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService
  ) { }

  @Input() dataList: Array<any> = [];

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  readonly moduleType: 'CLM' = 'CLM';
  uploadTarget: any = null;
  uploadLoadingMap: { [key: string]: boolean } = {};

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

  moveToDraft(data: any): void {
    const claimId = this.getClaimId(data);
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const payload = {
      claimId: String(claimId),
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status: this.codeStatus?.draft,
      remark: '',
      financialYear: this.userIdDetails?.financialYear,
      moduleId: this.userIdDetails?.moduleId,
    };

    this.$claimStateApi.changeStatusById(payload).subscribe({
      next: (response: any) => {
        if (!response?.status) {
          this.$common.showMessage(response?.message || 'Unable to move claim to draft.', 'danger');
          return;
        }

        this.$common.showMessage(response?.message || 'Claim moved to draft successfully.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
        this.dataList = this.dataList.filter((elem: any) => this.getClaimId(elem) != claimId);
        setTimeout(() => {
          this.router.navigateByUrl(this.$auth.getModuleName() + '/draft-claim');
        }, 1000);
      },
      error: () => {
        this.$common.showMessage('Unable to move claim to draft.', 'danger');
      },
    });
  }

  editClaim(data: any): void {
    const claimId = this.getClaimId(data);
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.$claimApi.editClaim({ headers: { id: claimId } }).subscribe({
      next: (response: any) => {
        if (!response?.status) {
          this.$common.showMessage(response?.message || 'Unable to edit claim.', 'danger');
          return;
        }

        this.$common.showMessage(response?.message || 'Claim moved to draft for editing.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
        this.dataList = this.dataList.filter((elem: any) => this.getClaimId(elem) != claimId);
      },
      error: () => {
        this.$common.showMessage('Unable to edit claim.', 'danger');
      },
    });
  }

  downloadRequisition(data: any): void {
    const url = data?.yatClaimDTO?.inkSignedFileUrl || data?.yatClaimDTO?.signedFileUrl;
    if (!url) {
      this.$common.showMessage('Download document is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  canDownloadInkSigned(data: any): boolean {
    const ready = data?.yatClaimDTO?.isReady;
    return ready === this.codeReadyStatus.readyForDownload || ready === this.codeReadyStatus.downloaded;
  }

  canUploadInkSigned(data: any): boolean {
    return data?.yatClaimDTO?.isReady === this.codeReadyStatus.downloaded;
  }

  canMoveToDraft(data: any): boolean {
    const ready = (data?.yatClaimDTO?.isReady || '').toString().trim();
    return !ready;
  }

  canEditClaim(data: any): boolean {
    return data?.yatClaimDTO?.isDeputation === '-1';
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

  downloadInkSignedForSign(data: any): void {
    const claimId = this.getClaimId(data);
    const isReady = data?.yatClaimDTO?.isReady || '';
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const config = {
      headers: {
        claimId: String(claimId),
        isInbox: '1',
        isReady: String(isReady),
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
        const fileUrl = responseObject?.inkSignedFileUrl || data?.yatClaimDTO?.inkSignedFileUrl;
        if (fileUrl) {
          this.$common.download(fileUrl);
        }
        if (data?.yatClaimDTO) {
          data.yatClaimDTO.isReady = responseObject?.isReady || 'DW';
          data.yatClaimDTO.inkSignedFileUrl = fileUrl || data.yatClaimDTO.inkSignedFileUrl;
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

  private getClaimId(data: any): any {
    return data?.yatClaimDTO?.claimId;
  }

  private getClaimStateId(data: any): any {
    return data?.claimStateId;
  }

  deletePermanently(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const config = {
      headers: {
        ids: [claimId],
        isApproved: '0',
      },
    };
    this.$claimApi.deleteClaim(config).subscribe({
      next: (res: any) => {
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Delete failed.', 'danger');
          return;
        }
        this.dataList = this.dataList.filter((item: any) => item?.yatClaimDTO?.claimId != claimId);
        this.$common.showMessage(res?.message || 'Claim deleted successfully.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
      },
      error: () => {
        this.$common.showMessage('Something went wrong while deleting claim.', 'danger');
      },
    });
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

}



