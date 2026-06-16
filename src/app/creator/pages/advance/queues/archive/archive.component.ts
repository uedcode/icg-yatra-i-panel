import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  standalone: false,
})
export class ArchiveComponent implements OnInit {
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
    private $claim: ClaimService,
    private $common: CommonService,
    private router: Router
  ) {}
  readonly moduleType: 'ADV' = 'ADV';

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
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  private getCreatorClaimRoute(subFormId: string | null): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'PMTA' || id === 'PMT' || id === 'PMTCLM') return 'preview-pmt-duty-claim';
    if (id === 'TYA' || id === 'TY' || id === 'TYD' || id === 'TYCLM') return 'preview-ty-duty-claim';
    if (id === 'FTEA' || id === 'FTE' || id === 'FTECLM') return 'preview-fte-claim';
    if (id === 'LTCA' || id === 'LTC' || id === 'LTCCLM') return 'preview-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return 'preview-resettlement-claim';
    if (id === 'P') return 'form-pmt-detail';
    if (id === 'T') return 'preview-ty-duty';
    if (id === 'F') return 'form-fte-detail';
    if (id === 'L') return 'form-ltc-detail';
    if (id === 'M') return 'form-manual-adv-detail';
    return null;
  }

  viewForm(data: any) {
    const payId = data?.yatPayDetailsDTO?.id || data?.id;
    if (
      payId &&
      (data?.yatPayDetailsDTO ||
        data?.viewUrl === 'form-pay-details' ||
        data?.formUrl === 'form-pay-details')
    ) {
      this.router.navigateByUrl(this.$auth.getModuleName() + `/form-pay-details?id=${payId}`);
      return;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    const subFormId =
      claim?.codeSubFormDTO?.subFormId || data?.subFormId || data?.codeSubFormDTO?.subFormId;
    const route = this.getCreatorClaimRoute(subFormId);

    if (claimId && route) {
      const queryString = route === 'preview-ty-duty'
        ? `id=${claimId}`
        : `claimId=${claimId}&subFormId=${subFormId}`;
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${route}?${queryString}`
      );
      return;
    }

    const legacyViewUrl =
      claim?.codeSubFormDTO?.viewUrl ||
      data?.codeSubFormDTO?.viewUrl ||
      data?.viewUrl;
    const legacyViewId = claimId || claim?.formId || data?.formId || data?.id;
    if (legacyViewUrl && legacyViewId) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${legacyViewUrl}?id=${legacyViewId}`
      );
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

    this.$claim.changeClaimStatusArchive(config).subscribe({
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


