import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { FormManageService } from 'src/app/service/core/form-manage.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-draft',
    templateUrl: './draft.component.html',
    styleUrls: ['./draft.component.scss'],
    standalone: false
})
export class DraftComponent implements OnInit {
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormApiService,
    private router: Router,
    private $formManage: FormManageService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private route: ActivatedRoute,
  ) { }

  @Input() dataList: Array<any> = [];
  // @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  formObj: any = {};
  filterObj: any = {};
  rowId: any;
  noOfPage: any = 10;
  p = 1;
  searchObj;
  toggleFilter: any = false;
  readonly moduleType: 'ADV' = 'ADV';


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

  deleteRow(id) {
    const claimId = this.rowId;
    if (claimId) {
      const config = {
        headers: {
          ids: [claimId],
        },
      };

      this.$claimApi.deleteClaim(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.filter(
              (elem: any) => elem?.yatClaimDTO?.claimId != claimId
            );
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

    let config = {
      headers: {
        ids: id,
      },
    };

    this.$form.delete(config).subscribe(
      (response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter((elem) => elem.formId != id);
          this.$claimStateApi.notifyStatusCountRefresh();
        }
        $('#delete_modal').modal('hide');
      },
      (err) => {
        this.$common.hideLoader();
      }
    );

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
    const route = claim?.codeSubFormDTO?.formUrl;

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${route}?id=${claimId}`
      );
    }
  }

  setDeleteTarget(data: any) {
    this.id = data?.yatClaimDTO?.claimId;
    this.rowId = data?.yatClaimDTO?.claimId;
  }
}



