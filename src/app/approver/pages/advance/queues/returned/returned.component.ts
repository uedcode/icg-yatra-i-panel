import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-returned',
    templateUrl: './returned.component.html',
    styleUrls: ['./returned.component.scss'],
    standalone: false
})
export class ReturnedComponent implements OnInit {

  codeStatus;
  userIdDetails: any;
  queueState = '';

  constructor(
    private location: Location,
    public $auth: AuthService,
    private router: Router,
    private $claimStateApi: ClaimStateApiService,
    private route: ActivatedRoute
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.queueState = this.getQueueState();
    this.getState();
  }

  get pageTitle(): string {
    return this.queueState === this.codeStatus?.notApproved ? 'Not Approved' : 'Rejected';
  }

  filterDataObj;
  getState() {
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.queueState,
        formId: 'ADV',
      }, codeRoleList),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(data) {
    const routeUrl = this.buildAdvanceViewUrl(data);
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
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

  private getQueueState(): string {
    const routeData = this.route.snapshot?.data || {};
    const queueState = (routeData['queueState'] || '').toString().toUpperCase();
    return queueState === 'NA'
      ? this.codeStatus?.notApproved || 'NA'
      : this.codeStatus?.rejected;
  }

  private buildAdvanceViewUrl(data: any): string {
    const claim = data?.yatClaimDTO;
    const viewUrl = claim?.codeSubFormDTO?.viewUrl;
    const claimId = claim?.claimId;
    if (!viewUrl || !claimId) {
      return '';
    }
    return `${this.$auth.getModuleName()}/${String(viewUrl).replace(/^\/+/, '')}?id=${encodeURIComponent(claimId)}`;
  }

}


