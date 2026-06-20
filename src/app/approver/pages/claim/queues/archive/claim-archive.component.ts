import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
  selector: 'app-approver-claim-archive',
  templateUrl: './claim-archive.component.html',
  styleUrls: ['./claim-archive.component.scss'],
  standalone: false,
})
export class ClaimArchiveComponent implements OnInit {
  codeStatus: any;
  roleCodes: any;
  userIdDetails: any;
  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  filterObj: any = {};
  toggleFilter: any = false;
  key = 'createdOn';
  reverse = false;
  restoreLoadingMap: { [key: string]: boolean } = {};
  formId: any;
  claimId: any;
  pageTitle = 'Claim Archive';
  queueModule: 'ADV' | 'CLM' = 'ADV';

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $claimStateApi: ClaimStateApiService,
    private $common: CommonService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.roleCodes = this.$auth.codeRoleType();
    const routeData = this.route.snapshot?.data || {};
    this.queueModule = routeData['queueModule'] === 'CLM' ? 'CLM' : 'ADV';
    this.pageTitle = this.getPageTitle();
    if (this.userIdDetails?.roleTypeId !== this.roleCodes?.verifier) {
      this.$common.showMessage(`${this.pageTitle} is available for verifier role only.`, 'danger');
      this.router.navigateByUrl(this.$auth.getModuleName() + '/dashboard');
      return;
    }
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: '',
        isArchive: '1',
        formId: this.resolveQueueFormId(),
        searchFormId: '',
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      }, this.roleCodes),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  private getLegacySearchHeaders(): { pno: string; searchedName: string } {
    const pno = (this.filterObj?.pno || '').toString().trim();
    const searchedName = (this.filterObj?.searchedName || '').toString().trim();
    if (pno || searchedName) {
      return { pno, searchedName };
    }

    const raw = (this.searchObj || '').toString().trim();
    if (!raw) {
      return { pno: '', searchedName: '' };
    }
    if (/^\d+$/.test(raw)) {
      return { pno: raw, searchedName: '' };
    }
    if (/^[A-Za-z0-9/-]+$/.test(raw) && !/\s/.test(raw)) {
      return { pno: raw, searchedName: '' };
    }
    return { pno: '', searchedName: raw };
  }

  applyServerSearch(): void {
    const pno = (this.filterObj?.pno || '').toString().trim();
    const searchedName = (this.filterObj?.searchedName || '').toString().trim();
    if (!pno && !searchedName) {
      this.$common.showMessage('Please enter PNO or Name.', 'danger');
      return;
    }
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
    this.searchObj = '';
    this.p = 1;
    this.getState();
  }

  viewForm(data: any) {
    const routeUrl = this.$auth.getApproverPreviewUrl(data);
    if (routeUrl) {
      window.open(routeUrl, '_blank');
    }
  }

  restoreClaim(data: any): void {
    const claimStateId =
      data?.claimStateId ||
      data?.yatClaimStateDTO?.claimStateId ||
      data?.yatClaimStateDTO?.id ||
      data?.id;
    const listKey = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId || claimStateId;
    if (!claimStateId || this.restoreLoadingMap[listKey]) {
      return;
    }

    this.restoreLoadingMap[listKey] = true;
    const config = {
      headers: {
        ids: [String(claimStateId)],
        isArchive: '0',
      },
    };

    this.$claimStateApi.changeStatusArchive(config).subscribe({
      next: (res: any) => {
        this.restoreLoadingMap[listKey] = false;
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Restore failed.', 'danger');
          return;
        }

        this.dataList = this.dataList.filter(
          (item: any) =>
            (item?.claimStateId ||
              item?.yatClaimStateDTO?.claimStateId ||
              item?.yatClaimStateDTO?.id ||
              item?.id) != claimStateId
        );
        this.$common.showMessage(res?.message || 'Claim restored successfully.', 'success');
        this.$claimStateApi.notifyStatusCountRefresh();
      },
      error: () => {
        this.restoreLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while restoring claim.', 'danger');
      },
    });
  }

  viewHistory(formId: any, claimId: any = null): void {
    this.formId = formId;
    this.claimId = claimId || null;
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
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

  private getPageTitle(): string {
    return this.queueModule === 'CLM' ? 'Claim Archive' : 'Archive';
  }

  private resolveQueueFormId(): string {
    return this.queueModule === 'CLM' ? 'CLM' : 'ADV';
  }
}


