import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { isLegacyBlank, legacyDate } from 'src/app/shared/utils/legacy-display.util';
import { asArray, firstItem, isLegacyPresent, unwrapPreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';
import { legacySignLabel, normalizePreviewSubFormId } from 'src/app/shared/utils/legacy-preview.util';

@Component({
  selector: 'app-common-preview-resettlement-claim',
  templateUrl: './common-preview-resettlement-claim.component.html',
  styleUrls: ['./common-preview-resettlement-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CommonPreviewResettlementClaimComponent implements OnInit {
  readonly previewTitle = 'Requisition for Resettlement Claim';
  readonly defaultSubFormId = 'RS';

  formObj: any = {};
  claim: any = {};
  advance: any = {};
  bankDetails: any = {};
  docRows: any[] = [];
  travelRows: any[] = [];
  familyRows: any[] = [];
  gxRows: any[] = [];
  transportRows: any[] = [];
  shipEffectRows: any[] = [];
  conveyanceRows: any[] = [];
  shipConveyanceRows: any[] = [];
  foreignTravelRows: any[] = [];
  claimId: string | null = null;
  subFormId = this.defaultSubFormId;
  supplementaryId: string | null = null;
  userIdDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private $common: CommonService,
    public $auth: AuthService,
    private $claimApi: ClaimApiService,
    public previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails ? this.$auth.getUserDetails() : null;
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.id ?? params?.claimId ?? params?.formId ?? null;
      this.supplementaryId = params?.supId ?? null;
      this.subFormId = normalizePreviewSubFormId(params?.subFormId ?? this.route.snapshot.data?.['subFormId'] ?? this.defaultSubFormId);
      this.getClaimDetails();
    });
  }

  getClaimDetails(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for Resettlement claim preview.', 'danger');
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
          this.$common.showMessage(response?.message ?? 'Unable to load Resettlement claim preview.', 'danger');
          return;
        }
        this.parseClaimPreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading Resettlement claim preview.', 'danger');
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
      { label: 'Sign With', value: legacySignLabel(this.formObj?.signWith) },
      { label: 'Occurrence Date', value: legacyDate(this.formObj?.occDate, 'previewDate', null as any) },
      { label: 'GX Form', value: this.formObj?.gxFormFileUrl ? 'Attached' : 'Not Attached' },
    ].filter((field) => isLegacyPresent(field.value));
  }

  get personalFields() {
    return [
      { label: 'Name', value: this.claim?.name },
      { label: 'Rank', value: this.claim?.rank },
      { label: 'Personnel Number', value: this.claim?.pno },
      { label: 'Pay Level', value: this.claim?.payLevel },
      { label: 'Basic Pay', value: this.claim?.basicPay },
      { label: 'Present Unit', value: this.claim?.transferFrom },
      { label: 'Applied To', value: this.claim?.appliedTo },
      { label: 'Transfer To', value: this.claim?.transferTo },
      { label: 'Other Unit', value: this.claim?.otherUnit },
      { label: 'Station From', value: this.claim?.stnFrom },
      { label: 'Station To', value: this.claim?.stnTo },
      { label: 'Distance', value: this.claim?.distance },
      { label: 'Advance Voucher Number', value: this.claim?.advVoucherNumber },
      { label: 'PMT Type', value: this.claim?.pmtType },
      { label: 'Family Type', value: this.claim?.familyType },
    ].filter((field) => isLegacyPresent(field.value));
  }

  get claimFields() {
    return [
      { label: 'Composite Transfer Grant', value: this.claim?.isAvailComposite === 'Yes' ? 'Availing' : 'Not Availing' },
      { label: 'Travel Details Amount', value: this.amount(this.claim?.travelDetailsAmt) },
      { label: 'DTS Amount', value: this.amount(this.claim?.travelDetailsDTSAmt) },
      { label: 'Other Charges', value: this.amount(this.claim?.otherChargeAmt) },
      { label: 'Composite / Transfer Grant', value: this.amount(this.claim?.composite) },
      { label: 'Transportation of Personal Effects', value: this.amount(this.claim?.effects) },
      { label: 'Transportation of Personal Effects by Ship', value: this.amount(this.claim?.effShip) },
      { label: 'Transportation of Private Conveyance', value: this.amount(this.claim?.conveyance) },
      { label: 'Transportation Charge of Personal Conveyance by Ship', value: this.amount(this.claim?.conveyanceShip) },
      { label: 'Grand Total', value: this.amount(this.claim?.total) },
      { label: 'Advance Voucher Amount', value: this.amount(this.claim?.lessAmtVoucherAmt) },
      { label: 'MRO Amount', value: this.amount(this.claim?.mroAmt) },
      { label: 'MRO Penal Interest', value: this.amount(this.claim?.mroPiAmt) },
      { label: 'Penal Interest', value: this.amount(this.claim?.piAmt) },
      { label: 'Net Amount Due', value: this.amount(this.claim?.netDueAbsoluteAmt), netDue: true },
      { label: 'Place', value: this.claim?.currentPlace },
      { label: 'Date', value: legacyDate(this.claim?.currentDate, 'previewDate', null as any) },
    ].filter((field) => isLegacyPresent(field.value));
  }

  get bankFields() {
    return [
      { label: 'Bank Name', value: this.bankDetails?.bankName },
      { label: 'Account Number', value: this.bankDetails?.bankAccNo },
      { label: 'IFSC Code', value: this.bankDetails?.ifscCode },
      { label: 'MICR Code', value: this.bankDetails?.micrCode },
    ].filter((field) => isLegacyPresent(field.value));
  }

  amount(value: any): any {
    return isLegacyBlank(value) ? null : value;
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private parseClaimPreviewResponse(response: any): void {
    const claims = unwrapPreviewObject(response?.object);
    this.formObj = claims;
    this.claim = firstItem(claims?.yatPermDutyClaimDTOs);
    this.advance = firstItem(claims?.yatPermDutyAdvDTOs);
    this.travelRows = this.resolveTravelRows(claims);
    this.familyRows = asArray(claims?.yatFamilyDetailDTOs);
    this.gxRows = asArray(claims?.yatClaimGxDetailsDTOs);
    this.transportRows = asArray(this.claim?.yatPermDutyClaimTransportDTOs);
    this.shipEffectRows = asArray(this.claim?.yatPermDutyClaimShipEffDTOs);
    this.conveyanceRows = asArray(this.claim?.yatPermDutyClaimTransportConveyanceDTOs);
    this.shipConveyanceRows = asArray(this.claim?.yatPermDutyClaimShipConveyanceDTOs);
    this.foreignTravelRows = asArray(claims?.yatForeignTravelDetailDTOs);
    this.docRows = asArray(claims?.yatDocsDTOs);
    this.bankDetails = claims?.yatClaimBankDetailDTO ?? {};
  }

  private resolveTravelRows(claims: any): any[] {
    return asArray(claims?.yatClaimTravelDetailsDTOs).map((row) => ({
      date: row?.date,
      from: row?.fromPlace,
      to: row?.toPlace,
      mode: row?.travelMode,
      dts: row?.isDts,
      amount: row?.amount,
      reason: row?.reasonForNotUsingDts,
      remarks: row?.remarks,
    }));
  }

}

