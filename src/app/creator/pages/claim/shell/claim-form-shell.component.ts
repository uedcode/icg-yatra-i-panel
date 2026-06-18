import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-claim-form-shell',
  templateUrl: './claim-form-shell.component.html',
  styleUrls: ['./claim-form-shell.component.scss'],
  standalone: false,
})
export class ClaimFormShellComponent implements OnInit {
  claimId = '';
  subFormId = '';
  routeName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $auth: AuthService
  ) {}

  ngOnInit(): void {
    this.routeName = this.route.snapshot.routeConfig?.path || '';
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || params.get('claimId') || '';
      this.subFormId = params.get('subFormId') || '';
    });
  }

  openVoucher(): void {
    this.router.navigate([`${this.$auth.getModuleName()}/preview-voucher`], {
      queryParams: {
        id: this.claimId,
        ...(this.subFormId ? { subFormId: this.subFormId } : {}),
      },
    });
  }

  openMovement(): void {
    this.router.navigate([`${this.$auth.getModuleName()}/movement-update-claim`], {
      queryParams: {
        id: this.claimId,
        ...(this.subFormId ? { subFormId: this.subFormId } : {}),
      },
    });
  }
}
