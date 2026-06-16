import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-tyduty-detail',
  templateUrl: './form-tyduty-detail.component.html',
  styleUrls: ['./form-tyduty-detail.component.css'],
  standalone: false,
})
export class FormTydutyDetailComponent implements OnInit {
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private $common: CommonService,
    public $auth: AuthService,
    private $claim: ClaimService
  ) {}

  formObj: any = {};
  claimId: string | null = null;
  subFormId: string = 'T';
  supplementaryId: string | null = null;
  userIdDetails: any;
  documentDtos: any[] = [];

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.subFormId = this.normalizeSubFormId(this.route.snapshot.data?.['subFormId']);
    this.route.queryParams.subscribe((params) => {
      this.claimId =
        params?.claimId || params?.id || params?.formId || params?.supId || null;
      this.supplementaryId = params?.supId || null;
      this.subFormId = this.normalizeSubFormId(params?.subFormId || this.subFormId);
      this.getClaimDetails();
    });
  }

  getClaimDetails() {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for TY Duty preview.', 'danger');
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
    this.$claim.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(
            response?.message || 'Unable to load TY Duty preview.',
            'danger'
          );
          return;
        }

        const obj = Array.isArray(response?.object)
          ? response.object[0]
          : response?.object;
        this.formObj = obj || {};
        this.documentDtos = this.formObj?.yatDocsDTOs || [];
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading TY Duty preview.', 'danger');
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

  get previewHeading(): string {
    return this.subFormId === 'TYD' ? 'TY Duty Claim Preview' : 'TY Duty Advance Preview';
  }

  get detailHeading(): string {
    return this.subFormId === 'TYD' ? 'TY Duty Claim Details' : 'TY Duty Advance Details';
  }

  goBack() {
    this.location.back();
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'TYD' || id === 'TYC' || id === 'TYCLM') return 'TYD';
    if (id === 'TYA' || id === 'TY') return 'T';
    return 'T';
  }
}

