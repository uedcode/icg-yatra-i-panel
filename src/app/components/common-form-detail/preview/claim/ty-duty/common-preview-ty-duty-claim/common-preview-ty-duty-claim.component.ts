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
      this.claimId = params?.id || params?.claimId || params?.formId || params?.supId || null;
      this.supplementaryId = params?.supId || null;
      this.subFormId = this.normalizeSubFormId(
        params?.subFormId || this.route.snapshot.data?.['subFormId'] || this.defaultSubFormId
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
          this.$common.showMessage(response?.message || 'Unable to load TY Duty claim preview.', 'danger');
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
      { label: 'Form ID', value: this.formObj?.formId || this.formObj?.claimId || this.claimId },
      { label: 'Claim ID', value: this.formObj?.claimId },
      { label: 'Advance Claim ID', value: this.formObj?.advClaimId },
      { label: 'Supplementary Claim ID', value: this.formObj?.supClaimId },
      { label: 'Claim Status', value: this.formObj?.claimStatus || this.formObj?.status },
      { label: 'Sign With', value: this.signLabel(this.formObj?.signWith) },
      { label: 'Occurrence Date', value: this.asDate(this.formObj?.occDate) },
      { label: 'GX Form', value: this.formObj?.gxFormFileUrl ? 'Attached' : 'Not Attached' },
    ].filter((field) => !this.isBlank(field.value));
  }

  get personalFields() {
    return [
      { label: 'Name', value: this.claim?.name || this.formObj?.name },
      { label: 'Rank', value: this.claim?.rank || this.formObj?.rank },
      { label: 'Personnel Number', value: this.claim?.personnelNumber || this.claim?.perNo || this.formObj?.perNo },
      { label: 'Pay Level', value: this.claim?.payLevel || this.formObj?.payLevel },
      { label: 'Present Unit', value: this.claim?.presentUnit || this.claim?.videPresentUnit || this.advance?.presentUnit },
      { label: 'Applied To', value: this.claim?.appliedTo || this.advance?.appliedTo },
      { label: 'Temporary Duty To', value: this.claim?.tempDutyTo || this.claim?.tempTransTo || this.advance?.tempDutyTo },
      { label: 'Probable Duration (Days)', value: this.claim?.duration || this.claim?.probableDuration || this.advance?.duration },
    ].filter((field) => !this.isBlank(field.value));
  }

  get claimFields() {
    return [
      { label: 'Purpose Type', value: this.claim?.purposeType },
      { label: 'Purpose', value: this.claim?.purpose },
      { label: 'GX Unit', value: this.claim?.gxUnit || this.advance?.gxUnit },
      { label: 'GX Number', value: this.claim?.gxNumber || this.claim?.gxNo || this.advance?.gxNo },
      { label: 'GX Date', value: this.asDate(this.claim?.gxDate || this.advance?.gxDate) },
      { label: 'Movement Date', value: this.asDate(this.claim?.movementDate || this.formObj?.occDate) },
      { label: 'Duty Station', value: this.claim?.dutyStation || this.claim?.stationProceedingTo },
      { label: 'Place', value: this.claim?.place || this.claim?.currentPlace },
      { label: 'Advance Amount', value: this.amount(this.claim?.advAmt || this.formObj?.advAmt) },
      { label: 'Claim Amount', value: this.amount(this.claim?.claimAmt || this.claim?.totalAmt || this.formObj?.claimAmt) },
      { label: 'DTS Amount', value: this.amount(this.claim?.dtsAmount || this.claim?.travelDetailsDTSAmt) },
      { label: 'Net Due', value: this.amount(this.claim?.netDueAmt || this.claim?.totalBudgetedAmt) },
    ].filter((field) => !this.isBlank(field.value));
  }

  get bankFields() {
    return [
      { label: 'Bank Name', value: this.bankDetails?.bankName },
      { label: 'Account Number', value: this.bankDetails?.accountNo || this.bankDetails?.accountNumber },
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
    if (!route || !claimId) return;
    const moduleUrl = this.$auth.getModuleName ? this.$auth.getModuleName() : '/creator';
    window.open(`${moduleUrl}/${route}?id=${claimId}`, '_blank');
  }

  private parseClaimPreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    this.formObj = claims;
    this.claim = this.firstItem(
      claims?.yatTempDutyClaimDTOs || claims?.yatTempDutyClaimDTO || claims?.tempDutyClaimDTOs
    );
    this.advance = this.firstItem(claims?.yatTempDutyAdvDTOs || claims?.yatTempDutyAdvDTO);
    this.travelRows = this.resolveTravelRows(claims);
    this.familyRows = this.asArray(claims?.yatFamilyDetailDTOs || claims?.familyDetails);
    this.documentDtos = this.asArray(claims?.yatDocsDTOs || claims?.documentDtos);
    this.bankDetails = claims?.yatClaimBankDetailDTO || {};
  }

  private resolveTravelRows(claims: any): any[] {
    return this.asArray(claims?.yatClaimTravelDetailsDTOs || claims?.yatDtsDetailDTOs).map((row) => ({
      from: row?.fromPlace || row?.from || row?.source || row?.fromStation,
      to: row?.toPlace || row?.to || row?.destination || row?.toStation,
      mode: row?.travelMode || row?.modeOfTravel || row?.mode,
      dts: row?.isDts || row?.dts || row?.dtsTravel,
      amount: row?.amount || row?.claimAmt || row?.travelAmount,
      reason: row?.reasonForNotUsingDts || row?.reasonForNotUsingDTS || row?.reason,
      remarks: row?.remarks,
    }));
  }

  private unwrapClaimObject(object: any): any {
    return Array.isArray(object) ? object[0] || {} : object || {};
  }

  private firstItem(value: any): any {
    return Array.isArray(value) ? value[0] || {} : value || {};
  }

  private asArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'TY' || id === 'T' || id === 'TYA') return 'TYD';
    return id || this.defaultSubFormId;
  }

  private signLabel(signWith: any): string {
    const sign = String(signWith || '').toUpperCase();
    if (sign === 'ES') return 'eSign';
    if (sign === 'IS' || sign === 'IK') return 'Ink Sign';
    return signWith;
  }

  private isBlank(value: any): boolean {
    return value === null || value === undefined || value === '';
  }
}

