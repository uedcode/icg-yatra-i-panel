import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { ExecutorComponent } from './executor.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SearchByPnoComponent } from './pages/search-by-pno/search-by-pno.component';
import { EsignReportComponent } from './pages/esign-report/esign-report.component';
import { PieChartComponent } from './pages/pie-chart/pie-chart.component';
import { ClaimPreviewComponent } from './pages/claim-preview/claim-preview.component';
import { CommonViewFileComponent } from '../components/common-view-file/common-view-file.component';

const EXECUTOR_ROLES = ['EX'];

const routes: Routes = [
  {
    path: 'view-file/:id',
    component: CommonViewFileComponent,
    canActivate: [AuthGuard],
    data: { title: 'View File', roles: EXECUTOR_ROLES },
  },
  {
    path: '',
    component: ExecutorComponent,
    children: [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard', roles: EXECUTOR_ROLES },
  },
  {
    path: 'search-by-pno',
    component: SearchByPnoComponent,
    canActivate: [AuthGuard],
    data: { title: 'Search By PNO', roles: EXECUTOR_ROLES },
  },
  {
    path: 'esign-report',
    component: EsignReportComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Report', roles: EXECUTOR_ROLES },
  },
  {
    path: 'pie-chart',
    component: PieChartComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pie Chart', roles: EXECUTOR_ROLES },
  },
  {
    path: 'form-claim-detail',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Detail', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-pmt-duty',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Duty Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ty-duty',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-fte-advance',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Advance Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ltc-advance',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-manual-adv',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ltc-availed-history',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-pmt-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'claim/preview-pmt-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ty-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'claim/preview-ty-duty-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-fte-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'claim/preview-fte-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ltc-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'claim/preview-ltc-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-resettlement-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'claim/preview-resettlement-claim',
    component: ClaimPreviewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExecutorRoutingModule {}
