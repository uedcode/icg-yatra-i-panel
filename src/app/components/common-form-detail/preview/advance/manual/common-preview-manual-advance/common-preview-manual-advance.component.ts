import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

@Component({
  selector: 'app-common-preview-manual-advance',
  templateUrl: './common-preview-manual-advance.component.html',
  styleUrls: ['./common-preview-manual-advance.component.scss'],
  standalone: false,
})
export class CommonPreviewManualAdvanceComponent implements OnInit {
  claim: any = {};
  manual: any = {};
  userIdDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $common: CommonService,
    private previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParamMap.subscribe((params) => {
      const claimId = params.get('id') || '';
      if (!claimId) return;
      const config = {
        headers: {
          claimId,
          subFormId: 'M',
          isFetch: 'true',
          isPreview: 'true',
          userId: this.userIdDetails?.userId ?? '',
        },
      };
      this.$common.showLoader();
      this.$claimApi.getSingleClaim(config).subscribe(
        (res: any) => {
          this.$common.hideLoader();
          if (res?.status) {
            this.parsePreviewResponse(res);
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    });
  }

  private parsePreviewResponse(response: any): void {
    this.claim = this.unwrapClaimObject(response?.object);
    this.manual = this.firstItem(this.claim?.yatManualAdvDTOs);
  }

  private unwrapClaimObject(object: any): any {
    if (Array.isArray(object)) {
      return object[0] || {};
    }
    return object || {};
  }

  private firstItem(value: any): any {
    if (Array.isArray(value)) {
      return value[0] || {};
    }
    return value || {};
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }
}



