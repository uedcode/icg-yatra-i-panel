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
import { CommonPreviewTyDutyAdvanceComponent } from '../components/common-form-detail/preview/advance/ty-duty/common-preview-ty-duty-advance/common-preview-ty-duty-advance.component';
import { CommonPreviewPmtDutyAdvanceComponent } from '../components/common-form-detail/preview/advance/pmt-duty/common-preview-pmt-duty-advance/common-preview-pmt-duty-advance.component';
import { CommonPreviewFteAdvanceComponent } from '../components/common-form-detail/preview/advance/fte/common-preview-fte-advance/common-preview-fte-advance.component';
import { CommonPreviewLtcAdvanceComponent } from '../components/common-form-detail/preview/advance/ltc/common-preview-ltc-advance/common-preview-ltc-advance.component';
import { CommonPreviewManualAdvanceComponent } from '../components/common-form-detail/preview/advance/manual/common-preview-manual-advance/common-preview-manual-advance.component';
import { CommonPreviewLtcAvailedHistoryComponent } from '../components/common-form-detail/preview/advance/ltc-availed-history/common-preview-ltc-availed-history/common-preview-ltc-availed-history.component';
import { CommonPreviewTyDutyClaimComponent } from '../components/common-form-detail/preview/claim/ty-duty/common-preview-ty-duty-claim/common-preview-ty-duty-claim.component';
import { CommonPreviewPmtDutyClaimComponent } from '../components/common-form-detail/preview/claim/pmt-duty/common-preview-pmt-duty-claim/common-preview-pmt-duty-claim.component';
import { CommonPreviewFteClaimComponent } from '../components/common-form-detail/preview/claim/fte/common-preview-fte-claim/common-preview-fte-claim.component';
import { CommonPreviewLtcClaimComponent } from '../components/common-form-detail/preview/claim/ltc/common-preview-ltc-claim/common-preview-ltc-claim.component';
import { CommonPreviewResettlementClaimComponent } from '../components/common-form-detail/preview/claim/resettlement/common-preview-resettlement-claim/common-preview-resettlement-claim.component';

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
    component: CommonPreviewPmtDutyAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Duty Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ty-duty',
    component: CommonPreviewTyDutyAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-fte-advance',
    component: CommonPreviewFteAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Advance Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ltc-advance',
    component: CommonPreviewLtcAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-manual-adv',
    component: CommonPreviewManualAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-ltc-availed-history',
    component: CommonPreviewLtcAvailedHistoryComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History Preview', roles: EXECUTOR_ROLES },
  },
  {
    path: 'preview-pmt-duty-claim',
    component: CommonPreviewPmtDutyClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'PMT' },
  },
  {
    path: 'claim/preview-pmt-duty-claim',
    component: CommonPreviewPmtDutyClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'PMT' },
  },
  {
    path: 'preview-ty-duty-claim',
    component: CommonPreviewTyDutyClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'TYD' },
  },
  {
    path: 'claim/preview-ty-duty-claim',
    component: CommonPreviewTyDutyClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'TYD' },
  },
  {
    path: 'preview-fte-claim',
    component: CommonPreviewFteClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'FTE' },
  },
  {
    path: 'claim/preview-fte-claim',
    component: CommonPreviewFteClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'FTE' },
  },
  {
    path: 'preview-ltc-claim',
    component: CommonPreviewLtcClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'LTC' },
  },
  {
    path: 'claim/preview-ltc-claim',
    component: CommonPreviewLtcClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'LTC' },
  },
  {
    path: 'preview-resettlement-claim',
    component: CommonPreviewResettlementClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'RS' },
  },
  {
    path: 'claim/preview-resettlement-claim',
    component: CommonPreviewResettlementClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview', roles: EXECUTOR_ROLES, subFormId: 'RS' },
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
