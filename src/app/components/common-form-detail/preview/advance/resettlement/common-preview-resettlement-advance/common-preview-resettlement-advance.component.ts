import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

@Component({
  selector: 'app-common-preview-resettlement-advance',
  templateUrl: './common-preview-resettlement-advance.component.html',
  styleUrls: ['./common-preview-resettlement-advance.component.scss'],
  standalone: false
})
export class CommonPreviewResettlementAdvanceComponent implements OnInit {
  readonly previewTitle = 'Resettlement Preview';
  readonly defaultSubFormId = 'RS';

  formObj: any = {};
  advance: any = {};
  documentDtos: any[] = [];
  familyRows: any[] = [];
  travelRows: any[] = [];
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
    private $claimApi: ClaimApiService,
    private previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.id || null;
      this.supplementaryId = params?.supId || null;
      this.subFormId = this.normalizeSubFormId(
        params?.subFormId || this.route.snapshot.data?.['subFormId'] || this.defaultSubFormId
      );
      this.getClaimDetails();
    });
  }

  getClaimDetails(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for resettlement preview.', 'danger');
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
    this.$claimApi.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(response?.message || 'Unable to load resettlement preview.', 'danger');
          return;
        }
        this.parsePreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading resettlement preview.', 'danger');
      },
    });
  }

  get summaryFields() {
    return [
      { label: 'Form ID', value: this.formObj?.formId || this.formObj?.claimId || this.claimId },
      { label: 'Claim ID', value: this.formObj?.claimId },
      { label: 'Claim Status', value: this.formObj?.claimStatus || this.formObj?.status },
      { label: 'Sign With', value: this.signLabel(this.formObj?.signWith) },
      { label: 'Occurrence Date (Movement Date)', value: this.asDate(this.formObj?.occDate) },
      { label: 'GX Form', value: this.formObj?.gxFormFileUrl ? 'Attached' : 'Not Attached' },
    ].filter((field) => !this.isBlank(field.value));
  }

  get personalFields() {
    return [
      { label: 'Name', value: this.advance?.name || this.formObj?.name },
      { label: 'Rank', value: this.advance?.rank || this.formObj?.rank },
      { label: 'Personnel Number', value: this.advance?.pno || this.advance?.personnelNumber || this.formObj?.pno },
      { label: 'Pay Level', value: this.advance?.payLevel || this.formObj?.payLevel },
      { label: 'Basic Pay (In Rs.)', value: this.advance?.basicPay },
      { label: 'Permanent Transfer To', value: this.advance?.permTransTo },
      { label: 'Present Unit', value: this.advance?.videPresentUnit || this.advance?.presentUnit },
      { label: 'Applied To', value: this.advance?.appliedTo || this.formObj?.codeUnitDTO?.descr },
    ].filter((field) => !this.isBlank(field.value));
  }

  get resettlementFields() {
    return [
      { label: 'PMT Type', value: this.advance?.pmtType },
      { label: 'Family Type', value: this.advance?.familyType },
      { label: 'From Station', value: this.advance?.stnFrom || this.advance?.stationFrom },
      { label: 'To Station', value: this.advance?.stnTo || this.advance?.stationTo },
      { label: 'Distance between stations', value: this.advance?.distance },
      { label: 'GX Unit', value: this.advance?.gxUnit },
      { label: 'GX Number', value: this.advance?.gxNumber || this.advance?.gxNo },
      { label: 'GX Date', value: this.asDate(this.advance?.gxDate) },
      { label: 'Advance Amount', value: this.advance?.advAmt },
      { label: 'Total Amount', value: this.advance?.totalAmt },
      { label: 'Total Budgeted Amount', value: this.advance?.totalBudgetedAmt },
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

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private parsePreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    this.formObj = claims;
    this.advance = this.firstItem(claims?.yatPermDutyAdvDTOs || claims?.yatPermDutyAdvDTO);
    this.familyRows = this.asArray(claims?.yatFamilyDetailDTOs || claims?.familyDetails);
    this.travelRows = this.asArray(claims?.yatDtsDetailDTOs).map((row) => ({
      from: row?.source || row?.fromPlace || row?.from,
      to: row?.destination || row?.toPlace || row?.to,
      mode: row?.modeOfTravel || row?.travelMode,
      dts: row?.isDts || row?.dts,
      amount: row?.amount,
      reason: row?.reasonForNoDts || row?.reasonForNotUsingDts || row?.reason,
      remarks: row?.remarks,
    }));
    this.documentDtos = this.asArray(claims?.yatDocsDTOs || claims?.documentDtos);
  }

  private normalizeSubFormId(subFormId: any): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'P' || id === 'PMT' || id === 'PMTA') return 'P';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return 'RS';
    return this.defaultSubFormId;
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

