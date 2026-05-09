import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';
declare var $: any;

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
  formId: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $claim: ClaimService,
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
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.manualDraft || 'MD',
        isArchive: '0',
        formId: searchHeaders.formId,
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      },
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

  viewForm(data: any) {
    const routeUrl = this.$auth.getApproverWorkflowDetailUrl(
      data,
      data?.claimState || this.codeStatus?.manualDraft || 'MD'
    );
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
  }

  viewHistory(formId: any): void {
    this.formId = formId;
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
}
