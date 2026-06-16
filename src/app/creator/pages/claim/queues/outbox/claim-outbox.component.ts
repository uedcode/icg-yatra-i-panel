import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { FormService } from 'src/app/service/form/form.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-claim-outbox',
    templateUrl: './claim-outbox.component.html',
    styleUrls: ['./claim-outbox.component.scss'],
    standalone: false
})
export class ClaimOutboxComponent implements OnInit {
  readonly codeSignType = {
    eSign: 'ES',
    eSignAlt: 'E_SIGN',
  } as const;
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    private datePipe: DatePipe,
    public $formManage: FormManageService,
    private $codeSubForm: CodeSubFormService,
    private $claim: ClaimService,
  ) {}

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  filterObj: any = {};

  noOfPage: any = 10;
  p = 1;
  searchObj;
  toggleFilter: any = false;
  formList;
  today;
  readonly moduleType: 'CLM' = 'CLM';
  unitRemarks: any[] = [];

  ngOnInit() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.pageType = 'Claim';
    this.getState();
    this.getForm();
  }

  getForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.moduleType,
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
  filterDataObj;
  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
        claimState: this.codeStatus?.outbox,
        isArchive: '0',
        formId: this.moduleType,
        searchFormId: searchHeaders.formId,
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      }),
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      const claimStates = Array.isArray(res?.object) ? res.object : [];
      this.dataList = claimStates.filter((item: any) => this.matchesDateFilter(item));
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

  private matchesDateFilter(item: any): boolean {
    const createdOn = item?.yatClaimDTO?.createdOn || item?.createdOn;
    const createdAt = createdOn ? new Date(createdOn).getTime() : null;
    const fromDate = this.filterObj?.fromDate ? new Date(this.filterObj.fromDate).getTime() : null;
    const toDate = this.filterObj?.toDate
      ? new Date(this.filterObj.toDate).setHours(23, 59, 59, 999)
      : null;

    if (!createdAt) {
      return !fromDate && !toDate;
    }

    if (fromDate && createdAt < fromDate) {
      return false;
    }

    if (toDate && createdAt > toDate) {
      return false;
    }

    return true;
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
    const route = this.getCreatorClaimRoute(subFormId, true);

    if (claimId && route) {
      const queryString = route === 'preview-ty-duty'
        ? `id=${claimId}`
        : `claimId=${claimId}&subFormId=${subFormId}`;
      this.router.navigateByUrl(
        this.$auth.getModuleName() +
          `/${route}?${queryString}`
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

  downloadRequisition(data: any): void {
    const url =
      data?.yatClaimDTO?.inkSignedFileUrl ||
      data?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Requisition form is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  downloadSupportingDocument(data: any): void {
    const url =
      data?.yatClaimDTO?.signedFileUrl ||
      data?.signedFileUrl;
    if (!url) {
      this.$common.showMessage('Supporting document is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  isESignClaim(data: any): boolean {
    const signWith = String(data?.yatClaimDTO?.signWith || data?.signWith || '').toUpperCase();
    return signWith === this.codeSignType.eSign || signWith === this.codeSignType.eSignAlt;
  }

  viewUnitRemarks(claimId: any): void {
    if (!claimId) {
      return;
    }
    this.unitRemarks = [];
    this.$claim.getClaimRemarks({ headers: { claimId: String(claimId) } }).subscribe({
      next: (res: any) => {
        this.unitRemarks = Array.isArray(res?.object) ? res.object : [];
        setTimeout(() => $('#unitRemarksModal').modal('show'), 0);
      },
      error: () => {
        this.unitRemarks = [];
        this.$common.showMessage('Unable to load unit remarks.', 'danger');
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
  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}

