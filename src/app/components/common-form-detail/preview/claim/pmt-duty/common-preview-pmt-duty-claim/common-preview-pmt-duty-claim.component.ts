import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-common-preview-pmt-duty-claim',
  templateUrl: './common-preview-pmt-duty-claim.component.html',
  styleUrls: ['./common-preview-pmt-duty-claim.component.scss'],
  standalone: false,
})
export class CommonPreviewPmtDutyClaimComponent implements OnInit {
  readonly defaultSubFormId = 'PMT';

  formObj: any = {};
  claim: any = {};
  bankDetails: any = {};
  documentDtos: any[] = [];
  travelRows: any[] = [];
  familyRows: any[] = [];
  gxRows: any[] = [];
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
      this.subFormId = params?.subFormId ?? this.route.snapshot.data?.['subFormId'] ?? this.defaultSubFormId;
      this.getClaimDetails();
    });
  }

  getClaimDetails(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for PMT Duty claim preview.', 'danger');
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
          this.$common.showMessage(response?.message ?? 'Unable to load PMT Duty claim preview.', 'danger');
          return;
        }
        this.parseClaimPreviewResponse(response);
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading PMT Duty claim preview.', 'danger');
      },
    });
  }

  get previewTitle(): string {
    const prefix = this.isBlank(this.formObj?.supClaimId) ? '' : 'Supplementary ';
    const suffix = this.isBlank(this.formObj?.formId) ? '' : ` - ${this.formObj.formId}`;
    return `${prefix}Permanent Duty Claim${suffix}`;
  }

  get isCreatorRole(): boolean {
    return this.userIdDetails?.roleTypeId === this.$auth.codeRoleType()?.creator;
  }

  get isInkSign(): boolean {
    return ['IS', 'IK', 'INK_SIGN'].includes(String(this.formObj?.signWith ?? '').toUpperCase());
  }

  get isESign(): boolean {
    return ['ES', 'E_SIGN'].includes(String(this.formObj?.signWith ?? '').toUpperCase());
  }

  get hasLinkedAdvance(): boolean {
    const claimMode = String(this.formObj?.claimMode ?? '').toUpperCase();
    return ['YT', 'YATRA'].includes(claimMode) && !this.isBlank(this.formObj?.advClaimId);
  }

  get transportRows(): any[] {
    return this.asArray(this.claim?.yatPermDutyClaimTransportDTOs);
  }

  get shipEffectRows(): any[] {
    return this.asArray(this.claim?.yatPermDutyClaimShipEffDTOs);
  }

  get conveyanceRows(): any[] {
    return this.asArray(this.claim?.yatPermDutyClaimTransportConveyanceDTOs);
  }

  get shipConveyanceRows(): any[] {
    return this.asArray(this.claim?.yatPermDutyClaimShipConveyanceDTOs);
  }

  get otherChargeRows(): any[] {
    return this.asArray(this.formObj?.yatForeignTravelDetailDTOs);
  }

  get financialRows(): any[] {
    const rows = [
      { description: 'Travel Details (All mode of travel excluding DTS Booking)', amount: this.claim?.travelDetailsAmt },
      { description: 'Travel details (DTS bookings)', amount: this.claim?.travelDetailsDTSAmt },
    ];
    if (!this.isBlank(this.claim?.otherChargeAmt)) {
      rows.push({ description: 'Other Charges', amount: this.claim?.otherChargeAmt });
    }
    rows.push(
      { description: 'Composite/ Transfer Grant', amount: this.claim?.composite },
      { description: 'Transportation of personal effects', amount: this.claim?.effects },
      { description: 'Transportation of personal effects by ship', amount: this.claim?.effShip },
      { description: 'Transportation of private conveyance', amount: this.claim?.conveyance },
      { description: 'Transportation charge of personal conveyance by ship', amount: this.claim?.conveyanceShip },
      { description: 'Grand Total', amount: this.claim?.total },
      { description: `Amount of advance. If any, drawn vide voucher No. ${this.nil(this.claim?.advVoucherNumber)} dated ${this.nil(this.asDate(this.claim?.lessAmtVoucherDate))}`, amount: this.claim?.lessAmtVoucherAmt },
      { description: `Excess TA advance paid through MRO. If any, paid via MRO No. ${this.nil(this.claim?.mroNo)} dated ${this.nil(this.asDate(this.claim?.mroDate))}`, amount: this.claim?.mroAmt }
    );
    if (Number(this.claim?.mroPiAmt) > 0) {
      rows.push({
        description: `MRO Penal Interest (from date ${this.nil(this.asDate(this.claim?.mroPiFromDate))} to date ${this.nil(this.asDate(this.claim?.mroPiToDate))}) ${this.nil(this.claim?.mroPiInterestRate)}% Interest Rate`,
        amount: this.claim?.mroPiAmt,
      });
    }
    rows.push(
      { description: `Penal Interest (from date ${this.nil(this.asDate(this.claim?.piFromDate))} to date ${this.nil(this.asDate(this.claim?.piToDate))}) ${this.nil(this.claim?.piInterestRate)}% Interest Rate`, amount: this.claim?.piAmt },
      { description: 'DTS Ticket Adjusted', amount: this.claim?.travelDetailsDTSAmt },
      { description: 'Net Amount Due', amount: this.claim?.netDueAbsoluteAmt }
    );
    return rows;
  }

  asDate(value: any): any {
    if (!value && value !== 0) return null;
    const num = Number(value);
    return Number.isNaN(num) ? value : this.datePipe.transform(new Date(num), 'dd/MM/yyyy');
  }

  asDateTime(value: any): any {
    if (!value && value !== 0) return null;
    const num = Number(value);
    return Number.isNaN(num) ? value : this.datePipe.transform(new Date(num), 'dd/MM/yyyy HH:mm');
  }

  nil(value: any): any {
    return this.isBlank(value) ? 'Nil' : value;
  }

  hyphen(value: any): any {
    return this.isBlank(value) ? '-' : value;
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

  downloadPreview(): void {
    if (!this.formObj?.claimId) {
      this.$common.showMessage('Claim id is not available.', 'danger');
      return;
    }
    this.$claimApi
      .fileDownloadedTempInkSign({
        headers: {
          claimId: this.formObj.claimId,
          signType: true,
        },
      })
      .subscribe({
        next: (response: any) => {
          if (!response?.status) {
            this.$common.showMessage(response?.message ?? 'Unable to download file.', 'danger');
            return;
          }
          const responseObject = Array.isArray(response?.object) ? response.object[0] ?? null : null;
          this.$common.download(responseObject?.inkSignedFileUrl);
        },
        error: () => this.$common.showMessage('Unable to download file.', 'danger'),
      });
  }

  private parseClaimPreviewResponse(response: any): void {
    const claims = this.unwrapClaimObject(response?.object);
    this.formObj = claims;
    this.claim = this.firstItem(claims?.yatPermDutyClaimDTOs);
    this.travelRows = this.asArray(claims?.yatClaimTravelDetailsDTOs);
    this.familyRows = this.asArray(claims?.yatFamilyDetailDTOs);
    this.gxRows = this.asArray(claims?.yatClaimGxDetailsDTOs);
    this.documentDtos = this.asArray(claims?.yatDocsDTOs);
    this.bankDetails = claims?.yatClaimBankDetailDTO ?? {};
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

  private isBlank(value: any): boolean {
    if (value == null) return true;
    return value === '';
  }
}

