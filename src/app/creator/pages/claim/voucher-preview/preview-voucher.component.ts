import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-preview-voucher',
  templateUrl: './preview-voucher.component.html',
  styleUrls: ['./preview-voucher.component.scss'],
  standalone: false,
})
export class PreviewVoucherComponent implements OnInit {
  claimId = '';
  subFormId = '';
  voucherList: any[] = [];
  voucherObj: any = null;
  downloading = false;
  get canOpenClaimForm(): boolean {
    return !!this.getClaimFormRoute(this.subFormId);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || params.get('claimId') || '';
      this.subFormId = this.normalizeSubFormId(params.get('subFormId') || '');
      if (!this.claimId) return;
      this.loadVoucher();
    });
  }

  private loadVoucher(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        ...(this.subFormId ? { subFormId: this.subFormId } : {}),
      },
    };
    this.$common.showLoader();
      this.$claim.getAdvanceVoucher(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.voucherList = Array.isArray(res?.object) ? res.object : [];
        this.voucherObj = this.voucherList.length ? this.voucherList[0] : null;
        if (!this.subFormId) {
          const inferred =
            this.voucherObj?.subFormId ||
            this.voucherObj?.codeSubFormDTO?.subFormId ||
            this.voucherObj?.purpose ||
            this.voucherObj?.subForm ||
            '';
          this.subFormId = this.normalizeSubFormId(inferred);
        }
      },
      () => this.$common.hideLoader()
    );
  }

  downloadVoucher(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for voucher download.', 'danger');
      return;
    }

    const config = {
      headers: {
        claimId: this.claimId,
        ...(this.subFormId ? { subFormId: this.subFormId } : {}),
      },
    };
    this.downloading = true;
    this.$claim.fileDownloadedVoucher(config).subscribe(
      (res: any) => {
        this.downloading = false;
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Voucher download failed.', 'danger');
          return;
        }

        const voucher = Array.isArray(res?.object) ? res.object[0] || {} : res?.object || {};
        const voucherPath = voucher?.voucherFileUrl || this.voucherObj?.voucherFileUrl || '';
        if (!voucherPath) {
          this.$common.showMessage('Voucher file is not available.', 'danger');
          return;
        }

        const fileName = `VC-${voucher?.formId || this.voucherObj?.formId || this.claimId}.pdf`;
        this.$common.downloadAbsolute(`${this.$common.fileUrl}${voucherPath}`, fileName);
        this.$common.showMessage(res?.message || 'Voucher downloaded successfully.');
      },
      () => {
        this.downloading = false;
        this.$common.showMessage('Error while downloading voucher.', 'danger');
      }
    );
  }

  openClaimForm(): void {
    const route = this.getClaimFormRoute(this.subFormId);
    if (!route) {
      this.$common.showMessage('Claim form route is not available for this voucher.', 'danger');
      return;
    }
    this.router.navigate([`${this.$auth.getModuleName()}/${route}`], {
      queryParams: {
        id: this.claimId,
        ...(this.subFormId ? { subFormId: this.subFormId } : {}),
      },
    });
  }

  private getClaimFormRoute(subFormId: string): string | null {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'P' || id === 'PMT' || id === 'PMTA' || id === 'PMTCLM') return 'form-pmt-duty-claim';
    if (id === 'T' || id === 'TY' || id === 'TYA' || id === 'TYD' || id === 'TYCLM') return 'form-ty-duty-claim';
    if (id === 'F' || id === 'FTE' || id === 'FTEA' || id === 'FTECLM') return 'form-fte-claim';
    if (id === 'L' || id === 'LTC' || id === 'LTCA' || id === 'LTCCLM') return 'form-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return 'form-resettlement-claim';
    return null;
  }

  private normalizeSubFormId(subFormId: string): string {
    const id = String(subFormId || '').toUpperCase();
    if (id === 'R' || id === 'RES' || id === 'RESCLM') return 'RS';
    return id;
  }
}

