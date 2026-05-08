import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-movement-update-claim',
  templateUrl: './movement-update-claim.component.html',
  styleUrls: ['./movement-update-claim.component.scss'],
  standalone: false,
})
export class MovementUpdateClaimComponent implements OnInit {
  claimId = '';
  movement: any = {};
  voucherList: any[] = [];
  validationResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('claimId') || params.get('id') || '';
      if (!this.claimId) {
        return;
      }
      this.loadMovement();
      this.loadVoucher();
    });
  }

  loadMovement(): void {
    const config = { headers: { claimId: this.claimId } };
    this.$common.showLoader();
    this.$claim.getSingleMovement(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        const rows = Array.isArray(res?.object) ? res.object : [];
        this.movement = rows.length ? rows[0] : {};
      },
      () => this.$common.hideLoader()
    );
  }

  loadVoucher(): void {
    const config = { headers: { claimId: this.claimId } };
    this.$claim.getAdvanceVoucher(config).subscribe((res: any) => {
      this.voucherList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  validateMovement(): void {
    const config = { headers: { claimId: this.claimId } };
    this.$claim.validateMovement(config).subscribe((res: any) => {
      this.validationResult = res?.object || null;
      if (res?.status) {
        this.$common.showMessage(res?.message || 'Movement validated successfully.');
      }
    });
  }

  openVoucherPreview(): void {
    this.router.navigate([`${this.$auth.getModuleName()}/preview-voucher`], {
      queryParams: { claimId: this.claimId },
    });
  }
}

