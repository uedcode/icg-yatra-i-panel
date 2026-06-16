import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-preview-ty-duty',
  templateUrl: './preview-ty-duty.component.html',
  styleUrls: ['./preview-ty-duty.component.css'],
  standalone: false,
})
export class PreviewTyDutyComponent implements OnInit {
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
    tyDuty: {},
    travelRows: [],
    bankDetails: {},
    documentDtos: [],
    signWith: '',
    isInkSign: false,
    isESign: false,
    headingFormId: null,
    gxLabelPrefix: 'Gx',
    gxFormLabel: 'Gx Form',
    gxFormStatus: 'Not Attached',
    purposeType: 'Other',
    showPurpose: false,
    showGuestDetails: true,
    showUnitStation: false,
    showDutyStation: false,
    showExtendedFrom: false,
    showExtendedDuty: false,
    occDate: null,
    gxDate: null,
    accHToDutyCells: [],
  };
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
            response?.message || 'Unable to load TY Duty preview.',
            'danger'
          );
          return;
        }

        this.parseTyDutyPreviewResponse(response);
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
      : this.datePipe.transform(new Date(num), 'dd-MMM-yyyy');
  }

  display(value: any) {
    return value === null || value === undefined || value === '' ? '-' : value;
  }

  displayZero(value: any) {
    return value === null || value === undefined || value === '' ? 0 : value;
  }

  get previewHeading(): string {
    return this.subFormId === 'TYD'
      ? 'Requisition for TY Duty Claim'
      : 'Requisition for TY Duty Advance';
  }

  get headingFormId(): string | null {
    return this.preview?.headingFormId || null;
  }

  get tyDuty(): any {
    return this.preview?.tyDuty || {};
  }

  get bankDetails(): any {
    return this.preview?.bankDetails || {};
  }

  get hasGuestDetails(): boolean {
    return this.preview?.showGuestDetails;
  }

  get gxLabelPrefix(): string {
    return this.preview?.gxLabelPrefix || 'Gx';
  }

  get accHToDutyRateLabel(): string {
    return this.preview?.accHToDutyCells?.[0] || `${this.display(this.tyDuty?.accHToDutyPerDay)} per day`;
  }

  navigatePreview(route: string, claimId: any): void {
    if (!route || !claimId) return;
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '/creator';
    window.open(`${moduleUrl}/${route}?id=${claimId}`, '_blank');
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

  private parseTyDutyPreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    const tyDuty = this.normalizeTyDutyDetails(this.resolveTyDutyDetails(claims));
    const travelRows = this.resolveTravelRows(claims);
    const bankDetails = claims?.yatClaimBankDetailDTO || {};
    const signWith = String(claims?.signWith || '').toUpperCase();
    const isExtended = !this.isBlank(claims?.extendedAdvId);

    this.formObj = claims;
    this.documentDtos = this.asArray(claims?.yatDocsDTOs);
    this.preview = {
      claims,
      tyDuty,
      travelRows,
      bankDetails,
      documentDtos: this.documentDtos,
      signWith,
      isInkSign: signWith === 'IS' || signWith === 'IK',
      isESign: signWith === 'ES',
      headingFormId: this.valueOrNull(claims?.formId),
      gxLabelPrefix: isExtended ? 'Authority' : 'Gx',
      gxFormLabel: isExtended ? 'Authority' : 'Gx Form',
      gxFormStatus: this.isBlank(claims?.gxFormFileUrl) ? 'Not Attached' : 'Attached',
      purposeType: this.isBlank(tyDuty?.purposeType) ? 'Other' : tyDuty.purposeType,
      showPurpose: !this.isBlank(tyDuty?.purpose),
      showGuestDetails: this.isBlank(tyDuty?.purpose),
      showUnitStation: !this.isBlank(tyDuty?.tempTransTo) && !this.isBlank(tyDuty?.stationProceedingTo),
      showDutyStation: !this.isBlank(tyDuty?.dutyStation),
      showExtendedFrom: !this.isBlank(claims?.extendedAdvId),
      showExtendedDuty: !this.isBlank(claims?.refExtendedAdvId),
      occDate: this.asDate(claims?.occDate),
      gxDate: this.asDate(tyDuty?.gxDate),
      accHToDutyCells: this.buildAccHToDutyCells(tyDuty),
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

  private resolveTyDutyDetails(claims: any): any {
    return this.firstItem(
      claims?.yatTempDutyAdvDTOs ||
        claims?.yatTempDutyAdvDTO ||
        claims?.yatTempDutyAdv ||
        claims?.tempDutyAdvDTOs ||
        claims?.tempDutyAdvDTO ||
        claims?.tempDutyAdv
    );
  }

  private normalizeTyDutyDetails(raw: any): any {
    if (!raw) {
      return {};
    }

    return {
      ...raw,
      videPresentUnit: raw.videPresentUnit ?? raw.presentUnit,
      tempTransTo: raw.tempTransTo ?? raw.tempDutyTo,
      gxUnit: raw.gxUnit ?? raw.tempDutyTo,
      place: raw.place ?? raw.currentPlace,
      totalFoodCharge: raw.totalFoodCharge ?? raw.foodAmt ?? raw.foodAmtClaimed,
      totalHotelAcc: raw.totalHotelAcc ?? raw.hotelAmt ?? raw.hotelAmtClaimed,
      arrToDutyRs: raw.arrToDutyRs ?? raw.roadMileageAmt,
      totalAccHToDuty: raw.totalAccHToDuty ?? raw.taxiCharges ?? raw.taxiChargesClaimed,
      totalAmt: raw.totalAmt ?? raw.grandTotal ?? raw.netDueAmt,
      advAmt: raw.advAmt ?? raw.lessAmtVoucherAmt,
      dtsAmount: raw.dtsAmount ?? raw.travelDetailsDTSAmt,
      totalBudgetedAmt: raw.totalBudgetedAmt ?? raw.netDueAbsoluteAmt,
    };
  }

  private resolveTravelRows(claims: any): any[] {
    return this.asArray(claims?.yatDtsDetailDTOs);
  }

  private asArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }

  private isBlank(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  private valueOrNull(value: any): any {
    return this.isBlank(value) ? null : value;
  }

  private buildAccHToDutyCells(tyDuty: any): string[] {
    const availedCategory = String(tyDuty?.availedCategory ?? '');
    if (availedCategory === '1' || availedCategory === '2') {
      return [
        `${this.display(tyDuty?.accHToDutyKms)} per day(Kms)`,
        `${this.display(tyDuty?.accHToDutyPerDay)} per km`,
      ];
    }
    return [`${this.display(tyDuty?.accHToDutyPerDay)} per day`];
  }
}

