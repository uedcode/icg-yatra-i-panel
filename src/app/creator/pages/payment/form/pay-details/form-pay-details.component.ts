import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PayStateApiService } from 'src/app/service/api/payment/pay-state-api.service';
import { YatPayDetailsApiService } from 'src/app/service/api/payment/yat-pay-details-api.service';
import { TempDocInfoApiService } from 'src/app/service/api/form/temp-doc-info-api.service';
declare var $: any;

@Component({
  selector: 'app-form-pay-details',
  templateUrl: './form-pay-details.component.html',
  styleUrls: ['./form-pay-details.component.scss'],
  standalone: false,
})
export class FormPayDetailsComponent implements OnInit {
  payId = '';
  submitBtn = false;
  showFileBrowse = true;
  docFile: string | null = null;
  docUploading = false;
  isPreview = false;
  fullFormDisabled = true;
  appliedUnit = '';

  claims: any = {
    id: '',
    formId: '',
    pno: '',
    name: '',
    rank: '',
    payLevel: '',
    basicPay: '',
    videPresentUnit: '',
    newPayLevel: '',
    newBasicPay: '',
    fromDt: '',
    reason: '',
    docName: '',
    docUrl: '',
    remark: '',
    deleteFileUrl: '',
  };

  readonly payLevelOptions = [
    'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09',
    'L10', 'L11', 'L12', 'L13', 'L13A', 'L14', '15', '16', '17',
  ];

  codeClaimState = {
    outbox: 'OB',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private $payStateApi: PayStateApiService,
    private $payDetailsApi: YatPayDetailsApiService,
    private $tempDocInfoApi: TempDocInfoApiService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    const user = this.$auth.getUserDetails();
    this.claims.formId = this.$auth.getRuntimeModuleId();
    this.claims.pno = user?.pno || '';
    this.claims.name = user?.name || '';
    this.claims.rank = user?.rank || '';
    this.claims.videPresentUnit = user?.unitName || user?.gxUnitName || '';

    this.route.queryParamMap.subscribe((params) => {
      this.payId = params.get('id') || '';
      this.loadPayDetails();
    });
  }

