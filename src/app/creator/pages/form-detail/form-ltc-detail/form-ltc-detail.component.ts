import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-ltc-detail',
  templateUrl: './form-ltc-detail.component.html',
  styleUrls: ['./form-ltc-detail.component.css'],
  standalone: false,
})
export class FormLtcDetailComponent implements OnInit {
  formObj: any = null;
  claimId: string | null = null;
  subFormId: string = 'L';
  documentDtos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.claimId =
      this.route.snapshot.queryParamMap.get('claimId') ||
      this.route.snapshot.queryParamMap.get('id') ||
      this.route.snapshot.queryParamMap.get('formId') ||
      this.route.snapshot.queryParamMap.get('supId');
    this.subFormId = this.normalizeSubFormId(
      this.route.snapshot.queryParamMap.get('subFormId')
    );
    if (this.claimId) this.getClaimDetails();
  }

  getClaimDetails(): void {
    this.$common.showLoader();

    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.subFormId,
        isPreview: 'true',
      },
    };

    this.$claim.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        let obj = response?.object;
        if (Array.isArray(obj)) obj = obj[0] || null;
        this.formObj = obj;
        this.documentDtos = Array.isArray(obj?.yatDocsDTOs) ? obj.yatDocsDTOs : [];
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

  goBack(): void {
    this.location.back();
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'LTCA' || id === 'LTC') return 'L';
    return 'L';
  }
}

