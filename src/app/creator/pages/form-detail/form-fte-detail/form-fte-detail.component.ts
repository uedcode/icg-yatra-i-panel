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
  claimId: string | null = null;
  subFormId: string = 'F';
  documentDtos: any[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.claimId =
        params?.claimId || params?.id || params?.formId || params?.supId || null;
      this.subFormId = this.normalizeSubFormId(params?.subFormId);
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
        isPreview: 'true',
      },
    };

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

        const obj = Array.isArray(response?.object)
          ? response.object[0]
          : response?.object;
        this.formObj = obj || {};
        this.documentDtos = this.formObj?.yatDocsDTOs || [];
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

  goBack() {
    this.location.back();
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'FTEA' || id === 'FTE') return 'F';
    return 'F';
  }
}

