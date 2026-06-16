import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form/form.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { FormStateService } from 'src/app/service/form/formState.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.scss'],
    standalone: false
})
export class InboxComponent implements OnInit {
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
    private $form: FormService,
    public $formManage: FormManageService,
    private router: Router,
    public $formState: FormStateService,
    private $claim: ClaimService,
    private route: ActivatedRoute,
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

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.queueLabel = 'Advance';
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
    this.$claim.getClaimStates(config).subscribe((res: any) => {
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
    const url = data?.yatClaimDTO?.inkSignedFileUrl || data?.yatClaimDTO?.signedFileUrl || data?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Signed form is not available for download.', 'danger');
      return;
    }
    this.$common.download(url);
  }

  canPerformEsign(data: any): boolean {
    return String(data?.yatClaimDTO?.isCreatorEsignAgain || data?.isCreatorEsignAgain || '') === '1';
  }

  canMoveToDraft(data: any): boolean {
    const ready = (data?.yatClaimDTO?.isReady || data?.isReady || '').toString().trim();
    return !ready && String(data?.yatClaimDTO?.isCreatorEsignAgain || data?.isCreatorEsignAgain || '0') === '0';
  }

  canDownloadInkSigned(data: any): boolean {
    const ready = data?.yatClaimDTO?.isReady || data?.isReady;
    return ready === this.codeReadyStatus.readyForDownload || ready === this.codeReadyStatus.downloaded;
  }

  canUploadInkSigned(data: any): boolean {
    return (data?.yatClaimDTO?.isReady || data?.isReady) === this.codeReadyStatus.downloaded;
  }

  getInboxStatusLabel(data: any): string {
    const ready = data?.yatClaimDTO?.isReady || data?.isReady;
    if (ready === this.codeReadyStatus.readyForDownload) {
      return 'Approved.Please download for signature';
    }
    if (ready === this.codeReadyStatus.downloaded) {
      return 'Pending for upload';
    }
    return '-';
  }

  performEsign(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId || data?.id;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const payload = {
      claimId: String(claimId),
      roleTypeId: this.userIdDetails?.roleTypeId,
      userId: this.userIdDetails?.userId,
      status: this.codeStatus?.approved,
      remark: '',
      financialYear: this.userIdDetails?.financialYear,
      moduleId: this.userIdDetails?.moduleId,
    };

    this.$claim.prepareForESign(payload).subscribe({
      next: (res: any) => {
        const responseObject = Array.isArray(res?.object) ? res.object[0] : res?.object;
        const redirectUrl = responseObject?.redirectUrl || responseObject?.url || responseObject?.esignUrl;
        if (!res?.status || !redirectUrl) {
          this.$common.showMessage(res?.message || 'Unable to start eSign.', 'danger');
          return;
        }
        window.location.href = redirectUrl;
      },
      error: () => {
        this.$common.showMessage('Unable to start eSign.', 'danger');
      },
    });
  }

  downloadInkSignedForSign(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId || data?.id;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const config = {
      headers: {
        claimId: String(claimId),
        isInbox: '1',
        isReady: data?.yatClaimDTO?.isReady || data?.isReady || '',
        signType: 'true',
      },
    };

    this.$claim.fileDownloadedForInkSign(config).subscribe({
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

    const claimId = this.uploadTarget?.yatClaimDTO?.claimId || this.uploadTarget?.claimId || this.uploadTarget?.formId || this.uploadTarget?.id;
    const claimStateId = this.uploadTarget?.claimStateId || this.uploadTarget?.yatClaimStateDTO?.claimStateId || this.uploadTarget?.yatClaimStateDTO?.id || this.uploadTarget?.id;
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

    this.$claim.uploadInkSignedFile(formData).subscribe({
      next: (res: any) => {
        this.uploadLoadingMap[listKey] = false;
        input.value = '';
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Upload failed.', 'danger');
          return;
        }

        const uploadedClaim = Array.isArray(res?.object) ? res.object[0] : res?.object;
        this.dataList = this.dataList.filter(
          (item: any) => (item?.yatClaimDTO?.claimId || item?.claimId || item?.formId || item?.id) != claimId
        );
        this.$common.showMessage(res?.message || 'File uploaded successfully.', 'success');
        this.$claim.notifyStatusCountRefresh();
        if (uploadedClaim?.isReady === 'DW') {
          this.$claim.changeStatusToUploaded({ headers: { claimId: String(claimId) } }).subscribe();
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
    const claimId = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId || data?.id;
    if (!claimId) {
      this.$common.showMessage('Unable to identify request for delete.', 'danger');
      return;
    }
    const config = { headers: { ids: [claimId] } };
    this.$claim.deleteClaim(config).subscribe((response: any) => {
      if (response?.status === true) {
        this.$common.showMessage(`${response.message}`);
        this.dataList = this.dataList.filter(
          (elem: any) => (elem?.yatClaimDTO?.claimId || elem?.claimId || elem?.formId || elem?.id) !== claimId
        );
        this.$claim.notifyStatusCountRefresh();
      }
    });
  }

  private getCreatorClaimRoute(subFormId: string | null, detail = false): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'PMTA' || id === 'PMT' || id === 'PMTCLM') return detail ? 'preview-pmt-duty-claim' : 'form-pmt-duty-claim';
    if (id === 'TYA' || id === 'TY' || id === 'TYD' || id === 'TYCLM') return detail ? 'preview-ty-duty-claim' : 'form-ty-duty-claim';
    if (id === 'FTEA' || id === 'FTE' || id === 'FTECLM') return detail ? 'preview-fte-claim' : 'form-fte-claim';
    if (id === 'LTCA' || id === 'LTC' || id === 'LTCCLM') return detail ? 'preview-ltc-claim' : 'form-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return detail ? 'preview-resettlement-claim' : 'form-resettlement-claim';
    if (id === 'P') return detail ? 'form-pmt-detail' : 'form-pmt';
    if (id === 'T') return detail ? 'preview-ty-duty' : 'form-tyduty';
    if (id === 'F') return detail ? 'form-fte-detail' : 'form-fte';
    if (id === 'L') return detail ? 'form-ltc-detail' : 'form-ltc';
    if (id === 'M') return detail ? 'form-manual-adv-detail' : 'form-manual-adv';
    return null;
  }

  viewForm(data) {
    const payId = data?.yatPayDetailsDTO?.id || data?.id;
    if (payId && (data?.yatPayDetailsDTO || data?.viewUrl === 'form-pay-details' || data?.formUrl === 'form-pay-details')) {
      this.router.navigateByUrl(this.$auth.getModuleName() + `/form-pay-details?id=${payId}`);
      return;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    const subFormId =
      claim?.codeSubFormDTO?.subFormId ||
      data?.subFormId ||
      data?.codeSubFormDTO?.subFormId;
    const route = this.getCreatorClaimRoute(subFormId, false);

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() +
          `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(moduleUrl + `/${data?.viewUrl}?id=${data.formId}`);
  }

  moveToDraft(data) {
    try {
      const claim = data?.yatClaimDTO || {};
      const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
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

        this.$claim.changeClaimStatusById(payload).subscribe(
          (response: any) => {
            if (response.status === true) {
              this.$common.showMessage(`${response.message}`);
              this.dataList = this.dataList.filter(
                (elem: any) =>
                  (elem?.yatClaimDTO?.claimId || elem?.formId || elem?.id) != claimId
              );
              this.$claim.notifyStatusCountRefresh();
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


