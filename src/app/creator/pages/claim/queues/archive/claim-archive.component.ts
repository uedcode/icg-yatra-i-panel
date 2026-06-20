import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
  selector: 'app-claim-archive',
  templateUrl: './claim-archive.component.html',
  styleUrls: ['./claim-archive.component.scss'],
  standalone: false,
})
export class ClaimArchiveComponent implements OnInit {
  codeStatus: any;
  userIdDetails: any;
  @Input() dataList: Array<any> = [];

  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  key = 'descr';
  reverse = false;
  restoreLoadingMap: { [key: string]: boolean } = {};

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $common: CommonService,
    private router: Router) {}
  readonly moduleType: 'CLM' = 'CLM';

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
this.getState();
  }
  getState() {
    const formId = this.moduleType;
    const config = {
      headers: buildLegacyClaimStateHeaders({
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId,
        claimState: '',
        isArchive: '1',
        formId,
        searchFormId: '',
        pno: '',
        searchedName: '',
      }),
    };
    this.$claimStateApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  viewForm(data: any) {
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

  restoreClaim(data: any): void {
    const claimStateId = data?.claimStateId;
    const listKey = claimStateId;
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

        this.dataList = this.dataList.filter((item: any) => item?.claimStateId != claimStateId);
        this.$claimStateApi.notifyStatusCountRefresh();
        this.$common.showMessage(res?.message || 'Claim restored successfully.', 'success');
      },
      error: () => {
        this.restoreLoadingMap[listKey] = false;
        this.$common.showMessage('Something went wrong while restoring claim.', 'danger');
      },
    });
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



