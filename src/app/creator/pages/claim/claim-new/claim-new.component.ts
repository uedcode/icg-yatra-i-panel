import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';

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
    private router: Router
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
    if (!claimId) return;
    this.router.navigateByUrl(
      `${this.$auth.getModuleName()}/movement-update-claim?claimId=${claimId}`
    );
  }

  openClaimForm(row: any): void {
    const subFormId = (
      row?.subFormId ||
      row?.codeSubFormDTO?.subFormId ||
      row?.yatClaimDTO?.codeSubFormDTO?.subFormId ||
      ''
    ).toUpperCase();
    const claimId = row?.claimId || row?.yatClaimDTO?.claimId || row?.id || '';
    const route = this.getClaimFormRoute(subFormId);
    if (!route) return;
    this.router.navigateByUrl(
      `${this.$auth.getModuleName()}/${route}?claimId=${claimId}&subFormId=${subFormId}`
    );
  }

  private getClaimFormRoute(subFormId: string): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'P' || id === 'PMT' || id === 'PMTA' || id === 'PMTCLM') return 'form-pmt-duty-claim';
    if (id === 'T' || id === 'TY' || id === 'TYA' || id === 'TYCLM') return 'form-ty-duty-claim';
    if (id === 'F' || id === 'FTE' || id === 'FTEA' || id === 'FTECLM') return 'form-fte-claim';
    if (id === 'L' || id === 'LTC' || id === 'LTCA' || id === 'LTCCLM') return 'form-ltc-claim';
    if (id === 'R' || id === 'RS' || id === 'RES' || id === 'RESCLM') return 'form-resettlement-claim';
    return null;
  }
}
