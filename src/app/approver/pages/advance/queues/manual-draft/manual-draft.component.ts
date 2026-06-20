import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';

@Component({
  selector: 'app-manual-draft',
  templateUrl: './manual-draft.component.html',
  styleUrls: ['./manual-draft.component.scss'],
  standalone: false,
})
export class ManualDraftComponent implements OnInit {
  codeStatus: any;
  userIdDetails: any;
  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  searchObj: any;
  filterObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  toggleFilter: any = false;
  key = 'createdOn';
  reverse = false;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $claimApi: ClaimApiService, private $claimStateApi: ClaimStateApiService,
    private $common: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    if (this.userIdDetails?.roleTypeId !== this.$auth.codeRoleType()?.verifier) {
      this.$common.showMessage('Manual Draft is available for verifier role only.', 'danger');
      this.router.navigateByUrl(this.$auth.getModuleName() + '/dashboard');
      return;
    }
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.manualDraft || 'MD',
        isArchive: '0',
        formId: 'ADV',
        searchFormId: searchHeaders.formId,
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      }, codeRoleList),
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

  editManualDraft(data: any): void {
    const claimId = this.getClaimId(data);
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }
    const formUrl = data?.yatClaimDTO?.codeSubFormDTO?.formUrl || 'form-manual-adv';
    this.router.navigateByUrl(this.$auth.getModuleName() + `/${formUrl}?id=${claimId}`);
  }

  deleteManualDraft(data: any): void {
    const claimId = this.getClaimId(data);
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    this.$claimApi.deleteClaim({ headers: { ids: [String(claimId)] } }).subscribe({
      next: (res: any) => {
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Delete failed.', 'danger');
          return;
        }
        this.dataList = this.dataList.filter((item: any) => this.getClaimId(item) != claimId);
        this.$common.showMessage(res?.message || 'Claim deleted successfully.', 'success');
      },
      error: () => {
        this.$common.showMessage('Something went wrong while deleting claim.', 'danger');
      },
    });
  }

  private getClaimId(data: any): any {
    return data?.yatClaimDTO?.claimId || data?.claimId || data?.formId || data?.id;
  }

  sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
}


