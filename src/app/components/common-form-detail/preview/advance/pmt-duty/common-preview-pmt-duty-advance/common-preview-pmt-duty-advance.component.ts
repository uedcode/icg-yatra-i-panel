import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

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
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
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
    const signWith = String(this.claims?.signWith || '').toUpperCase();
    return signWith === 'IS' || signWith === 'IK';
  }

  get isESign(): boolean {
    return String(this.claims?.signWith || '').toUpperCase() === 'ES';
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

  goBack(): void {
    this.location.back();
  }

  private loadPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for PMT Duty preview.', 'danger');
      return;
    }

    this.$common.showLoader();
    this.$claim.getSingleClaim({
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
        this.claims = Array.isArray(response?.object) ? response.object[0] || {} : response?.object || {};
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Error while loading PMT Duty preview.', 'danger');
      },
    });
  }
}
