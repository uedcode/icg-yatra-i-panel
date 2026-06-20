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
    const claimId = row?.claimId || row?.yatClaimDTO?.claimId || row?.id || '';
    const subFormId = (
      row?.subFormId ||
      row?.codeSubFormDTO?.subFormId ||
      row?.yatClaimDTO?.codeSubFormDTO?.subFormId ||
      ''
    ).toUpperCase();
    if (!claimId) return;
    this.router.navigate([`${this.$auth.getModuleName()}/movement-update-claim`], {
      queryParams: {
        id: claimId,
        ...(subFormId ? { subFormId } : {}),
      },
    });
  }

  openClaimForm(row: any): void {
    const claimId = row?.claimId || row?.yatClaimDTO?.claimId || row?.id || '';
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
      const validationResult = Array.isArray(res?.object) ? res.object[0] || null : res?.object || null;
      this.openClaimFormAfterValidation(row, validationResult);
    });
  }

  private openClaimFormAfterValidation(row: any, validationResult: any = null): void {
    const claimId = row?.claimId || row?.yatClaimDTO?.claimId || row?.id || '';
    const subFormId = (
      validationResult?.subFormId ||
      validationResult?.purpose ||
      validationResult?.codeSubFormDTO?.subFormId ||
      row?.subFormId ||
      row?.codeSubFormDTO?.subFormId ||
      row?.yatClaimDTO?.codeSubFormDTO?.subFormId ||
      ''
    ).toUpperCase();
    const formUrl =
      validationResult?.formUrl ||
      validationResult?.url ||
      validationResult?.codeSubFormDTO?.formUrl ||
      row?.formUrl ||
      row?.codeSubFormDTO?.formUrl ||
      row?.yatClaimDTO?.codeSubFormDTO?.formUrl ||
      '';
    const route = this.getClaimFormRoute(subFormId, formUrl);
    if (!route) {
      this.$common.showMessage(
        `Unsupported claim type: ${subFormId || 'UNKNOWN'}. Please contact admin.`,
        'danger'
      );
      return;
    }
    this.router.navigate([`${this.$auth.getModuleName()}/${route}`], {
      queryParams: {
        id: claimId,
        subFormId,
      },
    });
  }

  deleteClaim(row: any): void {
    const claimId = row?.claimId || row?.yatClaimDTO?.claimId || row?.id || '';
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

        this.dataList = this.dataList.filter(
          (item: any) => (item?.claimId || item?.yatClaimDTO?.claimId || item?.id) != claimId
        );
        this.$claimStateApi.notifyStatusCountRefresh();
        this.$common.showMessage(res?.message || 'Claim deleted successfully.', 'success');
      },
      error: () => {
        this.deleteLoadingMap[claimId] = false;
        this.$common.showMessage('Something went wrong while deleting claim.', 'danger');
      },
    });
  }

  private getClaimFormRoute(subFormId: string, formUrl: string = ''): string | null {
    const normalizedFormUrl = String(formUrl || '').toLowerCase();
    if (normalizedFormUrl) {
      if (normalizedFormUrl.includes('form-pmt-duty-claim')) return 'form-pmt-duty-claim';
      if (normalizedFormUrl.includes('form-ty-duty-claim')) return 'form-ty-duty-claim';
      if (normalizedFormUrl.includes('form-fte-claim')) return 'form-fte-claim';
      if (normalizedFormUrl.includes('form-ltc-claim')) return 'form-ltc-claim';
      if (normalizedFormUrl.includes('form-resettlement-claim')) return 'form-resettlement-claim';
      if (normalizedFormUrl.includes('form-pmt-duty')) return 'form-pmt-duty-claim';
      if (normalizedFormUrl.includes('form-ty-duty')) return 'form-ty-duty-claim';
      if (normalizedFormUrl.includes('form-fte-advance')) return 'form-fte-claim';
      if (normalizedFormUrl.includes('form-ltc-advance')) return 'form-ltc-claim';
      if (normalizedFormUrl.includes('resettlement')) return 'form-resettlement-claim';
    }

    const id = (subFormId || '').toUpperCase();
    if (id === 'P' || id === 'PMT' || id === 'PMTA' || id === 'PMTCLM') return 'form-pmt-duty-claim';
    if (id === 'T' || id === 'TY' || id === 'TYA' || id === 'TYD' || id === 'TYCLM') return 'form-ty-duty-claim';
    if (id === 'F' || id === 'FTE' || id === 'FTEA' || id === 'FTECLM') return 'form-fte-claim';
    if (id === 'L' || id === 'LTC' || id === 'LTCA' || id === 'LTCCLM') return 'form-ltc-claim';
    if (id === 'R' || id === 'RS' || id === 'RES' || id === 'RESCLM') return 'form-resettlement-claim';
    return null;
  }
}


