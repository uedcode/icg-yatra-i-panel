import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

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
  docFile: File | null = null;

  claims: any = {
    id: '',
    formId: '',
    pno: '',
    name: '',
    rank: '',
    fromDt: '',
    toDt: '',
    docName: '',
    docUrl: '',
    remark: '',
  };

  codeClaimState = {
    outbox: 'OB',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    const user = this.$auth.getUserDetails();
    this.claims.formId = user?.formId || '';
    this.claims.pno = user?.pno || '';
    this.claims.name = user?.name || '';
    this.claims.rank = user?.rank || '';

    this.route.queryParamMap.subscribe((params) => {
      this.payId = params.get('id') || '';
      if (this.payId) {
        this.getPayDetailsById(this.payId);
      }
    });
  }

  private getPayDetailsById(id: string): void {
    const config = { headers: { pid: this.$auth.getUserDetails()?.userId, id } };
    this.$common.showLoader();
    this.$claim.getPayDetails(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        const row = res?.status && Array.isArray(res.object) ? res.object[0] : null;
        if (!row) return;
        this.claims = { ...this.claims, ...row };
        this.showFileBrowse = !this.claims?.docUrl;
      },
      () => this.$common.hideLoader()
    );
  }

  onDocFileChange(event: any): void {
    const file = event?.target?.files?.[0];
    this.docFile = file || null;
    if (this.docFile) {
      this.claims.docUrl = this.docFile;
      this.showFileBrowse = true;
    }
  }

  setDocName(type: string): void {
    if (!type) return;
    this.claims.docName = type === 'On Increment' ? 'SOE' : 'Promotion Gx';
  }

  submit(): void {
    if (!this.claims?.fromDt) {
      this.$common.showMessage('Please Select From Date', 'danger');
      return;
    }

    this.submitBtn = true;
    const payload = { ...this.claims };
    payload.formId = this.$auth.getUserDetails()?.formId || payload.formId;
    if (this.docFile) {
      payload.docUrl = this.docFile;
    }

    this.$common.showLoader();
    this.$claim.createOrUpdatePayDetails(payload).subscribe(
      (res: any) => {
        if (res?.status && Array.isArray(res.object) && res.object[0]?.id) {
          const savedId = res.object[0].id;
          this.changeStatusToOutbox(savedId);
          return;
        }
        this.submitBtn = false;
        this.$common.hideLoader();
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
    this.$claim.changePayStatusById(payload).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.submitBtn = false;
        if (res?.status) {
          this.$common.showMessage(res?.message || 'Pay details submitted successfully.');
          this.router.navigateByUrl(`${this.$auth.getModuleName()}/outbox`);
        }
      },
      () => {
        this.$common.hideLoader();
        this.submitBtn = false;
      }
    );
  }

  openPreview(): void {
    const id = this.claims?.id || this.payId;
    if (!id) {
      this.$common.showMessage('Please submit pay details first to open preview.', 'danger');
      return;
    }
    this.router.navigate([`${this.$auth.getModuleName()}/form-pay-details-detail`], {
      queryParams: { id },
    });
  }
}


