import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { firstItem, unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';

@Component({
  selector: 'app-common-preview-manual-advance',
  templateUrl: './common-preview-manual-advance.component.html',
  styleUrls: ['./common-preview-manual-advance.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
      const claimId = params.get('id') || params.get('claimId') || params.get('formId') || '';
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
    this.claim = unwrapPreviewObject(response?.object);
    this.manual = firstItem(this.claim?.yatManualAdvDTOs);
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }
}



