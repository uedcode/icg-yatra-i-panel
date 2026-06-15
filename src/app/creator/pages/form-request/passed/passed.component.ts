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
    selector: 'app-passed',
    templateUrl: './passed.component.html',
    styleUrls: ['./passed.component.scss'],
    standalone: false
})
export class PassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; passed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    public $formManage: FormManageService,
    private router: Router,
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
  archiveLoadingMap: { [key: string]: boolean } = {};
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
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.passed,
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

  private getCreatorClaimRoute(subFormId: string | null, detail = false): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'PMTA' || id === 'PMT') return detail ? 'preview-pmt-duty-claim' : 'form-pmt-duty-claim';
    if (id === 'TYA' || id === 'TY') return detail ? 'preview-ty-duty-claim' : 'form-ty-duty-claim';
    if (id === 'FTEA' || id === 'FTE') return detail ? 'preview-fte-claim' : 'form-fte-claim';
    if (id === 'LTCA' || id === 'LTC') return detail ? 'preview-ltc-claim' : 'form-ltc-claim';
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
        this.$auth.getModuleName() + `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?id=${data.formId}`
    );
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
        this.$common.showMessage(res?.message || 'Claim archived successfully.', 'success');
      },
      error: () => {
        this.archiveLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while archiving claim.', 'danger');
      },
    });
  }

  downloadVoucher(data: any): void {
    const url =
      data?.yatClaimDTO?.voucherFileUrl ||
      data?.yatClaimDTO?.voucherUrl ||
      data?.voucherFileUrl ||
      data?.voucherUrl;
    if (!url) {
      this.$common.showMessage('Voucher is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  downloadSignedForm(data: any): void {
    const url =
      data?.yatClaimDTO?.inkSignedFileUrl ||
      data?.yatClaimDTO?.signedFileUrl ||
      data?.inkSignedFileUrl ||
      data?.signedFileUrl;
    if (!url) {
      this.$common.showMessage('Signed form is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  isExtendDutyDisabled(data: any): boolean {
    const claim = data?.yatClaimDTO || data || {};
    const subFormId = claim?.codeSubFormDTO?.subFormId || data?.subFormId;
    return !!claim?.refClaimId || subFormId !== 'T' || !!claim?.refExtendedAdvId;
  }

  extendDuty(data: any): void {
    if (this.isExtendDutyDisabled(data)) {
      return;
    }

    const claim = data?.yatClaimDTO || data || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const route = this.getCreatorClaimRoute('T', false);
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


