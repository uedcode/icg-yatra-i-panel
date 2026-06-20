import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { PayLevelApiService } from 'src/app/service/api/masters/pay-level-api.service';
import { ReasonApiService } from 'src/app/service/api/masters/reason-api.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

@Component({
  selector: 'app-form-manual-adv',
  templateUrl: './form-manual-adv.component.html',
  styleUrls: ['./form-manual-adv.component.scss'],
  standalone: false,
})
export class FormManualAdvComponent implements OnInit {
  claimId = '';
  resubClaimId = '';
  disableBtn = false;
  isEdit = false;

  codeClaim = {
    manualAdv: 'M',
    pmtAdv: 'P',
    tyAdv: 'T',
    ltcAdv: 'L',
  };
  codeClaimState = {
    manualDraft: 'MD',
    outbox: 'OB',
  };

  units: any[] = [];
  reasons: any[] = [];
  payLevels: any[] = [];

  formObj: any = {
    manualAdvId: '',
    codeUnitDTO: { unit: '', descr: '' },
    pno: '',
    name: '',
    rank: '',
    payLevel: '',
    basicPay: '',
    amount: '',
    admissibleAmt: '',
    formType: '',
    reason: '',
  };

  manualFormFile: File | null = null;
  gxFormFile: File | null = null;

  constructor(
    private $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $codeUnitApi: CodeUnitApiService,
    private $reasonApi: ReasonApiService,
    private $payLevelApi: PayLevelApiService,
    private $common: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    const user = this.$auth.getUserDetails();
    if (user?.unitId) {
      this.formObj.codeUnitDTO = {
        unit: user.unitId,
        descr: user.unitName || '',
      };
    }
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || params.get('claimId') || params.get('resubId') || '';
      this.resubClaimId = params.get('resubId') || '';
      this.isEdit = !!this.claimId;
      if (this.isEdit) {
        this.loadExisting();
      }
    });
    this.loadDropdowns();
  }

  private loadDropdowns() {
    this.$codeUnitApi.getAllUnits({ headers: {} }).subscribe((r: any) => {
      if (r?.status) this.units = r.object || [];
    });
    this.$reasonApi.get({ headers: {} }).subscribe((r: any) => {
      if (r?.status) this.reasons = r.object || [];
    });
    this.$payLevelApi.get({ headers: {} }).subscribe((r: any) => {
      if (r?.status) this.payLevels = r.object || [];
    });
  }

  private loadExisting() {
    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.codeClaim.manualAdv,
        isFetch: '1',
      },
    };
    this.$claimApi.getSingleClaim(config).subscribe((res: any) => {
      if (!res?.status || !res.object?.length) return;
      const claim = res.object[0];
      const manual = claim?.yatManualAdvDTOs?.[0] || {};
      this.formObj = {
        ...this.formObj,
        ...manual,
        codeUnitDTO: manual?.codeUnitDTO || this.formObj.codeUnitDTO,
      };
    });
  }

  onManualFileChange(event: any) {
    const file = event?.target?.files?.[0];
    this.manualFormFile = file || null;
  }

  onGxFileChange(event: any) {
    const file = event?.target?.files?.[0];
    this.gxFormFile = file || null;
  }

  private setAdmissibleAmount() {
    const amount = Number(this.formObj.amount || 0);
    this.formObj.admissibleAmt = amount > 0 ? String(amount) : '';
  }

  save(status: string) {
    if (!this.formObj.formType || !this.formObj.amount || !this.formObj.reason) {
      this.$common.showMessage('Form Type, Amount and Reason are required.', 'danger');
      return;
    }
    this.setAdmissibleAmount();
    this.disableBtn = true;
    this.$common.showLoader();

    const req: any = this.$auth.getFormDetails(this.codeClaim.manualAdv, status);
    req.claimId = this.claimId || '';
    if (this.resubClaimId) req.refAdvanceId = this.resubClaimId;
    req.codeSubFormDTO = { subFormId: this.codeClaim.manualAdv };
    req.occDate = Date.now();

    const formData = new FormData();
    formData.append('yatClaimDTO', JSON.stringify(req));
    formData.append('yatManualAdvDTO', JSON.stringify(this.formObj));
    if (this.manualFormFile) formData.append('manualForm', this.manualFormFile);
    if (this.gxFormFile) formData.append('gxForm', this.gxFormFile);

    this.$claimApi.createOrUpdateAdvance(formData).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        if (res?.status) {
          const obj = res?.object?.[0] || {};
          this.claimId = obj?.claimId || this.claimId;
          this.$common.showMessage(
            status === this.codeClaimState.outbox
              ? res?.message || 'Manual Advance submitted successfully.'
              : res?.message || 'Manual Advance draft saved successfully.'
          );
          if (status === this.codeClaimState.outbox) {
            this.router.navigateByUrl(`${this.$auth.getModuleName()}/outbox`);
          }
        }
      },
      (err) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        console.log(err);
      }
    );
  }

  openPreview() {
    const query: any = { subFormId: this.codeClaim.manualAdv };
    if (this.claimId) query.id = this.claimId;
    this.previewWindow.open(this.$auth.getModuleName(), 'form-manual-adv-detail', query);
  }
}


