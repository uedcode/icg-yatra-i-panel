import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { ClaimObservationApiService } from 'src/app/service/api/claim/claim-observation-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-passed',
    templateUrl: './passed.component.html',
    styleUrls: ['./passed.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; passed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private router: Router,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $claimObservationApi: ClaimObservationApiService
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
  archiveLoadingMap: { [key: string]: boolean } = {};
  claimObservations: any[] = [];
  readonly moduleType: 'ADV' = 'ADV';

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

  viewForm(data) {
    const claim = data?.yatClaimDTO;
    const legacyViewUrl = claim?.codeSubFormDTO?.viewUrl;
    const claimId = claim?.claimId;
    if (legacyViewUrl && claimId) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${legacyViewUrl}?id=${claimId}`
      );
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

  archiveClaim(data: any): void {
    const claimStateId = data?.claimStateId;
    const listKey = data?.yatClaimDTO?.claimId;

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

        this.dataList = this.dataList.filter(
          (item: any) => item?.claimStateId != claimStateId
        );
        this.$claimStateApi.notifyStatusCountRefresh();
        this.$common.showMessage(res?.message || 'Claim archived successfully.', 'success');
      },
      error: () => {
        this.archiveLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while archiving claim.', 'danger');
      },
    });
  }

  downloadVoucher(data: any): void {
    const claim = data?.yatClaimDTO;
    const claimId = claim?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available for voucher download.', 'warning');
      return;
    }

    const config = {
      headers: {
        claimId,
        ...(claim?.codeSubFormDTO?.subFormId ? { subFormId: claim.codeSubFormDTO.subFormId } : {}),
      },
    };

    this.$claimApi.fileDownloadedVoucher(config).subscribe({
      next: (res: any) => {
        const voucher = Array.isArray(res?.object) ? res.object[0] || {} : res?.object || {};
        const voucherPath =
          voucher?.voucherFileUrl ||
          claim?.voucherFileUrl ||
          claim?.voucherUrl;
        if (!res?.status || !voucherPath) {
          this.$common.showMessage(res?.message || 'Voucher file is not available.', 'warning');
          return;
        }

        const fileName = `VC-${claim?.formId}.pdf`;
        this.$common.downloadAbsolute(`${this.$common.fileUrl}${voucherPath}`, fileName);
        this.$common.showMessage(res?.message || 'Voucher downloaded successfully.');
      },
      error: () => {
        this.$common.showMessage('Error while downloading voucher.', 'danger');
      },
    });
  }

  downloadSignedForm(data: any): void {
    const url =
      data?.yatClaimDTO?.inkSignedFileUrl ||
      data?.yatClaimDTO?.signedFileUrl;
    if (!url) {
      this.$common.showMessage('Signed form is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  hasVoucher(data: any): boolean {
    return !!data?.yatClaimDTO?.punchingId;
  }

  hasSignedForm(data: any): boolean {
    return !!(
      data?.yatClaimDTO?.inkSignedFileUrl ||
      data?.yatClaimDTO?.signedFileUrl
    );
  }

  isExtendDutyDisabled(data: any): boolean {
    const claim = data?.yatClaimDTO;
    const subFormId = claim?.codeSubFormDTO?.subFormId;
    return !!claim?.refClaimId || subFormId !== 'T' || !!claim?.refExtendedAdvId;
  }

  extendDuty(data: any): void {
    if (this.isExtendDutyDisabled(data)) {
      return;
    }

    const claim = data?.yatClaimDTO;
    const claimId = claim?.claimId;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const route = claim?.codeSubFormDTO?.formUrl;
    if (!route) {
      this.$common.showMessage('TY advance route is not available.', 'warning');
      return;
    }

    this.router.navigate([this.$auth.getModuleName() + `/${route}`], {
      queryParams: {
        extnId: claimId,
        extnClaimId: claimId,
        subFormId: 'T',
      },
    });
  }

}


