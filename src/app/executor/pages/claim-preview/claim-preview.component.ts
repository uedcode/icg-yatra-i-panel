import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { normalizePreviewSubFormId } from 'src/app/shared/utils/legacy-preview.util';
@Component({
  selector: 'app-executor-claim-preview',
  templateUrl: './claim-preview.component.html',
  styleUrls: ['./claim-preview.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ClaimPreviewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    const claimId =
      this.route.snapshot.queryParamMap.get('id') ||
      this.route.snapshot.queryParamMap.get('claimId') ||
      this.route.snapshot.queryParamMap.get('formId');
    const subFormId = this.route.snapshot.queryParamMap.get('subFormId') || '';
    const targetRoute = this.getPreviewRoute(subFormId);
    if (!claimId || !targetRoute) {
      return;
    }
    this.router.navigate([`../${targetRoute}`], {
      relativeTo: this.route,
      queryParams: {
        id: claimId,
        subFormId: normalizePreviewSubFormId(subFormId),
        supId: this.route.snapshot.queryParamMap.get('supId') || null,
      },
      replaceUrl: true,
    });
  }

  goBack(): void {
    this.location.back();
  }

  private getPreviewRoute(subFormId: string): string {
    const id = subFormId.toUpperCase();
    if (id === 'P' || id === 'PMTA' || id === 'PMT') return 'preview-pmt-duty-claim';
    if (id === 'T' || id === 'TYA' || id === 'TY' || id === 'TYD') return 'preview-ty-duty-claim';
    if (id === 'F' || id === 'FTEA' || id === 'FTE') return 'preview-fte-claim';
    if (id === 'L' || id === 'LTCA' || id === 'LTC') return 'preview-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R') return 'preview-resettlement-claim';
    if (id === 'M') return 'preview-manual-adv';
    return '';
  }
}


