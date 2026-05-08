import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-form-manual-adv-detail',
  templateUrl: './form-manual-adv-detail.component.html',
  styleUrls: ['./form-manual-adv-detail.component.scss'],
  standalone: false,
})
export class FormManualAdvDetailComponent implements OnInit {
  claim: any = {};
  manual: any = {};

  constructor(
    private route: ActivatedRoute,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const claimId = params.get('id') || '';
      if (!claimId) return;
      const config = {
        headers: {
          claimId,
          subFormId: 'M',
          isPreview: '1',
        },
      };
      this.$common.showLoader();
      this.$claim.getSingleClaim(config).subscribe(
        (res: any) => {
          this.$common.hideLoader();
          if (res?.status && res.object?.length) {
            this.claim = res.object[0];
            this.manual = this.claim?.yatManualAdvDTOs?.[0] || {};
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    });
  }
}

