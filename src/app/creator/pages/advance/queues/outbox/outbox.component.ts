import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { FormManageService } from 'src/app/service/core/form-manage.service';
import { CodeSubFormApiService } from 'src/app/service/api/code-sub-form/code-sub-form-api.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-outbox',
    templateUrl: './outbox.component.html',
    styleUrls: ['./outbox.component.scss'],
    standalone: false
})
export class OutboxComponent implements OnInit {
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
    private route: ActivatedRoute
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
  readonly moduleType: 'ADV' = 'ADV';

  ngOnInit() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
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
    const formId = this.moduleType;
    const config = {
      headers: buildLegacyClaimStateHeaders({
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
        claimState: this.codeStatus?.outbox,
        isArchive: '0',
        formId,
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

  downloadRequisition(data: any): void {
    const url = data?.yatClaimDTO?.inkSignedFileUrl;
    if (!url) {
      this.$common.showMessage('Requisition form is not available.', 'danger');
      return;
    }
    this.$common.download(url);
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

 formId;
 claimId;
  viewHistory(formId: any, claimId: any = null): void {
    this.formId = formId;
    this.claimId = claimId || null;
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
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



