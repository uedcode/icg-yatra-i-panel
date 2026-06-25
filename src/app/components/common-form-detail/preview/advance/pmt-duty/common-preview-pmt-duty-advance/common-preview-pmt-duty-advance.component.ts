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
  selector: 'app-common-preview-pmt-duty-advance',
  templateUrl: './common-preview-pmt-duty-advance.component.html',
  styleUrls: ['./common-preview-pmt-duty-advance.component.css'],
  standalone: false,
})
export class CommonPreviewPmtDutyAdvanceComponent implements OnInit {
  claims: any = {};
  claimId: string | null = null;
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
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.id || null;
      this.loadPreview();
    });
  }

  get pmt(): any {
    return this.claims?.yatPermDutyAdvDTOs?.[0] || {};
  }

  get familyRows(): any[] {
    return Array.isArray(this.claims?.yatFamilyDetailDTOs) ? this.claims.yatFamilyDetailDTOs : [];
  }

  get travelRows(): any[] {
    return Array.isArray(this.claims?.yatDtsDetailDTOs) ? this.claims.yatDtsDetailDTOs : [];
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

  display(value: any): any {
    return legacyValue(value);
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private loadPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for PMT Duty preview.', 'danger');
      return;
    }

    this.$common.showLoader();
    this.$claimApi.getSingleClaim({
      headers: {
        claimId: this.claimId,
        subFormId: 'P',
        isFetch: 'true',
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    }).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message || 'Unable to load PMT Duty preview.', 'danger');
          return;
        }
        this.claims = unwrapPreviewObject(response?.object);
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Error while loading PMT Duty preview.', 'danger');
      },
    });
  }
}

