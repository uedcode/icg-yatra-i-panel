import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { FormManageService } from 'src/app/service/core/form-manage.service';
import { CodeSubFormApiService } from 'src/app/service/api/code-sub-form/code-sub-form-api.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { ClaimRemarkApiService } from 'src/app/service/api/claim-remark/claim-remark-api.service';
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
    private $form: FormApiService,
    private router: Router,
    private datePipe: DatePipe,
    private $formManage: FormManageService,
    private $codeSubForm: CodeSubFormApiService,
    private $claimApi: ClaimApiService, private $claimStateApi: ClaimStateApiService,
    private $claimRemarkApi: ClaimRemarkApiService,
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
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
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
    const subDate = item?.yatClaimDTO?.subDate;
    const createdAt = subDate ? new Date(subDate).getTime() : null;
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

  downloadRequisition(data: any): void {
    const url = data?.yatClaimDTO?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Requisition form is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  downloadSupportingDocument(data: any): void {
    const url = data?.yatClaimDTO?.signedFileUrl;
    if (!url) {
      this.$common.showMessage('Supporting document is not available.', 'warning');
      return;
    }
    this.$common.download(url);
  }

  isESignClaim(data: any): boolean {
    const signWith = String(data?.yatClaimDTO?.signWith || '').toUpperCase();
    return signWith === this.codeSignType.eSign || signWith === this.codeSignType.eSignAlt;
  }

  viewUnitRemarks(claimId: any): void {
    if (!claimId) {
      return;
    }
    this.unitRemarks = [];
    this.$claimRemarkApi.getAll({ headers: { claimId: String(claimId) } }).subscribe({
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
  key: string = 'subDate';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}


