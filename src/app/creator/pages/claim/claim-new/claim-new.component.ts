import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

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

  constructor(
    private $auth: AuthService,
    private $claim: ClaimService,
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
    this.$claim.getReadyForClaim(config).subscribe((res: any) => {
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
        claimId,
        ...(subFormId ? { subFormId } : {}),
      },
    });
  }

  openClaimForm(row: any): void {
    const subFormId = (
      row?.subFormId ||
      row?.codeSubFormDTO?.subFormId ||
      row?.yatClaimDTO?.codeSubFormDTO?.subFormId ||
      ''
    ).toUpperCase();
    const formUrl =
      row?.formUrl ||
      row?.codeSubFormDTO?.formUrl ||
      row?.yatClaimDTO?.codeSubFormDTO?.formUrl ||
      '';
    const claimId = row?.claimId || row?.yatClaimDTO?.claimId || row?.id || '';
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
        claimId,
        subFormId,
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
    if (id === 'T' || id === 'TY' || id === 'TYA' || id === 'TYCLM') return 'form-ty-duty-claim';
    if (id === 'F' || id === 'FTE' || id === 'FTEA' || id === 'FTECLM') return 'form-fte-claim';
    if (id === 'L' || id === 'LTC' || id === 'LTCA' || id === 'LTCCLM') return 'form-ltc-claim';
    if (id === 'R' || id === 'RS' || id === 'RES' || id === 'RESCLM') return 'form-resettlement-claim';
    return null;
  }
}
