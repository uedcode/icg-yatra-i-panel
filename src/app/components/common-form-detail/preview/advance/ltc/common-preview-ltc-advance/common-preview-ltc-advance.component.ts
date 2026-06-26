import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { isLegacyBlank, legacyValue } from 'src/app/shared/utils/legacy-display.util';
import { asArray, firstItem, unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';
import { isESign, isInkSign, isYatraClaimMode } from 'src/app/shared/utils/legacy-preview.util';

@Component({
  selector: 'app-common-preview-ltc-advance',
  templateUrl: './common-preview-ltc-advance.component.html',
  styleUrls: ['./common-preview-ltc-advance.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CommonPreviewLtcAdvanceComponent implements OnInit {
  formObj: any = null;
  preview: any = {
    claims: {},
    ltc: {},
    familyRows: [],
    travelRows: [],
  };
  claimId: string | null = null;
  subFormId: string = 'L';
  supplementaryId: string | null = null;
  userIdDetails: any;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $common: CommonService,
    public previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.subFormId = this.normalizeSubFormId(this.route.snapshot.data?.['subFormId']);
    this.claimId =
      this.route.snapshot.queryParamMap.get('claimId') ||
      this.route.snapshot.queryParamMap.get('id') ||
      this.route.snapshot.queryParamMap.get('formId') ||
      this.route.snapshot.queryParamMap.get('supId');
    this.supplementaryId = this.route.snapshot.queryParamMap.get('supId');
    this.subFormId = this.normalizeSubFormId(
      this.route.snapshot.queryParamMap.get('subFormId') || this.subFormId
    );
    if (this.claimId) this.getClaimDetails();
  }

  getClaimDetails(): void {
    this.$common.showLoader();

    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.subFormId,
        isFetch: 'true',
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    };
    if (this.supplementaryId) {
      (config.headers as any).supCLaimId = this.supplementaryId;
    }

    this.$claimApi.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        this.parsePreviewResponse(response);
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage(
          'Unable to load LTC preview details.',
          'danger'
        );
      },
    });
  }

  get ltc(): any {
    return this.preview?.ltc || {};
  }

  get familyRows(): any[] {
    return this.preview?.familyRows || [];
  }

  get travelRows(): any[] {
    return this.preview?.travelRows || [];
  }

  get bankDetails(): any {
    return this.formObj?.yatClaimBankDetailDTO || {};
  }

  get signWith(): string {
    return String(this.formObj?.signWith || '').toUpperCase();
  }

  get isInkSign(): boolean {
    return isInkSign(this.signWith);
  }

  get isESign(): boolean {
    return isESign(this.signWith);
  }

  get canDownloadInkSign(): boolean {
    return !isLegacyBlank(this.formObj?.inkSignedFileUrl);
  }

  get isYatraClaimMode(): boolean {
    return isYatraClaimMode(this.formObj?.claimMode);
  }

  get isNewlyMarried(): boolean {
    return String(this.ltc?.isNewlyMarried || '').toUpperCase() === 'YES';
  }

  get spouseDetails(): any {
    return this.ltc?.yatSpouseDetailDTO || {};
  }

  get ltcSubType(): string {
    const type = String(this.ltc?.ltcType || '').toUpperCase();
    if (type === 'SF' || type === 'SELF') return 'Self';
    if (type === 'PL' || type === 'PARTIAL') return 'Self and Family';
    return legacyValue(this.ltc?.ltcType, '');
  }

  get ltcTypeDescription(): string {
    return legacyValue(this.ltc?.codeLtcTypeDTO?.descr, legacyValue(this.ltc?.ltcType, ''));
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  downloadInkSigned(): void {
    this.$auth.viewFile(this.formObj?.inkSignedFileUrl);
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'LTC') return 'LTC';
    if (id === 'LTCA') return 'L';
    return 'L';
  }

  private parsePreviewResponse(response: any): void {
    const claims = unwrapPreviewObject(response?.object);
    const ltc = firstItem(claims?.yatLtcAdvDTOs);

    this.formObj = claims;
    this.preview = {
      claims,
      ltc,
      familyRows: asArray(claims?.yatFamilyDetailDTOs),
      travelRows: asArray(claims?.yatDtsDetailDTOs),
    };
  }

}


