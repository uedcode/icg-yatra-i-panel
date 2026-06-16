import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-claim-not-passed',
    templateUrl: './claim-not-passed.component.html',
    styleUrls: ['./claim-not-passed.component.scss'],
    standalone: false
})
export class ClaimNotPassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; notPassed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $formManage: FormManageService,
    private $claim: ClaimService,
    private router: Router,
  ) { }

  @Input() dataList: Array<any> = [];

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  resubmitLoadingMap: { [key: string]: boolean } = {};
  archiveLoadingMap: { [key: string]: boolean } = {};
  readonly moduleType: 'CLM' = 'CLM';
  claimObservations: any[] = [];

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
this.getState();
  }
filterDataObj;
  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const formId = this.moduleType;
    const config = {
      headers: buildLegacyClaimStateHeaders({
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
        claimState: this.codeStatus?.notPassed,
        isArchive: '0',
        formId,
        searchFormId: searchHeaders.formId,
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      }),
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
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

  private getCreatorClaimRoute(subFormId: string | null, detail = false): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'PMTA' || id === 'PMT' || id === 'PMTCLM') return detail ? 'preview-pmt-duty-claim' : 'form-pmt-duty-claim';
    if (id === 'TYA' || id === 'TY' || id === 'TYD' || id === 'TYCLM') return detail ? 'preview-ty-duty-claim' : 'form-ty-duty-claim';
    if (id === 'FTEA' || id === 'FTE' || id === 'FTECLM') return detail ? 'preview-fte-claim' : 'form-fte-claim';
    if (id === 'LTCA' || id === 'LTC' || id === 'LTCCLM') return detail ? 'preview-ltc-claim' : 'form-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return detail ? 'preview-resettlement-claim' : 'form-resettlement-claim';
    if (id === 'P') return detail ? 'form-pmt-detail' : 'form-pmt';
    if (id === 'T') return detail ? 'form-tyduty-detail' : 'form-tyduty';
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
    const route = this.getCreatorClaimRoute(subFormId, true);

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() +
          `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    const legacyViewUrl =
      claim?.codeSubFormDTO?.viewUrl ||
      data?.viewUrl ||
      data?.formUrl;
    if (claimId && legacyViewUrl) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${legacyViewUrl}?id=${claimId}`
      );
      return;
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

  formId;
  claimId;
  viewHistory(formId: any, claimId: any = null): void {
    this.formId = formId;
    this.claimId = claimId || null;
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
  }

  /*
  resubmitForm(data: any) {
  if (!data?.formId) return;

  // prevent double click
  if (this.resubmitLoadingMap[data.formId]) return;
  this.resubmitLoadingMap[data.formId] = true;

  this.config = {
    headers: {
      id: data.formId,
      userId:this.userIdDetails?.userId || '',
      roleId:this.userIdDetails?.roleId || '',
      desigId:this.userIdDetails.desigId || '',
      unitId:this.userIdDetails.unitId || '',
    },
  };
 
  this.$form.resubmit(this.config).subscribe({
    next: (res: any) => {
      this.resubmitLoadingMap[data.formId] = false;

      if (res?.status && res?.object?.length) {
        const newForm = res.object[0];

        // Option-1: open new form in edit/view page
        // If backend returns new id: newForm.id
        let moduleUrl = this.$auth.getModuleName();

        // aapke project me viewUrl is list item ka hota hai, but resubmit ke baad
        // normally edit form page open karna better hota hai.
        // If you have editUrl return from backend, use that. Else reuse existing viewUrl.
        const redirectUrl = data?.formUrl;

        if (redirectUrl) {
          this.router.navigateByUrl(
            moduleUrl + `/${redirectUrl}?id=${newForm.id}`
          );
        } else {
          // fallback: just reload list
          this.getState();
        }

        // Optional toast
        this.$common?.showMessage?.('Form resubmitted successfully.');
      } else {
        this.$common?.showMessage?.(res?.message || 'Resubmit failed.');
      }
    },
    error: (err) => {
      this.resubmitLoadingMap[data.formId] = false;
      this.$common?.showMessage?.('Something went wrong while resubmitting.');
      console.error(err);
    },
  });
}
  */

  resubmitClaim(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId;
    if (!claimId || this.resubmitLoadingMap[claimId]) {
      return;
    }

    this.resubmitLoadingMap[claimId] = true;

    this.$claim.cloneClaim({ headers: { claimId: String(claimId) } }).subscribe({
      next: (cloneRes: any) => {
        const clonedClaim = Array.isArray(cloneRes?.object) ? cloneRes.object[0] : cloneRes?.object;
        const clonedClaimId = clonedClaim?.claimId;
        if (!cloneRes?.status || !clonedClaimId) {
          this.resubmitLoadingMap[claimId] = false;
          this.$common.showMessage(cloneRes?.message || 'Unable to resubmit claim.', 'danger');
          return;
        }

        const payload = {
          claimId: String(clonedClaimId),
          roleTypeId: this.userIdDetails?.roleTypeId,
          userId: this.userIdDetails?.userId,
          status: this.codeStatus?.draft,
          remark: '',
          financialYear: this.userIdDetails?.financialYear,
          moduleId: this.userIdDetails?.moduleId,
        };

        this.$claim.changeClaimStatusById(payload).subscribe({
          next: (statusRes: any) => {
            this.resubmitLoadingMap[claimId] = false;
            if (!statusRes?.status) {
              this.$common.showMessage(statusRes?.message || 'Unable to move resubmitted claim to draft.', 'danger');
              return;
            }

            this.dataList = this.dataList.filter(
              (elem: any) =>
                (elem?.yatClaimDTO?.claimId || elem?.claimId || elem?.formId) != claimId
            );
            this.$common.showMessage(statusRes?.message || 'Claim resubmitted successfully.', 'success');
            this.$claim.notifyStatusCountRefresh();
            setTimeout(() => {
              this.router.navigateByUrl(this.$auth.getModuleName() + '/draft-claim');
            }, 1000);
          },
          error: () => {
            this.resubmitLoadingMap[claimId] = false;
            this.$common.showMessage('Unable to move resubmitted claim to draft.', 'danger');
          },
        });
      },
      error: () => {
        this.resubmitLoadingMap[claimId] = false;
        this.$common.showMessage('Unable to clone claim for resubmit.', 'danger');
      },
    });
  }

  archiveClaim(data: any): void {
    const claimStateId =
      data?.claimStateId ||
      data?.yatClaimStateDTO?.claimStateId ||
      data?.yatClaimStateDTO?.id ||
      data?.id;
    const listKey = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId || claimStateId;

    if (!claimStateId || this.archiveLoadingMap[listKey]) {
      return;
    }

    this.archiveLoadingMap[listKey] = true;
    const config = {
      headers: {
        ids: [String(claimStateId)],
        isArchive: '1',
      },
    };

    this.$claim.changeClaimStatusArchive(config).subscribe({
      next: (res: any) => {
        this.archiveLoadingMap[listKey] = false;
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Archive failed.', 'danger');
          return;
        }

        this.dataList = this.dataList.filter(
          (item: any) =>
            (item?.claimStateId ||
              item?.yatClaimStateDTO?.claimStateId ||
              item?.yatClaimStateDTO?.id ||
              item?.id) != claimStateId
        );
        this.$claim.notifyStatusCountRefresh();
        this.$common.showMessage(res?.message || 'Claim archived successfully.', 'success');
      },
      error: () => {
        this.archiveLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while archiving claim.', 'danger');
      },
    });
  }

  downloadSignedForm(data: any): void {
    const url =
      data?.yatClaimDTO?.inkSignedFileUrl ||
      data?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Signed form is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  hasSignedForm(data: any): boolean {
    return !!(data?.yatClaimDTO?.inkSignedFileUrl || data?.inkSignedFileUrl);
  }

  loadClaimObservations(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.claimObservations = [];
    this.$claim.getClaimObservations({ headers: { claimId: String(claimId) } }).subscribe({
      next: (res: any) => {
        this.claimObservations = Array.isArray(res?.object) ? res.object : [];
        setTimeout(() => $('#claimObservationModal').modal('show'), 0);
      },
      error: () => {
        this.$common.showMessage('Unable to load claim observations.', 'danger');
      },
    });
  }

}


