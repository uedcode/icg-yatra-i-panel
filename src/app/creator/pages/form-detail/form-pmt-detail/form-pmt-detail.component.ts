import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-pmt-detail',
  templateUrl: './form-pmt-detail.component.html',
  styleUrls: ['./form-pmt-detail.component.css'],
  standalone: false,
})
export class FormPmtDetailComponent implements OnInit {
  previewKind: 'advance' | 'claim' = 'advance';
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
  subFormId: string = 'P';
  documentDtos: any[] = [];
  today: string | null = null;

  ngOnInit() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.subFormId = this.normalizeSubFormId(this.route.snapshot.data?.['subFormId']);
    this.previewKind =
      String(this.route.snapshot.data?.['previewKind'] || '').toLowerCase() === 'claim'
        ? 'claim'
        : 'advance';
    this.route.queryParams.subscribe((params) => {
      this.claimId =
        params?.claimId || params?.id || params?.formId || params?.supId || null;
      this.subFormId = this.normalizeSubFormId(params?.subFormId || this.subFormId);
      this.getClaimDetails();
    });
  }

  getClaimDetails() {
    if (!this.claimId) {
      this.$common.showMessage(`Missing claim id for ${this.getPreviewDisplayName()}.`, 'danger');
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
            response?.message || `Unable to load ${this.getPreviewDisplayName()}.`,
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
        this.$common.showMessage(`Error while loading ${this.getPreviewDisplayName()}.`, 'danger');
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

  goBack() {
    this.location.back();
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'PMTA' || id === 'PMT') return 'P';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return 'RS';
    return 'P';
  }

  isResettlementSubForm(): boolean {
    return this.subFormId === 'RS';
  }

  get previewHeading(): string {
    if (this.isResettlementSubForm()) {
      return this.previewKind === 'claim' ? 'Resettlement Claim Preview' : 'Resettlement Preview';
    }
    return this.previewKind === 'claim' ? 'PMT Duty Claim Preview' : 'PMT Advance Preview';
  }

  get detailHeading(): string {
    return this.isResettlementSubForm() ? 'Resettlement Details' : 'PMT Advance Details';
  }

  private getPreviewDisplayName(): string {
    if (this.isResettlementSubForm()) {
      return this.previewKind === 'claim' ? 'resettlement claim preview' : 'resettlement preview';
    }
    return this.previewKind === 'claim' ? 'PMT claim preview' : 'PMT preview';
  }
}

