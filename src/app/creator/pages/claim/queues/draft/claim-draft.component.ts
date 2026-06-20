import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';
import { FormManageService } from 'src/app/service/core/form-manage.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { ClaimRemarkApiService } from 'src/app/service/api/claim-remark/claim-remark-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-claim-draft',
    templateUrl: './claim-draft.component.html',
    styleUrls: ['./claim-draft.component.scss'],
    standalone: false
})
export class ClaimDraftComponent implements OnInit {
  readonly yatTravelMode = {
    yatra: 'YT',
  } as const;
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private router: Router,
    private $formManage: FormManageService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $claimRemarkApi: ClaimRemarkApiService,
  ) { }

  @Input() dataList: Array<any> = [];

  id: any;
  pageType: any;
  config: any;
  formObj: any = {};
  rowId: any;
  noOfPage: any = 10;
  p = 1;
  searchObj;
  readonly moduleType: 'CLM' = 'CLM';
  formId: any;
  claimId: any;
  unitRemarks: any[] = [];


  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
this.getState();
  }
filterDataObj
  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const formId = this.moduleType;
    const config = {
      headers: buildLegacyClaimStateHeaders({
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
        claimState: this.codeStatus?.draft,
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

  deleteRow(id) {
    const claimId = this.rowId;
    if (claimId) {
      const config = {
        headers: {
          ids: [claimId],
          isApproved: '0',
        },
      };

      this.$claimApi.deleteClaim(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.filter((elem: any) => elem?.yatClaimDTO?.claimId != claimId);
            this.$claimStateApi.notifyStatusCountRefresh();
          }
          this.rowId = null;
          $('#delete_modal').modal('hide');
        },
        () => {
          this.$common.hideLoader();
        }
      );
      return;
    }
  }

  reset() {
    this.formObj = {};
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  // data shorting start
  key: string = 'updatedOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  actionPage(data) {
    const claim = data?.yatClaimDTO;
    const claimId = claim?.claimId;
    const legacyFormUrl = claim?.codeSubFormDTO?.formUrl;
    if (claimId && legacyFormUrl) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${legacyFormUrl}?id=${claimId}`
      );
      return;
    }
  }

  setDeleteTarget(data: any) {
    this.id = data?.yatClaimDTO?.formId;
    this.rowId = data?.yatClaimDTO?.claimId || null;
  }

  canDeleteClaim(data: any): boolean {
    return data?.yatClaimDTO?.claimMode !== this.yatTravelMode.yatra;
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
}



