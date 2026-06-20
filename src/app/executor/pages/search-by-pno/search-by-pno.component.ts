import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';

@Component({
  selector: 'app-search-by-pno',
  templateUrl: './search-by-pno.component.html',
  styleUrls: ['./search-by-pno.component.css'],
  standalone: false,
})
export class SearchByPnoComponent implements OnInit {
  pno = '';
  searchName = '';
  rows: any[] = [];
  user: any;

  constructor(
    private $auth: AuthService,
    private $claimStateApi: ClaimStateApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.$auth.getUserDetails();
  }

  search(): void {
    const config = {
      headers: {
        roleTypeId: this.user?.roleTypeId,
        userId: this.user?.userId,
        unitId: this.user?.unitId,
        gxUnitId: this.user?.unitId,
        claimState: '',
        isArchive: '0',
        pno: (this.pno || '').trim(),
        searchedName: (this.searchName || '').trim(),
        formId: '',
      },
    };

    this.$claimStateApi.getAll(config).subscribe({
      next: (res: any) => {
        this.rows = Array.isArray(res?.object) ? res.object : [];
      },
      error: () => {
        this.rows = [];
      },
    });
  }

  openPreview(row: any): void {
    const claim = row?.yatClaimDTO || {};
    const claimId = claim?.claimId || row?.claimId || row?.formId || row?.id;
    const subFormId = (claim?.codeSubFormDTO?.subFormId || row?.subFormId || '').toString();
    if (!claimId || !subFormId) return;
    const previewRoute = this.getExecutorPreviewRoute(subFormId);
    this.router.navigateByUrl(
      `${this.$auth.getModuleName()}/${previewRoute}?claimId=${claimId}&subFormId=${subFormId}`
    );
  }

  private getExecutorPreviewRoute(subFormId: string): string {
    const id = subFormId.toUpperCase();
    if (id === 'P' || id === 'PMTA' || id === 'PMT') return 'preview-pmt-duty-claim';
    if (id === 'T' || id === 'TYA' || id === 'TY') return 'preview-ty-duty-claim';
    if (id === 'F' || id === 'FTEA' || id === 'FTE') return 'preview-fte-claim';
    if (id === 'L' || id === 'LTCA' || id === 'LTC') return 'preview-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R') return 'preview-resettlement-claim';
    if (id === 'M') return 'preview-manual-adv';
    return 'form-claim-detail';
  }
}


