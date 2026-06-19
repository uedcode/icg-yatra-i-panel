import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-common-preview-ltc-availed-history',
  templateUrl: './common-preview-ltc-availed-history.component.html',
  styleUrls: ['./common-preview-ltc-availed-history.component.scss'],
  standalone: false,
})
export class CommonPreviewLtcAvailedHistoryComponent implements OnInit {
  claimId = '';
  userIdDetails: any;
  rows: any[] = [];

  constructor(
    private route: ActivatedRoute,
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParamMap.subscribe((params) => {
      this.claimId =
        params.get('id') ||
        params.get('claimId') ||
        params.get('formId') ||
        params.get('supId') ||
        '';
      if (!this.claimId) return;
      this.loadData();
    });
  }

  private loadData() {
    const config = {
      headers: {
        claimId: this.claimId,
        userId: this.userIdDetails?.userId || '',
        isFetch: '1',
      },
    };
    this.$common.showLoader();
    this.$claim.getLtcAvailedHistory(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        if (res?.status && Array.isArray(res.object) && res.object.length) {
          const transfer = res.object[0];
          const keys = [
            'hometownSelfLTCList',
            'hometownSingleLTCList',
            'hometownPartialLTCList',
            'allindiaSelfLTCList',
            'allindiaSingleLTCList',
            'allindiaPartialLTCList',
            'specialplaceSelfLTCList',
            'specialplaceSingleLTCList',
            'specialplacePartialLTCList',
            'additionalLTC',
            'ESPLTCList',
            'AFSPLTCList',
          ];
          this.rows = [];
          keys.forEach((k) => {
            (transfer?.[k] || []).forEach((r: any) => {
              this.rows.push({ ...r, _bucket: k });
            });
          });
        }
      },
      (err) => {
        this.$common.hideLoader();
        console.log(err);
      }
    );
  }
}


