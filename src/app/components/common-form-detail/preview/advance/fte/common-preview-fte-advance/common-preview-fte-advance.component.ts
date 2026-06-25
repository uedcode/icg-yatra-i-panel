import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { legacyValue } from 'src/app/shared/utils/legacy-display.util';
import { unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';
import { isESign, isInkSign } from 'src/app/shared/utils/legacy-preview.util';

@Component({
  selector: 'app-common-preview-fte-advance',
  templateUrl: './common-preview-fte-advance.component.html',
  styleUrls: ['./common-preview-fte-advance.component.css'],
  standalone: false,
})
export class CommonPreviewFteAdvanceComponent implements OnInit {
  claims: any = {};
  claimId: string | null = null;
  userIdDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $common: CommonService,
    public previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.id || null;
      this.loadPreview();
    });
  }

  get fte(): any {
    return this.claims?.yatForeignDutyAdvDTOs?.[0] || {};
  }

  get travelRows(): any[] {
    return Array.isArray(this.claims?.yatDtsDetailDTOs) ? this.claims.yatDtsDetailDTOs : [];
  }

  get foreignTravelRows(): any[] {
    return Array.isArray(this.claims?.yatForeignTravelDetailDTOs) ? this.claims.yatForeignTravelDetailDTOs : [];
  }

  get bankDetails(): any {
    return this.claims?.yatClaimBankDetailDTO || {};
  }

  get isInkSign(): boolean {
    return isInkSign(this.claims?.signWith);
  }

  get isESign(): boolean {
    return isESign(this.claims?.signWith);
  }

  get gxLabelPrefix(): string {
    return this.claims?.extendedAdvId ? 'Authority' : 'Gx';
  }

  get gxFormLabel(): string {
    return this.claims?.extendedAdvId ? 'Authority' : 'Gx Form';
  }

  display(value: any): any {
    return legacyValue(value);
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private loadPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for FTE Advance preview.', 'danger');
      return;
    }

    this.$common.showLoader();
    this.$claimApi.getSingleClaim({
      headers: {
        claimId: this.claimId,
        subFormId: 'F',
        isFetch: 'true',
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    }).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message || 'Unable to load FTE Advance preview.', 'danger');
          return;
        }
        this.claims = unwrapPreviewObject(response?.object);
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Error while loading FTE Advance preview.', 'danger');
      },
    });
  }
}

