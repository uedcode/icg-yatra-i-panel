import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-common-preview-ty-duty-claim',
  templateUrl: './common-preview-ty-duty-claim.component.html',
  styleUrls: ['./common-preview-ty-duty-claim.component.scss'],
  standalone: false,
})
export class CommonPreviewTyDutyClaimComponent implements OnInit {
  readonly previewTitle = 'Requisition for TY Duty Claim';
  readonly defaultSubFormId = 'TYD';

  formObj: any = {};
  claim: any = {};
  advance: any = {};
  bankDetails: any = {};
  documentDtos: any[] = [];
  travelRows: any[] = [];
  familyRows: any[] = [];
  claimId: string | null = null;
  subFormId = this.defaultSubFormId;
  supplementaryId: string | null = null;
  userIdDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private $common: CommonService,
    public $auth: AuthService,
    private $claimApi: ClaimApiService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.id ?? null;
      this.supplementaryId = params?.supId ?? null;
      this.subFormId = this.normalizeSubFormId(
        params?.subFormId ?? this.route.snapshot.data?.['subFormId'] ?? this.defaultSubFormId
      );
      this.getClaimDetails();
    });
  }

  getClaimDetails(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for TY Duty claim preview.', 'danger');
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
    this.$claimApi.getSingleClaimPreview(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message ?? 'Unable to load TY Duty claim preview.', 'danger');
          return;
        }
        this.parseClaimPreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading TY Duty claim preview.', 'danger');
      },
    });
  }

  get summaryFields() {
    return [
      { label: 'Form ID', value: this.formObj?.formId },
      { label: 'Claim ID', value: this.formObj?.claimId },
      { label: 'Advance Claim ID', value: this.formObj?.advClaimId },
      { label: 'Supplementary Claim ID', value: this.formObj?.supClaimId },
      { label: 'Claim Status', value: this.formObj?.claimStatus },
      { label: 'Sign With', value: this.signLabel(this.formObj?.signWith) },
      { label: 'Occurrence Date', value: this.asDate(this.formObj?.occDate) },
      { label: 'GX Form', value: this.formObj?.gxFormFileUrl ? 'Attached' : 'Not Attached' },
    ].filter((field) => !this.isBlank(field.value));
  }

  get personalFields() {
    return [
      { label: 'Name', value: this.claim?.name },
      { label: 'Rank', value: this.claim?.rank },
      { label: 'Personnel Number', value: this.claim?.pno },
      { label: 'Pay Level', value: this.claim?.payLevel },
      { label: 'Basic Pay', value: this.claim?.basicPay },
      { label: 'Temporary Duty To', value: this.claim?.tempTransferToType },
      { label: 'Duty Station', value: this.claim?.dutyStation },
      { label: 'Unit', value: this.claim?.tempDutyTo },
      { label: 'Applied To', value: this.claim?.appliedTo },
      { label: 'Station Proceeding To', value: this.claim?.stationProceedingTo },
      { label: 'Present Unit', value: this.claim?.presentUnit },
      { label: 'Probable Duration (Days)', value: this.claim?.duration },
    ].filter((field) => !this.isBlank(field.value));
  }

  get claimFields() {
    return [
      { label: 'Purpose Type', value: this.claim?.purposeType ?? 'Other' },
      { label: 'Purpose', value: this.claim?.purpose },
      { label: 'GX Number', value: this.claim?.gxNo },
      { label: 'GX Date', value: this.asDate(this.claim?.gxDate) },
      { label: 'Movement Date', value: this.asDate(this.formObj?.occDate) },
      { label: 'Place', value: this.claim?.currentPlace },
      { label: 'Travel Details Amount', value: this.amount(this.claim?.travelDetailsAmt) },
      { label: 'DTS Amount', value: this.amount(this.claim?.travelDetailsDTSAmt) },
      { label: 'Other Charges', value: this.amount(this.claim?.otherChargeAmt) },
      { label: 'Grand Total', value: this.amount(this.claim?.grandTotal) },
      { label: 'Net Amount Due', value: this.amount(this.claim?.netDueAbsoluteAmt) },
    ].filter((field) => !this.isBlank(field.value));
  }

  get bankFields() {
    return [
      { label: 'Bank Name', value: this.bankDetails?.bankName },
      { label: 'Account Number', value: this.bankDetails?.bankAccNo },
      { label: 'IFSC Code', value: this.bankDetails?.ifscCode },
      { label: 'MICR Code', value: this.bankDetails?.micrCode },
    ].filter((field) => !this.isBlank(field.value));
  }

  asDate(value: any): any {
    if (!value) return null;
    const num = Number(value);
    return Number.isNaN(num) ? value : this.datePipe.transform(new Date(num), 'dd-MMM-yyyy');
  }

  display(value: any): any {
    return this.isBlank(value) ? '-' : value;
  }

  amount(value: any): any {
    return this.isBlank(value) ? null : value;
  }

  goBack(): void {
    this.location.back();
  }

  openRelatedPreview(route: string, claimId: any): void {
    if (!route) return;
    if (!claimId) return;
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '/creator';
    window.open(`${moduleUrl}/${route}?id=${claimId}`, '_blank');
  }

  hasRelatedClaims(): boolean {
    if (!this.isBlank(this.formObj?.advClaimId)) return true;
    return !this.isBlank(this.formObj?.supClaimId);
  }

  private parseClaimPreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    this.formObj = claims;
    this.claim = this.firstItem(claims?.yatTempDutyClaimDTOs);
    this.advance = this.firstItem(claims?.yatTempDutyAdvDTOs);
    this.travelRows = this.resolveTravelRows(claims);
    this.familyRows = this.asArray(this.claim?.yatTempDutyClaimFamilyDTOs);
    this.documentDtos = this.asArray(claims?.yatDocsDTOs);
    this.bankDetails = claims?.yatClaimBankDetailDTO ?? {};
  }

  private resolveTravelRows(claims: any): any[] {
    return this.asArray(claims?.yatDtsDetailDTOs).map((row) => ({
      from: row?.fromPlace,
      to: row?.toPlace,
      mode: row?.travelMode,
      dts: row?.isDts,
      amount: row?.amount,
      reason: row?.reasonForNotUsingDts,
      remarks: row?.remarks,
    }));
  }

  private unwrapClaimObject(object: any): any {
    return Array.isArray(object) ? object[0] ?? {} : object ?? {};
  }

  private firstItem(value: any): any {
    return Array.isArray(value) ? value[0] ?? {} : value ?? {};
  }

  private asArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId ?? '').toUpperCase();
    if (['TY', 'T', 'TYA'].includes(id)) return 'TYD';
    return id.length ? id : this.defaultSubFormId;
  }

  private signLabel(signWith: any): string {
    const sign = String(signWith ?? '').toUpperCase();
    if (sign === 'ES') return 'eSign';
    if (['IS', 'IK'].includes(sign)) return 'Ink Sign';
    return signWith;
  }

  private isBlank(value: any): boolean {
    if (value == null) return true;
    return value === '';
  }
}

