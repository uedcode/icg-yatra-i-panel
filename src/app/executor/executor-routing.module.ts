import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { ExecutorComponent } from './executor.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SearchByPnoComponent } from './pages/search-by-pno/search-by-pno.component';
import { EsignReportComponent } from './pages/esign-report/esign-report.component';
import { PieChartComponent } from './pages/pie-chart/pie-chart.component';
import { ClaimPreviewComponent } from './pages/claim-preview/claim-preview.component';

const routes: Routes = [
  {
    path: '',
    component: ExecutorComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'search-by-pno',
    component: SearchByPnoComponent,
    canActivate: [AuthGuard],
    data: { title: 'Search By PNO' },
  },
  {
    path: 'esign-report',
    component: EsignReportComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Report' },
  },
  {
    path: 'pie-chart',
    component: PieChartComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pie Chart' },
  },
  {
    path: 'form-claim-detail',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Detail' },
  },
  {
    path: 'preview-pmt-duty',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Duty Preview' },
  },
  {
    path: 'preview-ty-duty',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Preview' },
  },
  {
    path: 'preview-fte-advance',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Advance Preview' },
  },
  {
    path: 'preview-ltc-advance',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance Preview' },
  },
  {
    path: 'preview-manual-adv',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance Preview' },
  },
  {
    path: 'preview-ltc-availed-history',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History Preview' },
  },
  {
    path: 'preview-pmt-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview' },
  },
  {
    path: 'claim/preview-pmt-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview' },
  },
  {
    path: 'preview-ty-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Claim Preview' },
  },
  {
    path: 'claim/preview-ty-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Claim Preview' },
  },
  {
    path: 'preview-fte-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview' },
  },
  {
    path: 'claim/preview-fte-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview' },
  },
  {
    path: 'preview-ltc-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview' },
  },
  {
    path: 'claim/preview-ltc-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview' },
  },
  {
    path: 'preview-resettlement-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview' },
  },
  {
    path: 'claim/preview-resettlement-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExecutorRoutingModule {}
