import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

@Component({
  selector: 'app-common-preview-ty-duty-advance',
  templateUrl: './common-preview-ty-duty-advance.component.html',
  styleUrls: ['./common-preview-ty-duty-advance.component.css'],
  standalone: false,
})
export class CommonPreviewTyDutyAdvanceComponent implements OnInit {
  claims: any = {};
  claimId: string | null = null;
  supplementaryId: string | null = null;
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
      this.supplementaryId = params?.supId || null;
      this.loadPreview();
    });
  }

  get heading(): string {
    return 'Requisition for TY Duty Advance';
  }

  get tyDuty(): any {
    return this.claims?.yatTempDutyAdvDTOs?.[0] || {};
  }

  get travelRows(): any[] {
    return Array.isArray(this.claims?.yatDtsDetailDTOs) ? this.claims.yatDtsDetailDTOs : [];
  }

  get bankDetails(): any {
    return this.claims?.yatClaimBankDetailDTO || {};
  }

  get signWith(): string {
    return String(this.claims?.signWith || '').toUpperCase();
  }

  get isInkSign(): boolean {
    return this.signWith === 'IS' || this.signWith === 'IK';
  }

  get isESign(): boolean {
    return this.signWith === 'ES';
  }

  get gxLabelPrefix(): string {
    return this.isBlank(this.claims?.extendedAdvId) ? 'Gx' : 'Authority';
  }

  get gxFormLabel(): string {
    return this.isBlank(this.claims?.extendedAdvId) ? 'Gx Form' : 'Authority';
  }

  get gxFormStatus(): string {
    return this.isBlank(this.claims?.gxFormFileUrl) ? 'Not Attached' : 'Attached';
  }

  get purposeType(): string {
    return this.isBlank(this.tyDuty?.purposeType) ? 'Other' : this.tyDuty.purposeType;
  }

  get showPurpose(): boolean {
    return !this.isBlank(this.tyDuty?.purpose);
  }

  get showGuestDetails(): boolean {
    return this.isBlank(this.tyDuty?.purpose);
  }

  get showUnitStation(): boolean {
    return !this.isBlank(this.tyDuty?.tempTransTo) && !this.isBlank(this.tyDuty?.stationProceedingTo);
  }

  get showDutyStation(): boolean {
    return !this.isBlank(this.tyDuty?.dutyStation);
  }

  get showExtendedFrom(): boolean {
    return !this.isBlank(this.claims?.extendedAdvId);
  }

  get showExtendedDuty(): boolean {
    return !this.isBlank(this.claims?.refExtendedAdvId);
  }

  get gxDate(): string | null {
    return this.asDate(this.tyDuty?.gxDate);
  }

  get occDate(): string | null {
    return this.asDate(this.claims?.occDate);
  }

  get accHToDutyCells(): string[] {
    if (this.tyDuty?.availedCategory === '1' || this.tyDuty?.availedCategory === '2') {
      return [
        `${this.display(this.tyDuty?.accHToDutyKms)} per day(Kms)`,
        `${this.display(this.tyDuty?.accHToDutyPerDay)} per km`,
      ];
    }

    return [`${this.display(this.tyDuty?.accHToDutyPerDay)} per day`];
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
    return this.isBlank(value) ? '-' : value;
  }

  displayZero(value: any): any {
    return this.isBlank(value) ? 0 : value;
  }

  navigatePreview(route: string, claimId: any): void {
    if (!route || !claimId) return;
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '';
    window.open(`${moduleUrl}/${route}?id=${claimId}`, '_blank');
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private loadPreview(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for TY Duty preview.', 'danger');
      return;
    }

    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: 'T',
        isFetch: 'true',
        isPreview: 'true',
        userId: this.userIdDetails?.userId ?? '',
      },
    };

    if (this.supplementaryId) {
      (config.headers as any).supCLaimId = this.supplementaryId;
    }

    this.$common.showLoader();
    this.$claimApi.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message || 'Unable to load TY Duty preview.', 'danger');
          return;
        }

        this.claims = Array.isArray(response?.object) ? response.object[0] || {} : response?.object || {};
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Error while loading TY Duty preview.', 'danger');
      },
    });
  }

  private isBlank(value: any): boolean {
    return value === null || value === undefined || value === '';
  }
}

