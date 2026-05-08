import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApproverComponent } from './approver.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { AuthGuard } from '../auth.guard';

import { InboxComponent } from './pages/form-request/inbox/inbox.component';
import { OutboxComponent } from './pages/form-request/outbox/outbox.component';
import { ApprovedComponent } from './pages/form-request/approved/approved.component';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';
import { ReturnedComponent } from './pages/form-request/returned/returned.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/manage-esign/esign/esign.component';
import { RedirectComponent } from './pages/manage-esign/redirect/redirect.component';
import { FaqComponent } from './pages/faq/faq.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';
import { FormPilotageDetailComponent } from './pages/form-detail/form-pilotage-detail/form-pilotage-detail.component';
import { PassedComponent } from './pages/form-request/passed/passed.component';
import { NotPassedComponent } from './pages/form-request/not-passed/not-passed.component';
import { PilotageHistoryStatusComponent } from './pages/form-detail/pilotage-history-status/pilotage-history-status.component';
import { FormClaimDetailComponent } from './pages/form-detail/form-claim-detail/form-claim-detail.component';
import { PayInboxComponent } from './pages/pay-request/pay-inbox/pay-inbox.component';
import { PayOutboxComponent } from './pages/pay-request/pay-outbox/pay-outbox.component';
import { PayApprovedComponent } from './pages/pay-request/pay-approved/pay-approved.component';
import { PayNotApprovedComponent } from './pages/pay-request/pay-not-approved/pay-not-approved.component';
import { FormPayDetailComponent } from './pages/form-detail/form-pay-detail/form-pay-detail.component';
import { ManualDraftComponent } from './pages/form-request/manual-draft/manual-draft.component';
import { BudgetAllocationComponent } from './pages/settings/budget-allocation/budget-allocation.component';
import { ArchiveComponent } from './pages/form-request/archive/archive.component';

const routes: Routes = [
  {
    path: '',
    component: ApproverComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' }
  },
  {
    path: 'dashboard-back',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' }
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Password' }
  },

  // Detail Pages
  {
    path: 'form-pilotage-detail',
    component: FormPilotageDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pilotage Detail' }
  },
  {
    path: 'form-claim-detail',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Detail' }
  },
  {
    path: 'preview-voucher',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Voucher Preview' }
  },
  {
    path: 'movement-update-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Movement Update Claim' }
  },
  {
    path: 'preview-pmt-duty-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview' }
  },
  {
    path: 'preview-ty-duty-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Claim Preview' }
  },
  {
    path: 'preview-fte-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview' }
  },
  {
    path: 'preview-ltc-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview' }
  },
  {
    path: 'preview-resettlement-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview' }
  },
  {
    path: 'preview-resettlement',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Preview' }
  },
  {
    path: 'preview-pm-resettlementaim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Preview (Legacy Alias)' }
  },

  {
    path: 'inbox',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Inbox' }
  },
  {
    path: 'outbox',
    component: OutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Outbox' }
  },
  {
    path: 'approved',
    component: ApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Approved' }
  },
  {
    path: 'rejected',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Rejected' }
  },
  {
    path: 'not-approved',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Not Approved' }
  },
  {
    path: 'switch-module',
    component: SwitchModuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Switch Module' }
  },
  {
    path: 'profile-setting',
    component: ProfileSettingComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profile Setting' }
  },
  {
    path: 'settings',
    component: BudgetAllocationComponent,
    canActivate: [AuthGuard],
    data: { title: 'Settings' }
  },
  {
    path: 'esign',
    component: EsignComponent,
    canActivate: [AuthGuard],
    data: { title: 'Esign' }
  },
  {
    path: 'redirect',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Redirect' }
  },
  {
    path: 'redirectPil',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Redirect' }
  },

  {
    path: 'faq',
    component: FaqComponent,
    canActivate: [AuthGuard],
    data: { title: 'FAQ' }
  },
  {
    path: 'web-detail',
    component: WebDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Web Detail' },
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
    path: 'pilotage-history-status',
    component: PilotageHistoryStatusComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pilotage History Status' },
  },
  {
    path: 'pay-inbox',
    component: PayInboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Inbox' },
  },
  {
    path: 'pay-outbox',
    component: PayOutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Outbox' },
  },
  {
    path: 'pay-approved',
    component: PayApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Approved' },
  },
  {
    path: 'pay-not-approved',
    component: PayNotApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Not Approved' },
  },
  {
    path: 'form-pay-detail',
    component: FormPayDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Detail' },
  },
  {
    path: 'manual-draft',
    component: ManualDraftComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Draft' },
  },
  {
    path: 'budget-allocation',
    component: BudgetAllocationComponent,
    canActivate: [AuthGuard],
    data: { title: 'Budget Allocation' },
  },
  {
    path: 'archive',
    component: ArchiveComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archive' },
  },
  {
    path: 'claim-archive',
    component: ArchiveComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Archive' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApproverRoutingModule { }
