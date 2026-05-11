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
import { PassedComponent } from './pages/form-request/passed/passed.component';
import { NotPassedComponent } from './pages/form-request/not-passed/not-passed.component';
import { FormClaimDetailComponent } from './pages/form-detail/form-claim-detail/form-claim-detail.component';
import { PayInboxComponent } from './pages/pay-request/pay-inbox/pay-inbox.component';
import { PayOutboxComponent } from './pages/pay-request/pay-outbox/pay-outbox.component';
import { PayApprovedComponent } from './pages/pay-request/pay-approved/pay-approved.component';
import { PayNotApprovedComponent } from './pages/pay-request/pay-not-approved/pay-not-approved.component';
import { FormPayDetailComponent } from './pages/form-detail/form-pay-detail/form-pay-detail.component';
import { ManualDraftComponent } from './pages/form-request/manual-draft/manual-draft.component';
import { BudgetAllocationComponent } from './pages/settings/budget-allocation/budget-allocation.component';
import { ArchiveComponent } from './pages/form-request/archive/archive.component';
import { FormAdvanceDetailComponent } from './pages/form-detail/form-advance-detail/form-advance-detail.component';
import { SettingsLauncherComponent } from './pages/settings/settings-launcher/settings-launcher.component';

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
    path: 'form-claim-detail',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Detail', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'form-pmt-duty',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Advance Review', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-pmt-duty',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Advance Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'form-ty-duty',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Advance Review', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-ty-duty',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Advance Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'form-fte-advance',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Advance Review', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-fte-advance',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Advance Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'form-ltc-advance',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance Review', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-ltc-advance',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'form-manual-adv',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance Review', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-manual-adv',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'form-ltc-availed-history',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History Review', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-ltc-availed-history',
    component: FormAdvanceDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-voucher',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Voucher Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'movement-update-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Movement Update Claim', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-pmt-duty-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Claim Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-ty-duty-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Claim Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-fte-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-ltc-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-resettlement-claim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-resettlement',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Preview', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'preview-pm-resettlementaim',
    component: FormClaimDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Preview (Legacy Alias)', roles: ['VE1', 'VE2', 'AP'] }
  },

  {
    path: 'inbox',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Inbox', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'outbox',
    component: OutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Outbox', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'approved',
    component: ApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Approved', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'rejected',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Rejected', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'not-approved',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Not Approved', roles: ['VE1', 'VE2', 'AP'] }
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
    component: SettingsLauncherComponent,
    canActivate: [AuthGuard],
    data: { title: 'Settings', roles: ['VE1'] }
  },
  {
    path: 'esign',
    component: EsignComponent,
    canActivate: [AuthGuard],
    data: { title: 'Esign', roles: ['VE1', 'VE2', 'AP'] }
  },
  {
    path: 'redirect',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Redirect', roles: ['VE1', 'VE2', 'AP'] }
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
    data: { title: 'Passed', roles: ['VE1'] },
  },
  {
    path: 'not-passed',
    component: NotPassedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Not Passed', roles: ['VE1'] },
  },
  {
    path: 'pay-inbox',
    component: PayInboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Inbox', roles: ['VE1', 'VE2'] },
  },
  {
    path: 'pay-outbox',
    component: PayOutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Outbox', roles: ['VE1', 'VE2'] },
  },
  {
    path: 'pay-approved',
    component: PayApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Approved', roles: ['VE1', 'VE2'] },
  },
  {
    path: 'pay-not-approved',
    component: PayNotApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Not Approved', roles: ['VE1', 'VE2'] },
  },
  {
    path: 'form-pay-detail',
    component: FormPayDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Detail', roles: ['VE1', 'VE2'] },
  },
  {
    path: 'manual-draft',
    component: ManualDraftComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Draft', roles: ['VE1'] },
  },
  {
    path: 'budget-allocation',
    component: BudgetAllocationComponent,
    canActivate: [AuthGuard],
    data: { title: 'Budget Allocation', roles: ['VE1'] },
  },
  {
    path: 'archive',
    component: ArchiveComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archive', roles: ['VE1'] },
  },
  {
    path: 'claim-archive',
    component: ArchiveComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Archive', roles: ['VE1'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApproverRoutingModule { }


