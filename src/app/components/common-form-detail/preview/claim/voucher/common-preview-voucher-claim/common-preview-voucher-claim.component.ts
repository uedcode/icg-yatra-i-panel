import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-common-preview-voucher-claim',
  templateUrl: './common-preview-voucher-claim.component.html',
  styleUrls: ['./common-preview-voucher-claim.component.scss'],
  standalone: false,
})
export class CommonPreviewVoucherClaimComponent implements OnInit {
  claimId: string | null = null;
  yatClaimVoucher: any = null;

  constructor(
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private $claimApi: ClaimApiService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id');
      if (this.claimId) {
        this.loadClaim();
      } else {
        this.yatClaimVoucher = null;
        this.$common.showMessage('Missing claim id for voucher preview.', 'danger');
      }
    });
  }

  loadClaim(): void {
    const config = {
      headers: {
        claimId: this.claimId,
      },
    };

    this.$common.showLoader();
    this.$claimApi.getAdvanceVoucher(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status === false) {
          this.yatClaimVoucher = null;
          this.$common.showMessage(response?.message ?? 'Unable to load voucher details.', 'danger');
          return;
        }
        this.yatClaimVoucher = this.unwrapVoucher(response?.object);
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to load voucher details.', 'danger');
      },
    });
  }

  display(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  asDate(value: any): string {
    if (!value) return '-';
    return this.datePipe.transform(value, 'dd-MMM-yyyy') ?? '-';
  }

  private unwrapVoucher(object: any): any {
    return Array.isArray(object) ? object[0] ?? null : object ?? null;
  }
}
