import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-approver-preview-movement-update-claim',
  templateUrl: './preview-movement-update-claim.component.html',
  styleUrls: ['./preview-movement-update-claim.component.scss'],
  standalone: false,
})
export class ClaimMovementUpdateComponent implements OnInit {
  readonly yatTravelMode = {
    yatra: 'YT',
    manual: 'MN',
    nil: 'NL',
    supplementary: 'SP',
  } as const;

  claimId = '';
  subFormId = '';
  movement: any = null;
  gxDetails: any[] = [];
  userIdDetails: any;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private datePipe: DatePipe,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();

    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('claimId') || params.get('id') || '';
      this.subFormId = this.normalizeSubFormId(params.get('subFormId') || '');
      this.movement = null;
      this.gxDetails = [];

      if (this.claimId) {
        this.loadMovement();
      }
    });
  }

  loadMovement(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        userId: this.userIdDetails?.userId || '',
      },
    };

    this.$common.showLoader();
    this.$claimApi.getSingleMovement(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        const row = Array.isArray(response?.object) ? response.object[0] || null : response?.object || null;
        this.movement = row;
        this.gxDetails = Array.isArray(row?.yatTempDutyClaimGxDTOs) ? row.yatTempDutyClaimGxDTOs : [];
        this.subFormId = this.normalizeSubFormId(
          row?.purpose || row?.subFormId || row?.codeSubFormDTO?.subFormId || this.subFormId
        );
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to load movement details.', 'danger');
      },
    });
  }

  openVoucherPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Claim id is not available.', 'danger');
      return;
    }

    const query = [`claimId=${encodeURIComponent(this.claimId)}`];
    if (this.subFormId) {
      query.push(`subFormId=${encodeURIComponent(this.legacyClaimSubFormId(this.subFormId))}`);
    }
    window.open(`${this.$auth.getModuleName()}/preview-voucher?${query.join('&')}`, '_blank');
  }

  goBack(): void {
    this.location.back();
  }

  display(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  asDate(value: any): string {
    if (!value) return '-';
    return this.datePipe.transform(value, 'dd-MMM-yyyy') || '-';
  }

  modeLabel(mode: any): string {
    const id = String(mode || '').toUpperCase();
    if (id === this.yatTravelMode.yatra) return 'YATRA Advance';
    if (id === this.yatTravelMode.manual) return 'Manual Advance';
    if (id === this.yatTravelMode.nil) return 'Nil Advance';
    if (id === this.yatTravelMode.supplementary || id === 'SUP') return 'Supplementary';
    return this.display(mode);
  }

  purposeLabel(subFormId: any): string {
    const id = this.canonicalSubFormId(subFormId);
    if (id === 'P') return 'PMT Duty Advance';
    if (id === 'T') return 'TY Duty Advance';
    if (id === 'F') return 'FTE Advance';
    if (id === 'L') return 'LTC Advance';
    if (id === 'RS') return 'Resettlement Claim';
    return this.display(subFormId);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'R' || id === 'RES' || id === 'RESCLM') return 'RS';
    return id;
  }

  private canonicalSubFormId(subFormId: any): string {
    const id = this.normalizeSubFormId(subFormId);
    if (id === 'PMT' || id === 'PMTA' || id === 'PMTCLM') return 'P';
    if (id === 'TYD' || id === 'TYA' || id === 'TY' || id === 'TYCLM') return 'T';
    if (id === 'FTE' || id === 'FTEA' || id === 'FTECLM') return 'F';
    if (id === 'LTC' || id === 'LTCA' || id === 'LTCCLM') return 'L';
    return id;
  }

  private legacyClaimSubFormId(subFormId: any): string {
    const id = this.canonicalSubFormId(subFormId);
    if (id === 'P') return 'PMT';
    if (id === 'T') return 'TYD';
    if (id === 'F') return 'FTE';
    if (id === 'L') return 'LTC';
    if (id === 'RS') return 'RS';
    return this.normalizeSubFormId(subFormId);
  }
}

