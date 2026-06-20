import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-claim-new',
  templateUrl: './claim-new.component.html',
  styleUrls: ['./claim-new.component.scss'],
  standalone: false,
})
export class ClaimNewComponent implements OnInit {
  dataList: any[] = [];
  userIdDetails: any;
  noOfPage = 10;
  p = 1;
  searchObj = '';
  deleteLoadingMap: { [key: string]: boolean } = {};

  constructor(
    private $auth: AuthService,
    private $claimApi: ClaimApiService,
    private $claimStateApi: ClaimStateApiService,
    private router: Router,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.loadReadyForClaim();
  }

  loadReadyForClaim(): void {
    const config = {
      headers: {
        userId: this.userIdDetails?.userId || '',
      },
    };
    this.$claimApi.getReadyForClaim(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  openMovement(row: any): void {
    const claimId = row?.claimId || '';
    if (!claimId) return;
    this.router.navigate([`${this.$auth.getModuleName()}/movement-update-claim`], {
      queryParams: {
        id: claimId,
      },
    });
  }

  openClaimForm(row: any): void {
    const claimId = row?.claimId || '';
    if (!claimId) {
      this.$common.showMessage('Claim id is not available.', 'warning');
      return;
    }

    const config = { headers: { claimId: String(claimId) } };
    this.$claimApi.validateMovement(config).subscribe((res: any) => {
      if (!res?.status) {
        this.$common.showMessage(res?.message || 'Unable to validate movement.', 'danger');
        return;
      }

      this.$common.showMessage(res?.message || 'Movement validated successfully.');
      const validationResult = Array.isArray(res?.object) ? res.object[0] || null : null;
      const formUrl = validationResult?.formUrl || '';
      if (!formUrl) {
        this.$common.showMessage('Claim form URL is not available.', 'danger');
        return;
      }
      this.router.navigate([`${this.$auth.getModuleName()}/${formUrl}`], {
        queryParams: {
          id: claimId,
        },
      });
    });
  }

  deleteClaim(row: any): void {
    const claimId = row?.claimId || '';
    if (!claimId || this.deleteLoadingMap[claimId]) {
      return;
    }

    this.deleteLoadingMap[claimId] = true;
    this.$claimApi.deleteClaim({ headers: { ids: [String(claimId)] } }).subscribe({
      next: (res: any) => {
        this.deleteLoadingMap[claimId] = false;
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Unable to delete claim.', 'danger');
          return;
        }

        this.dataList = this.dataList.filter((item: any) => item?.claimId != claimId);
        this.$claimStateApi.notifyStatusCountRefresh();
        this.$common.showMessage(res?.message || 'Claim deleted successfully.', 'success');
      },
      error: () => {
        this.deleteLoadingMap[claimId] = false;
        this.$common.showMessage('Something went wrong while deleting claim.', 'danger');
      },
    });
  }
}


