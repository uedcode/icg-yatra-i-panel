import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-manual-adv-detail',
  templateUrl: './form-manual-adv-detail.component.html',
  styleUrls: ['./form-manual-adv-detail.component.scss'],
  standalone: false,
})
export class FormManualAdvDetailComponent implements OnInit {
  claim: any = {};
  manual: any = {};
  userIdDetails: any;

  constructor(
    private route: ActivatedRoute,
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParamMap.subscribe((params) => {
      const claimId =
        params.get('claimId') ||
        params.get('id') ||
        params.get('formId') ||
        params.get('supId') ||
        '';
      if (!claimId) return;
      const config = {
        headers: {
          claimId,
          subFormId: 'M',
          isPreview: 'true',
          userId: this.userIdDetails?.userId ?? '',
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


