import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-preview-voucher',
  templateUrl: './preview-voucher.component.html',
  styleUrls: ['./preview-voucher.component.scss'],
  standalone: false,
})
export class PreviewVoucherComponent implements OnInit {
  claimId = '';
  voucherList: any[] = [];
  voucherObj: any = null;
  downloading = false;

  constructor(
    private route: ActivatedRoute,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('claimId') || '';
      if (!this.claimId) return;
      this.loadVoucher();
    });
  }

  private loadVoucher(): void {
    const config = { headers: { claimId: this.claimId } };
    this.$common.showLoader();
      this.$claim.getAdvanceVoucher(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.voucherList = Array.isArray(res?.object) ? res.object : [];
        this.voucherObj = this.voucherList.length ? this.voucherList[0] : null;
      },
      () => this.$common.hideLoader()
    );
  }

  downloadVoucher(): void {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for voucher download.', 'danger');
      return;
    }

    const config = { headers: { claimId: this.claimId } };
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
}
