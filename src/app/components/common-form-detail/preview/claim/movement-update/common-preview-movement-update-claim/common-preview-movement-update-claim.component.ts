import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { unwrapNullablePreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';

@Component({
  selector: 'app-common-preview-movement-update-claim',
  templateUrl: './common-preview-movement-update-claim.component.html',
  styleUrls: ['./common-preview-movement-update-claim.component.scss'],
  standalone: false,
})
export class CommonPreviewMovementUpdateClaimComponent implements OnInit {
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
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $common: CommonService,
    private previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();

    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') ?? '';
      this.subFormId = params.get('subFormId') ?? '';
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
        userId: this.userIdDetails?.userId ?? '',
      },
    };

    this.$common.showLoader();
    this.$claimApi.getSingleMovement(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        const row = unwrapNullablePreviewObject(response?.object);
        this.movement = row;
        this.gxDetails = Array.isArray(row?.yatTempDutyClaimGxDTOs) ? row.yatTempDutyClaimGxDTOs : [];
        this.subFormId = row?.subFormId ?? this.subFormId;
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

    this.previewWindow.open(this.$auth.getModuleName(), 'preview-voucher', {
      id: this.claimId,
      subFormId: this.subFormId,
    });
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  display(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  modeLabel(mode: any): string {
    const id = String(mode ?? '').toUpperCase();
    if (id === this.yatTravelMode.yatra) return 'YATRA Advance';
    if (id === this.yatTravelMode.manual) return 'Manual Advance';
    if (id === this.yatTravelMode.nil) return 'Nil Advance';
    if (id === this.yatTravelMode.supplementary) return 'Supplementary';
    return this.display(mode);
  }

  purposeLabel(subFormId: any): string {
    const id = String(subFormId ?? '').toUpperCase();
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
}

