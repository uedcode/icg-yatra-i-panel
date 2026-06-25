import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { legacyDate, legacyValue } from 'src/app/shared/utils/legacy-display.util';
import { isLegacyPresent, unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';
import { isESign, isInkSign } from 'src/app/shared/utils/legacy-preview.util';

@Component({
  selector: 'app-common-preview-ty-duty-advance',
  templateUrl: './common-preview-ty-duty-advance.component.html',
  styleUrls: ['./common-preview-ty-duty-advance.component.css'],
  standalone: false,
})
export class CommonPreviewTyDutyAdvanceComponent implements OnInit {
  claims: any = {};
  claimId: string | null = null;
  supplementaryId: string | null = null;
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
      this.supplementaryId = params?.supId || null;
      this.loadPreview();
    });
  }

  get heading(): string {
    return 'Requisition for TY Duty Advance';
  }

  get tyDuty(): any {
    return this.claims?.yatTempDutyAdvDTOs?.[0] || {};
  }

  get travelRows(): any[] {
    return Array.isArray(this.claims?.yatDtsDetailDTOs) ? this.claims.yatDtsDetailDTOs : [];
  }

  get bankDetails(): any {
    return this.claims?.yatClaimBankDetailDTO || {};
  }

  get signWith(): string {
    return String(this.claims?.signWith || '').toUpperCase();
  }

  get isInkSign(): boolean {
    return isInkSign(this.signWith);
  }

  get isESign(): boolean {
    return isESign(this.signWith);
  }

  get gxLabelPrefix(): string {
    return isLegacyPresent(this.claims?.extendedAdvId) ? 'Authority' : 'Gx';
  }

  get gxFormLabel(): string {
    return isLegacyPresent(this.claims?.extendedAdvId) ? 'Authority' : 'Gx Form';
  }

  get gxFormStatus(): string {
    return isLegacyPresent(this.claims?.gxFormFileUrl) ? 'Attached' : 'Not Attached';
  }

  get purposeType(): string {
    return isLegacyPresent(this.tyDuty?.purposeType) ? this.tyDuty.purposeType : 'Other';
  }

  get showPurpose(): boolean {
    return isLegacyPresent(this.tyDuty?.purpose);
  }

  get showGuestDetails(): boolean {
    return !isLegacyPresent(this.tyDuty?.purpose);
  }

  get showUnitStation(): boolean {
    return isLegacyPresent(this.tyDuty?.tempTransTo) && isLegacyPresent(this.tyDuty?.stationProceedingTo);
  }

  get showDutyStation(): boolean {
    return isLegacyPresent(this.tyDuty?.dutyStation);
  }

  get showExtendedFrom(): boolean {
    return isLegacyPresent(this.claims?.extendedAdvId);
  }

  get showExtendedDuty(): boolean {
    return isLegacyPresent(this.claims?.refExtendedAdvId);
  }

  get gxDate(): string | null {
    return legacyDate(this.tyDuty?.gxDate, 'previewDate', null as any);
  }

  get occDate(): string | null {
    return legacyDate(this.claims?.occDate, 'previewDate', null as any);
  }

  get accHToDutyCells(): string[] {
    if (this.tyDuty?.availedCategory === '1' || this.tyDuty?.availedCategory === '2') {
      return [
        `${this.display(this.tyDuty?.accHToDutyKms)} per day(Kms)`,
        `${this.display(this.tyDuty?.accHToDutyPerDay)} per km`,
      ];
    }

    return [`${this.display(this.tyDuty?.accHToDutyPerDay)} per day`];
  }

  display(value: any): any {
    return legacyValue(value);
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private loadPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for TY Duty preview.', 'danger');
      return;
    }

    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: 'T',
        isFetch: 'true',
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    };

    if (this.supplementaryId) {
      (config.headers as any).supCLaimId = this.supplementaryId;
    }

    this.$common.showLoader();
    this.$claimApi.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message || 'Unable to load TY Duty preview.', 'danger');
          return;
        }

        this.claims = unwrapPreviewObject(response?.object);
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Error while loading TY Duty preview.', 'danger');
      },
    });
  }

}

