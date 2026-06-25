import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { unwrapNullablePreviewObject } from 'src/app/shared/utils/legacy-preview-data.util';

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
    private location: Location,
    private route: ActivatedRoute,
    private $claimApi: ClaimApiService,
    private $common: CommonService,
    private previewWindow: PreviewWindowService
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
        this.yatClaimVoucher = unwrapNullablePreviewObject(response?.object);
      },
      error: () => {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to load voucher details.', 'danger');
      },
    });
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }
}
