import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatorComponent } from './creator.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { AuthGuard } from '../auth.guard';

import { OutboxComponent } from './pages/form-request/outbox/outbox.component';
import { DraftComponent } from './pages/form-request/draft/draft.component';
import { ApprovedComponent } from './pages/form-request/approved/approved.component';
import { NewComponent } from './pages/new/new.component';

import { InboxComponent } from './pages/form-request/inbox/inbox.component';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';
import { ReturnedComponent } from './pages/form-request/returned/returned.component';
import { CreatorProfileComponent } from './pages/creator-profile/creator-profile.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/manage-esign/esign/esign.component';
import { RedirectComponent } from './pages/manage-esign/redirect/redirect.component';
import { ViewFileComponent } from './pages/view-file/view-file.component';
import { FaqComponent } from './pages/faq/faq.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';
import { FormPilotageComponent } from './pages/form/form-pilotage/form-pilotage.component';
import { FormPilotageDetailComponent } from './pages/form-detail/form-pilotage-detail/form-pilotage-detail.component';
import { PreviewDetailsComponent } from './pages/form/preview-details/preview-details.component';
import { PassedComponent } from './pages/form-request/passed/passed.component';
import { NotPassedComponent } from './pages/form-request/not-passed/not-passed.component';
import { PilotageHistoryComponent } from './pages/form/pilotage-history-pages/pilotage-history/pilotage-history.component';
import { PilotageHistoryStatusComponent } from './pages/form/pilotage-history-pages/pilotage-history-status/pilotage-history-status.component';
import { FormTydutyDetailComponent } from './pages/form-detail/form-tyduty-detail/form-tyduty-detail.component';
import { FormTydutyComponent } from './pages/form/form-tyduty/form-tyduty.component';
import { FormFteDetailComponent } from './pages/form-detail/form-fte-detail/form-fte-detail.component';
import { FormFteComponent } from './pages/form/form-fte/form-fte.component';
import { FormPmtDetailComponent } from './pages/form-detail/form-pmt-detail/form-pmt-detail.component';
import { FormPmtDutyComponent } from './pages/form/form-pmt/form-pmt.component';
import { FormLtcDetailComponent } from './pages/form-detail/form-ltc-detail/form-ltc-detail.component';
import { FormLtcAdvanceComponent } from './pages/form/form-ltc/form-ltc.component';

const routes: Routes = [
  {
    path: '',
    component: CreatorComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'dashboard-back',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Password' },
  },
  {
    path: 'switch-module',
    component: SwitchModuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Switch Module' },
  },

  {
    path: 'form-pilotage',
    component: FormPilotageComponent,
    canActivate: [AuthGuard],
    data: { title: 'Form Pilotage' },
  },
  {
    path: 'inbox',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Inbox' },
  },
  {
    path: 'outbox',
    component: OutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Outbox' },
  },
  {
    path: 'draft',
    component: DraftComponent,
    canActivate: [AuthGuard],
    data: { title: 'Draft' },
  },
  {
    path: 'approved',
    component: ApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Approved' },
  },
  {
    path: 'rejected',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Rejected' },
  },

  {
    path: 'new',
    component: NewComponent,
    canActivate: [AuthGuard],
    data: { title: ' New Page' },
  },
  {
    path: 'form-tyduty',
    component: FormTydutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'Form Tyduty' },
  },
  {
    path: 'form-fte',
    component: FormFteComponent,
    canActivate: [AuthGuard],
    data: { title: 'Form Fte' },
  },

  // Detail Pages
  {
    path: 'form-pilotage-detail',
    component: FormPilotageDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pilotage Detail' },
  },
  {
    path: 'creator-profile',
    component: CreatorProfileComponent,
    //canActivate: [AuthGuard],
    data: { title: 'Creator profile' },
  },
  {
    path: 'profile-setting',
    component: ProfileSettingComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profile Setting' },
  },
  {
    path: 'esign',
    component: EsignComponent,
    canActivate: [AuthGuard],
    data: { title: 'Esign' },
  },
  {
    path: 'redirectPil',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    data: { title: 'Redirect' },
  },
  {
    path: 'view-file/:id',
    component: ViewFileComponent,
    canActivate: [AuthGuard],
    data: { title: 'View File' },
  },
  {
    path: 'faq',
    component: FaqComponent,
    canActivate: [AuthGuard],
    data: { title: 'Faq' },
  },
  {
    path: 'web-detail',
    component: WebDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Web Detail' },
  },
  {
    path: 'preview-details',
    component: PreviewDetailsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Preview Pilotage' },
  },
  {
    path: 'passed',
    component: PassedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Passed' },
  },
  {
    path: 'not-passed',
    component: NotPassedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Not Passed' },
  },
  {
    path: 'pilotage-history',
    component: PilotageHistoryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pilotage History' },
  },
  {
    path: 'pilotage-history-status',
    component: PilotageHistoryStatusComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pilotage History Status' },
  },
  {
    path: 'form-tyduty-detail',
    component: FormTydutyDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Tyduty Detail' },
  },
  {
    path: 'form-tyduty',
    component: FormTydutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'Tyduty Advance' },
  },
  {
    path: 'form-fte',
    component: FormFteComponent,
    canActivate: [AuthGuard],
    data: { title: 'Fte Advance' },
  },
  {
    path: 'form-fte-detail',
    component: FormFteDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Fte Detail' },
  },
  {
    path: 'form-pmt-detail',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pmt Detail' },
  },
  {
    path: 'form-pmt',
    component: FormPmtDutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pmt Advance' },
  },
  {
    path: 'form-ltc-detail',
    component: FormLtcDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Ltc Detail' },
  },
  {
    path: 'form-ltc',
    component: FormLtcAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'Ltc Advance' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatorRoutingModule {}