  private loadPayDetails(): void {
    const config: any = { headers: { pid: this.$auth.getUserDetails()?.userId } };
    if (this.payId) {
      config.headers.id = this.payId;
      this.isPreview = true;
    }

    this.$common.showLoader();
    this.$payDetailsApi.getAll(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        const row = res?.status && Array.isArray(res.object) ? res.object[0] : null;
        if (!row) {
          this.isPreview = false;
          this.showFileBrowse = true;
          return;
        }

        this.claims = { ...this.claims, ...row };
        this.claims.fromDt = this.toDateInput(this.claims.fromDt);
        if (this.claims?.state) {
          this.isPreview = true;
        }
        this.showFileBrowse = !this.claims?.docUrl || !this.payId;
      },
      () => {
        this.$common.hideLoader();
        this.isPreview = false;
        this.showFileBrowse = true;
      }
    );
  }

  onDocFileChange(event: any): void {
    const input = event?.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    if (!this.isValidPayDocument(file)) {
      input.value = '';
      this.docFile = null;
      this.claims.docUrl = '';
      return;
    }

    this.docUploading = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tempDocInfoDTO', '{}');
    this.$tempDocInfoApi.createOrUpdate(formData).subscribe(
      (res: any) => {
        this.docUploading = false;
        const url = res?.status && Array.isArray(res.object) ? res.object[0]?.fileUrl : '';
        if (url) {
          this.docFile = url;
          this.claims.docUrl = url;
          return;
        }
        this.docFile = null;
        this.claims.docUrl = '';
        input.value = '';
        this.$common.showMessage('Unable to upload document.', 'danger');
      },
      () => {
        this.docUploading = false;
        this.docFile = null;
        this.claims.docUrl = '';
        input.value = '';
        this.$common.showMessage('Unable to upload document.', 'danger');
      }
    );
  }

  setDocName(type: string): void {
    if (!type) {
      this.claims.docName = '';
      return;
    }
    this.claims.docName = type === 'On Increment' ? 'SOE' : 'Promotion Gx';
    if (this.docFile) {
      this.docFile = null;
      this.claims.docUrl = '';
    }
  }

  removeExistingDocument(): void {
    if (!this.claims?.docUrl) {
      return;
    }
    this.claims.deleteFileUrl = this.claims.docUrl;
    this.claims.docUrl = '';
    this.docFile = null;
    this.showFileBrowse = true;
  }

  viewDocument(): void {
    const docUrl = this.claims?.docUrl;
    if (!docUrl || typeof docUrl !== 'string') {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    this.$auth.viewFile(docUrl);
  }

  openSubmitModal(): void {
    if (!this.validatePayDetails()) {
      return;
    }

    const user = this.$auth.getUserDetails();
    const config = {
      headers: {
        unitId: user?.unitId || '',
        unitName: user?.gxUnitName || user?.unitName || '',
        userId: user?.userId || '',
      },
    };

    this.$common.showLoader();
    this.$claimApi.getVerifierUnit(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.appliedUnit = res?.status && res?.object
          ? res.object
          : (user?.gxUnitName || user?.unitName || '');
        $('#submitModal').modal('show');
      },
      () => {
        this.$common.hideLoader();
        this.appliedUnit = user?.gxUnitName || user?.unitName || '';
        $('#submitModal').modal('show');
      }
    );
  }

  private validatePayDetails(): boolean {
    if (this.docUploading) {
      this.$common.showMessage('Please wait for document upload to finish.', 'danger');
      return false;
    }
    if (!this.claims?.fromDt) {
      this.$common.showMessage('Please Select From Date', 'danger');
      return false;
    }
    if (!this.claims?.newPayLevel) {
      this.$common.showMessage('Please Select New Pay Level', 'danger');
      return false;
    }
    if (!this.claims?.newBasicPay) {
      this.$common.showMessage('Please Enter New Basic Pay', 'danger');
      return false;
    }
    if (!this.claims?.reason) {
      this.$common.showMessage('Please Select Reason For Change', 'danger');
      return false;
    }
    if (!this.claims?.docUrl && !this.docFile) {
      this.$common.showMessage(`Please upload ${this.claims?.docName || 'document'}`, 'danger');
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validatePayDetails()) {
      return;
    }

    this.closeSubmitModal();
    this.submitBtn = true;
    const payload = { ...this.claims };
    payload.formId = this.$auth.getRuntimeModuleId();
    payload.fromDt = this.toMillis(this.claims.fromDt);
    if (this.docFile) {
      payload.docUrl = this.docFile;
    }

    this.$common.showLoader();
    this.$payDetailsApi.createOrUpdate(payload).subscribe(
      (res: any) => {
        if (res?.status && Array.isArray(res.object) && res.object[0]?.id) {
          const savedRow = res.object[0];
          const savedId = savedRow.id;
          this.claims = { ...this.claims, ...savedRow };
          this.changeStatusToOutbox(savedId);
          return;
        }
        this.submitBtn = false;
        this.$common.hideLoader();
        if (res?.message) {
          this.$common.showMessage(res.message, 'danger');
        }
      },
      () => {
        this.submitBtn = false;
        this.$common.hideLoader();
      }
    );
  }

  private changeStatusToOutbox(payId: string): void {
    const payload = {
      claimId: payId,
      roleTypeId: this.$auth.getUserDetails()?.roleTypeId,
      userId: this.$auth.getUserDetails()?.userId,
      status: this.codeClaimState.outbox,
      remark: '',
    };
    this.$payStateApi.changeStatusById(payload).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.submitBtn = false;
        if (res?.status) {
          this.$common.showMessage(res?.message || 'Pay details submitted successfully.');
          this.$claimStateApi.notifyStatusCountRefresh();
          this.resetToFreshForm();
          setTimeout(() => {
            this.router.navigateByUrl(`${this.$auth.getModuleName()}/form-pay-details`);
          }, 1200);
          return;
        }
        if (res?.message) {
          this.$common.showMessage(res.message, 'danger');
        }
      },
      () => {
        this.$common.hideLoader();
        this.submitBtn = false;
      }
    );
  }

  private closeSubmitModal(): void {
    $('#submitModal').modal('hide');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').css('padding-right', '');
  }

  private resetToFreshForm(): void {
    const user = this.$auth.getUserDetails();
    this.payId = '';
    this.isPreview = false;
    this.showFileBrowse = true;
    this.docFile = null;
    this.docUploading = false;
    this.appliedUnit = '';
    this.claims = {
      id: '',
      formId: this.$auth.getRuntimeModuleId(),
      pno: user?.pno || '',
      name: user?.name || '',
      rank: user?.rank || '',
      payLevel: user?.payLevel || '',
      basicPay: user?.basicPay || '',
      videPresentUnit: user?.unitName || user?.gxUnitName || '',
      newPayLevel: '',
      newBasicPay: '',
      fromDt: '',
      reason: '',
      docName: '',
      docUrl: '',
      remark: '',
      deleteFileUrl: '',
    };
  }

  get fileLabel(): string {
    return this.claims?.docName ? `${this.claims.docName} (PDF) (Upto 512 KB)` : 'Document (PDF) (Upto 512 KB)';
  }

  private isValidPayDocument(file: File): boolean {
    if (!/\.pdf$/i.test(file.name)) {
      this.$common.showMessage('Please select a Valid file', 'danger');
      return false;
    }
    if (file.size > 512 * 1024) {
      this.$common.showMessage('File is bigger than 512KB', 'danger');
      return false;
    }
    if (/[^a-zA-Z0-9_.\- ]/.test(file.name)) {
      this.$common.showMessage('File name contains special character', 'danger');
      return false;
    }
    return true;
  }

  private toDateInput(value: any): any {
    if (!value) return value;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const timestamp = Number(value);
    if (Number.isNaN(timestamp)) {
      return value;
    }
    return this.$common.setDate(timestamp);
  }

  private toMillis(value: any): any {
    if (!value || typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return Number(value);
    }
    const date = new Date(`${value}T00:00:00`);
    const timestamp = date.getTime();
    return Number.isNaN(timestamp) ? value : timestamp;
  }
}



