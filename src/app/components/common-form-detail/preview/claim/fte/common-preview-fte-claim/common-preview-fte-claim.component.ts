import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { asArray, firstItem, hasAnyLegacyValue, isLegacyPresent, unwrapNullablePreviewObject, unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';
import { isESign, isInkSign, isYatraClaimMode } from 'src/app/shared/utils/legacy-preview.util';

@Component({
  selector: 'app-common-preview-fte-claim',
  templateUrl: './common-preview-fte-claim.component.html',
  styleUrls: ['./common-preview-fte-claim.component.scss'],
  standalone: false,
})
export class CommonPreviewFteClaimComponent implements OnInit {
  readonly defaultSubFormId = 'FTE';

  formObj: any = {};
  claim: any = {};
  bankDetails: any = {};
  documentDtos: any[] = [];
  travelRows: any[] = [];
  gxRows: any[] = [];
  claimId: string | null = null;
  subFormId = this.defaultSubFormId;
  supplementaryId: string | null = null;
  userIdDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private $common: CommonService,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    public previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.id ?? null;
      this.supplementaryId = params?.supId ?? null;
      this.subFormId = params?.subFormId ?? this.route.snapshot.data?.['subFormId'] ?? this.defaultSubFormId;
      this.getClaimDetails();
    });
  }

  getClaimDetails(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for FTE claim preview.', 'danger');
      return;
    }

    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.subFormId,
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    };
    if (this.supplementaryId) {
      (config.headers as any).supCLaimId = this.supplementaryId;
    }

    this.$common.showLoader();
    this.$claimApi.getSingleClaimPreview(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message ?? 'Unable to load FTE claim preview.', 'danger');
          return;
        }
        this.parseClaimPreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading FTE claim preview.', 'danger');
      },
    });
  }

  get previewTitle(): string {
    const prefix = isLegacyPresent(this.formObj?.supClaimId) ? 'Supplementary ' : '';
    const suffix = isLegacyPresent(this.formObj?.formId) ? ` - ${this.formObj.formId}` : '';
    return `${prefix}FTE Claim${suffix}`;
  }

  get isCreatorRole(): boolean {
    return this.userIdDetails?.roleTypeId === this.$auth.codeRoleType()?.creator;
  }

  get isInkSign(): boolean {
    return isInkSign(this.formObj?.signWith);
  }

  get isESign(): boolean {
    return isESign(this.formObj?.signWith);
  }

  get hasLinkedAdvance(): boolean {
    return isYatraClaimMode(this.formObj?.claimMode) && isLegacyPresent(this.formObj?.advClaimId);
  }

  get guestRows(): any[] {
    if (isLegacyPresent(this.claim?.purpose)) {
      return [];
    }
    return [
      {
        name: this.claim?.personName,
        relation: this.claim?.relation,
        age: this.claim?.age,
        gender: this.claim?.gender,
      },
    ];
  }

  get roadMileageRows(): any[] {
    return asArray(this.claim?.yatTempDutyClaimRoadMileageDTOs);
  }

  get leaveRows(): any[] {
    return asArray(this.claim?.yatTempDutyClaimLeaveDTOs);
  }

  get accommodationRows(): any[] {
    return asArray(this.claim?.yatTempDutyClaimBoarLodDTOs);
  }

  get foodRows(): any[] {
    return asArray(this.claim?.yatTempDutyClaimFoodDTOs);
  }

  get cityJourneyRows(): any[] {
    return asArray(this.claim?.yatTempDutyClaimJourneyDTOs);
  }

  get otherChargeRows(): any[] {
    return asArray(this.formObj?.yatForeignTravelDetailDTOs);
  }

  get hasMroPenalInterest(): boolean {
    return Number(this.claim?.mroPiAmt) > 0;
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  hasRelatedClaims(): boolean {
    return hasAnyLegacyValue(this.formObj?.advClaimId, this.formObj?.supClaimId);
  }

  downloadPreview(): void {
    if (!this.formObj?.claimId) {
      this.$common.showMessage('Claim id is not available.', 'danger');
      return;
    }
    this.$claimApi
      .fileDownloadedTempInkSign({
        headers: {
          claimId: this.formObj.claimId,
          signType: true,
        },
      })
      .subscribe({
        next: (response: any) => {
          if (!response?.status) {
            this.$common.showMessage(response?.message ?? 'Unable to download file.', 'danger');
            return;
          }
          const responseObject = unwrapNullablePreviewObject(response?.object);
          this.$common.download(responseObject?.inkSignedFileUrl);
        },
        error: () => this.$common.showMessage('Unable to download file.', 'danger'),
      });
  }

  private parseClaimPreviewResponse(response: any): void {
    const claims = unwrapPreviewObject(response?.object);
    this.formObj = claims;
    this.claim = firstItem(claims?.yatForeignDutyClaimDTOs);
    this.travelRows = asArray(claims?.yatClaimTravelDetailsDTOs);
    this.gxRows = asArray(claims?.yatClaimGxDetailsDTOs);
    this.documentDtos = asArray(claims?.yatDocsDTOs);
    this.bankDetails = claims?.yatClaimBankDetailDTO ?? {};
  }

}

