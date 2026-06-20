import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

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
    private datePipe: DatePipe,
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
    const signWith = String(this.claims?.signWith || '').toUpperCase();
    return signWith === 'IS' || signWith === 'IK';
  }

  get isESign(): boolean {
    return String(this.claims?.signWith || '').toUpperCase() === 'ES';
  }

  get gxLabelPrefix(): string {
    return this.claims?.extendedAdvId ? 'Authority' : 'Gx';
  }

  get gxFormLabel(): string {
    return this.claims?.extendedAdvId ? 'Authority' : 'Gx Form';
  }

  asDate(value: any): string | null {
    if (!value) return null;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return this.datePipe.transform(value, 'dd-MMM-yyyy') || value;
    }
    return this.datePipe.transform(new Date(parsed), 'dd-MMM-yyyy');
  }

  display(value: any): any {
    return value === null || value === undefined || value === '' ? '-' : value;
  }

  displayZero(value: any): any {
    return value === null || value === undefined || value === '' ? 0 : value;
  }

  navigatePreview(route: string, claimId: any): void {
    if (!route || !claimId) return;
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
    this.previewWindow.open(moduleUrl, route, { id: claimId });
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
        this.claims = Array.isArray(response?.object) ? response.object[0] || {} : response?.object || {};
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Error while loading FTE Advance preview.', 'danger');
      },
    });
  }
}

