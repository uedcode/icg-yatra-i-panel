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
      },
      () => this.$common.hideLoader()
    );
  }
}

