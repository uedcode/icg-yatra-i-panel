import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { ClaimObservationApiService } from 'src/app/service/api/claim/claim-observation-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-claim-not-passed',
    templateUrl: './claim-not-passed.component.html',
    styleUrls: ['./claim-not-passed.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ClaimNotPassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; notPassed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $claimObservationApi: ClaimObservationApiService,
    private router: Router
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

  viewForm(data) {
    const claim = data?.yatClaimDTO;
    const claimId = claim?.claimId;
    const legacyViewUrl = claim?.codeSubFormDTO?.viewUrl;
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

  resubmitClaim(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId || this.resubmitLoadingMap[claimId]) {
      return;
    }

    this.resubmitLoadingMap[claimId] = true;

    this.$claimApi.cloneClaim({ headers: { claimId: String(claimId) } }).subscribe({
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

        this.$claimStateApi.changeStatusById(payload).subscribe({
          next: (statusRes: any) => {
            this.resubmitLoadingMap[claimId] = false;
            if (!statusRes?.status) {
              this.$common.showMessage(statusRes?.message || 'Unable to move resubmitted claim to draft.', 'danger');
              return;
            }

            this.dataList = this.dataList.filter((elem: any) => elem?.yatClaimDTO?.claimId != claimId);
            this.$common.showMessage(statusRes?.message || 'Claim resubmitted successfully.', 'success');
            this.$claimStateApi.notifyStatusCountRefresh();
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
    const claimStateId = data?.claimStateId;
    const listKey = claimStateId;

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

    this.$claimStateApi.changeStatusArchive(config).subscribe({
      next: (res: any) => {
        this.archiveLoadingMap[listKey] = false;
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Archive failed.', 'danger');
          return;
        }

        this.dataList = this.dataList.filter((item: any) => item?.claimStateId != claimStateId);
        this.$claimStateApi.notifyStatusCountRefresh();
        this.$common.showMessage(res?.message || 'Claim archived successfully.', 'success');
      },
      error: () => {
        this.archiveLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while archiving claim.', 'danger');
      },
    });
  }

  downloadSignedForm(data: any): void {
    const url = data?.yatClaimDTO?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Signed form is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  hasSignedForm(data: any): boolean {
    return !!data?.yatClaimDTO?.inkSignedFileUrl;
  }

  loadClaimObservations(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.claimObservations = [];
    this.$claimObservationApi.getAll({ headers: { claimId: String(claimId) } }).subscribe({
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



