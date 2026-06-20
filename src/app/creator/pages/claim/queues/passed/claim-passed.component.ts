import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { ClaimObservationApiService } from 'src/app/service/api/claim/claim-observation-api.service';
import { DebitCreditNoteApiService } from 'src/app/service/api/payment/debit-credit-note-api.service';
import { RecoveryAdjustedApiService } from 'src/app/service/api/payment/recovery-adjusted-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-claim-passed',
    templateUrl: './claim-passed.component.html',
    styleUrls: ['./claim-passed.component.scss'],
    standalone: false
})
export class ClaimPassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; passed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private router: Router,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $claimObservationApi: ClaimObservationApiService,
    private $debitCreditNoteApi: DebitCreditNoteApiService,
    private $recoveryAdjustedApi: RecoveryAdjustedApiService
  ) { }

  @Input() dataList: Array<any> = [];

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  archiveLoadingMap: { [key: string]: boolean } = {};
  recoveryAdjustedObj: any = null;
  claimObservations: any[] = [];
  readonly moduleType: 'CLM' = 'CLM';

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
this.getState();
  }

  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const formId = this.moduleType;
    const config = {
      headers: buildLegacyClaimStateHeaders({
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
        claimState: this.codeStatus?.passed,
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

  hasInkSignedFile(data: any): boolean {
    return !!data?.yatClaimDTO?.inkSignedFileUrl;
  }

  isDpPayment(data: any): boolean {
    return data?.yatClaimDTO?.paymentType === 'DP';
  }

  canDownloadCreditDebit(data: any): boolean {
    const paymentType = data?.yatClaimDTO?.paymentType ?? null;
    return paymentType === 'MN' || paymentType === null;
  }

  hasSupplementaryClaim(data: any): boolean {
    return !!data?.yatClaimDTO?.supClaimId;
  }

  downloadCreditDebit(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.$debitCreditNoteApi.generateDebitCreditNote({ headers: { claimId } }).subscribe({
      next: (res: any) => {
        const responseObject = Array.isArray(res?.object) ? res.object[0] : res?.object;
        const fileUrl =
          (typeof responseObject === 'string' ? responseObject : responseObject?.debitCreditNoteFileUrl) ||
          data?.yatClaimDTO?.debitCreditNoteFileUrl;
        if (!res?.status || !fileUrl) {
          this.$common.showMessage(res?.message || 'Credit/Debit document is not available.', 'warning');
          return;
        }
        this.$common.download(fileUrl);
      },
      error: () => {
        this.$common.showMessage('Error while downloading Credit/Debit document.', 'danger');
      },
    });
  }

  downloadDailySlip(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.$claimApi.fileClaimDailySlip({ headers: { claimId } }).subscribe({
      next: (res: any) => {
        const claimObj = Array.isArray(res?.object) ? res.object[0] : res?.object;
        const fileUrl = claimObj?.debitCreditNoteFileUrl || data?.yatClaimDTO?.debitCreditNoteFileUrl;
        if (!res?.status || !fileUrl) {
          this.$common.showMessage(res?.message || 'Daily slip is not available.', 'warning');
          return;
        }
        this.$common.downloadAbsolute(`${this.$common.fileUrl}${fileUrl}`, `VC-${claimObj?.formId || claimId}.pdf`);
      },
      error: () => {
        this.$common.showMessage('Error while downloading daily slip.', 'danger');
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
        this.$common.showMessage('Error while loading claim observations.', 'danger');
      },
    });
  }

  getRecoveryAdjusted(data: any): void {
    const claimId = data?.yatClaimDTO?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.recoveryAdjustedObj = null;
    this.$recoveryAdjustedApi.getAll({ headers: { claimId } }).subscribe({
      next: (res: any) => {
        this.recoveryAdjustedObj = Array.isArray(res?.object) ? res.object[0] || null : res?.object || null;
        setTimeout(() => $('#recAdjModal').modal('show'), 0);
      },
      error: () => {
        this.$common.showMessage('Error while loading recovery adjusted details.', 'danger');
      },
    });
  }

  createSupplementaryClaim(data: any): void {
    const claim = data?.yatClaimDTO;
    const claimId = claim?.claimId;
    const subFormId = claim?.codeSubFormDTO?.subFormId;
    const formUrl = claim?.codeSubFormDTO?.formUrl;
    if (!claimId || !formUrl) {
      this.$common.showMessage('Supplementary claim route is not available.', 'warning');
      return;
    }
    this.router.navigate([`${this.$auth.getModuleName()}/${formUrl}`], {
      queryParams: {
        subFormId,
        supId: claimId,
      },
    });
  }

}



