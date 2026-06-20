import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-common-preview-ltc-advance',
  templateUrl: './common-preview-ltc-advance.component.html',
  styleUrls: ['./common-preview-ltc-advance.component.css'],
  standalone: false,
})
export class CommonPreviewLtcAdvanceComponent implements OnInit {
  formObj: any = null;
  preview: any = {
    claims: {},
    ltc: {},
    familyRows: [],
    travelRows: [],
    documentDtos: [],
  };
  claimId: string | null = null;
  subFormId: string = 'L';
  supplementaryId: string | null = null;
  userIdDetails: any;
  documentDtos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $common: CommonService
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

  asDate(value: any): string {
    if (!value) return '-';
    return this.datePipe.transform(value, 'dd-MMM-yyyy') || '-';
  }

  display(value: any): string {
    if (value === null || value === undefined) return '-';
    const str = String(value).trim();
    return str ? str : '-';
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

  get previewHeading(): string {
    return this.subFormId === 'LTC' ? 'LTC Claim Preview' : 'LTC Advance Preview';
  }

  goBack(): void {
    this.location.back();
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'LTC') return 'LTC';
    if (id === 'LTCA') return 'L';
    return 'L';
  }

  private parsePreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    const ltc = this.firstItem(claims?.yatLtcAdvDTOs);

    this.formObj = claims;
    this.documentDtos = this.asArray(claims?.yatDocsDTOs);
    this.preview = {
      claims,
      ltc,
      familyRows: this.asArray(claims?.yatFamilyDetailDTOs),
      travelRows: this.asArray(claims?.yatDtsDetailDTOs),
      documentDtos: this.documentDtos,
    };
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

  private asArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }
}


