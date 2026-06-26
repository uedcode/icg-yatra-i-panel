import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { legacyShowNil } from 'src/app/shared/utils/legacy-display.util';
import { asArray, firstItem, hasAnyLegacyValue, isLegacyPresent, unwrapNullablePreviewObject, unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';
import { isESign, isInkSign, isManualClaimMode, normalizePreviewSubFormId } from 'src/app/shared/utils/legacy-preview.util';

@Component({
  selector: 'app-common-preview-ltc-claim',
  templateUrl: './common-preview-ltc-claim.component.html',
  styleUrls: ['./common-preview-ltc-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CommonPreviewLtcClaimComponent implements OnInit {
  readonly defaultSubFormId = 'LTC';

  formObj: any = {};
  claim: any = {};
  bankDetails: any = {};
  documentDtos: any[] = [];
  travelRows: any[] = [];
  familyRows: any[] = [];
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
      this.claimId = params?.id ?? params?.claimId ?? params?.formId ?? null;
      this.supplementaryId = params?.supId ?? null;
      this.subFormId = normalizePreviewSubFormId(params?.subFormId ?? this.route.snapshot.data?.['subFormId'] ?? this.defaultSubFormId);
      this.getClaimDetails();
    });
  }

  getClaimDetails(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for LTC claim preview.', 'danger');
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
          this.$common.showMessage(response?.message ?? 'Unable to load LTC claim preview.', 'danger');
          return;
        }
        this.parseClaimPreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading LTC claim preview.', 'danger');
      },
    });
  }

  get previewTitle(): string {
    const prefix = isLegacyPresent(this.formObj?.supClaimId) ? 'Supplementary ' : '';
    const suffix = isLegacyPresent(this.formObj?.formId) ? ` - ${this.formObj.formId}` : '';
    return `${prefix}LTC Claim${suffix}`;
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

  get isManualClaimMode(): boolean {
    return isManualClaimMode(this.formObj?.claimMode);
  }

  get ltcLeave(): any {
    return firstItem(this.claim?.yatLtcClaimLeaveDTOs);
  }

  get spouseRows(): any[] {
    if (this.claim?.isNewlyMarried !== 'Yes') {
      return [];
    }
    return [this.claim?.yatSpouseDetailDTO ?? {}];
  }

  get otherChargeRows(): any[] {
    return asArray(this.formObj?.yatForeignTravelDetailDTOs);
  }

  get declarationRows(): any[] {
    return [
      { text: 'The information as given above is true to the best of my knowledge and belief.', checked: this.claim?.certify },
      { text: `That my ${this.spouseWord()} is not employed in government service.`, checked: this.claim?.secondCertify },
      { text: `That my ${this.spouseWord()} is employed in government service and the concession has not been availed separately for the concerned block of years ${legacyShowNil(this.claim?.blockYearFrom)} to ${legacyShowNil(this.claim?.blockYearTo)}.`, checked: this.claim?.thirdCertify },
      { text: `That my ${this.spouseWord()} for whom LTC is claimed is employed in ${legacyShowNil(this.claim?.empIn)} and will not prefer any claim in this behalf.`, checked: this.claim?.fourthCertify },
      { text: 'That my spouse for whom LTC is claimed is employed in an organisation which provides LTC facilities to its employees and families.', checked: this.claim?.fifthCertify },
      { text: 'I have not submitted any other claim so far for LTC in respect of myself or my family members for year/block year.', checked: this.claim?.sixthCertify },
      { text: `Journey has been performed by ${legacyShowNil(this.claim?.performedBy)} to declared place of visit/hometown viz. ${legacyShowNil(this.ltcLeave?.ltcType)} for block year ${legacyShowNil(this.ltcLeave?.blockYear)}.`, checked: this.claim?.seventhCertify },
    ];
  }

  get hasOtherChargeAmount(): boolean {
    return isLegacyPresent(this.claim?.otherChargeAmt);
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
    this.claim = firstItem(claims?.yatLtcClaimDTOs);
    this.travelRows = asArray(claims?.yatClaimTravelDetailsDTOs);
    this.familyRows = asArray(claims?.yatFamilyDetailDTOs);
    this.gxRows = asArray(claims?.yatClaimGxDetailsDTOs);
    this.documentDtos = asArray(claims?.yatDocsDTOs);
    this.bankDetails = claims?.yatClaimBankDetailDTO ?? {};
  }

  private spouseWord(): string {
    return this.claim?.gender === 'F' ? 'husband' : 'wife';
  }
}

