import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-fte-detail',
  templateUrl: './form-fte-detail.component.html',
  styleUrls: ['./form-fte-detail.component.css'],
  standalone: false,
})
export class FormFteDetailComponent implements OnInit {
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private $common: CommonService,
    public $auth: AuthService,
    private $claim: ClaimService
  ) {}

  formObj: any = {};
  preview: any = {
    claims: {},
    fte: {},
    travelRows: [],
    documentDtos: [],
  };
  claimId: string | null = null;
  subFormId: string = 'F';
  supplementaryId: string | null = null;
  userIdDetails: any;
  documentDtos: any[] = [];

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.subFormId = this.normalizeSubFormId(this.route.snapshot.data?.['subFormId']);
    this.route.queryParams.subscribe((params) => {
      this.claimId =
        params?.id || params?.claimId || params?.formId || params?.supId || null;
      this.supplementaryId = params?.supId || null;
      this.subFormId = this.normalizeSubFormId(params?.subFormId || this.subFormId);
      this.getClaimDetails();
    });
  }

  getClaimDetails() {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for FTE preview.', 'danger');
      return;
    }

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

    this.$common.showLoader();
    this.$claim.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(
            response?.message || 'Unable to load FTE preview.',
            'danger'
          );
          return;
        }

        this.parsePreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading FTE preview.', 'danger');
      },
    });
  }

  asDate(value: any) {
    if (!value) return null;
    const num = Number(value);
    return Number.isNaN(num)
      ? value
      : this.datePipe.transform(new Date(num), 'yyyy-MM-dd');
  }

  display(value: any) {
    return value === null || value === undefined || value === '' ? '-' : value;
  }

  get fte(): any {
    return this.preview?.fte || {};
  }

  get travelRows(): any[] {
    return this.preview?.travelRows || [];
  }

  get previewHeading(): string {
    return this.subFormId === 'FTE' ? 'FTE Claim Preview' : 'FTE Advance Preview';
  }

  get detailHeading(): string {
    return this.subFormId === 'FTE' ? 'FTE Claim Details' : 'FTE Advance Details';
  }

  goBack() {
    this.location.back();
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'FTE') return 'FTE';
    if (id === 'FTEA') return 'F';
    return 'F';
  }

  private parsePreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    const fte = this.firstItem(claims?.yatForeignDutyAdvDTOs);

    this.formObj = claims;
    this.documentDtos = this.asArray(claims?.yatDocsDTOs);
    this.preview = {
      claims,
      fte,
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

