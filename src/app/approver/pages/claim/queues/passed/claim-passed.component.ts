import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-approver-claim-passed',
    templateUrl: './claim-passed.component.html',
    styleUrls: ['./claim-passed.component.scss'],
    standalone: false
})
export class ClaimPassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; passed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
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
  queueModule: 'ADV' | 'CLM' = 'ADV';
  archiveLoadingMap: { [key: string]: boolean } = {};

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    const routeData = this.route.snapshot?.data || {};
    this.queueModule = routeData['queueModule'] === 'CLM' ? 'CLM' : 'ADV';
    this.getState();
  }

  filterDataObj;
  getState() {
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.passed,
        isArchive: '0',
        formId: this.resolveQueueFormId(),
      }, codeRoleList),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(data) {
    const routeUrl = this.$auth.getApproverPreviewUrl(data);
    if (routeUrl) {
      this.router.navigateByUrl(routeUrl);
    }
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

    this.$claimStateApi.changeStatusArchive(config).subscribe({
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
        this.$claimStateApi.notifyStatusCountRefresh();
      },
      error: () => {
        this.archiveLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while archiving claim.', 'danger');
      },
    });
  }

  private resolveQueueFormId(): string {
    return this.queueModule === 'CLM' ? 'CLM' : 'ADV';
  }

}
