import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-form-ltc-availed-history-detail',
  templateUrl: './form-ltc-availed-history-detail.component.html',
  styleUrls: ['./form-ltc-availed-history-detail.component.scss'],
  standalone: false,
})
export class FormLtcAvailedHistoryDetailComponent implements OnInit {
  claimId = '';
  rows: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || '';
      if (!this.claimId) return;
      this.loadData();
    });
  }

  private loadData() {
    const config = {
      headers: {
        claimId: this.claimId,
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


