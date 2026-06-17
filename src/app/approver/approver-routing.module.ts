import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApproverComponent } from './approver.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/support/change-password/change-password.component';
import { AuthGuard } from '../auth.guard';

import { InboxComponent } from './pages/advance/queues/inbox/inbox.component';
import { OutboxComponent } from './pages/advance/queues/outbox/outbox.component';
import { ApprovedComponent } from './pages/advance/queues/approved/approved.component';
import { ReturnedComponent } from './pages/advance/queues/returned/returned.component';
import { ProfileSettingComponent } from './pages/support/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/support/esign/esign/esign.component';
import { RedirectComponent } from './pages/support/esign/redirect/redirect.component';
import { FaqComponent } from './pages/support/faq/faq.component';
import { WebDetailComponent } from './pages/support/web-detail/web-detail.component';
import { PassedComponent } from './pages/advance/queues/passed/passed.component';
import { NotPassedComponent } from './pages/advance/queues/not-passed/not-passed.component';
import { FormClaimDetailComponent } from './pages/claim/detail/form-claim-detail.component';
import { PayInboxComponent } from './pages/payment/queues/inbox/pay-inbox.component';
import { PayOutboxComponent } from './pages/payment/queues/outbox/pay-outbox.component';
import { PayApprovedComponent } from './pages/payment/queues/approved/pay-approved.component';
import { PayNotApprovedComponent } from './pages/payment/queues/not-approved/pay-not-approved.component';
import { FormPayDetailComponent } from './pages/payment/detail/form-pay-detail.component';
import { ManualDraftComponent } from './pages/advance/queues/manual-draft/manual-draft.component';
import { BudgetAllocationComponent } from './pages/settings/budget-allocation/budget-allocation.component';
import { ArchiveComponent } from './pages/advance/queues/archive/archive.component';
import { FormAdvanceDetailComponent } from './pages/advance/detail/form-advance-detail.component';
import { SettingsLauncherComponent } from './pages/settings/launcher/settings-launcher.component';
import { ClaimInboxComponent } from './pages/claim/queues/inbox/claim-inbox.component';
import { ClaimOutboxComponent } from './pages/claim/queues/outbox/claim-outbox.component';
import { ClaimApprovedComponent } from './pages/claim/queues/approved/claim-approved.component';
import { ClaimNotApprovedComponent } from './pages/claim/queues/not-approved/claim-not-approved.component';
import { ClaimPassedComponent } from './pages/claim/queues/passed/claim-passed.component';
import { ClaimNotPassedComponent } from './pages/claim/queues/not-passed/claim-not-passed.component';
import { ClaimArchiveComponent } from './pages/claim/queues/archive/claim-archive.component';
import { ClaimPreviewVoucherComponent } from './pages/claim/previews/voucher/claim-preview-voucher.component';
import { ClaimMovementUpdateComponent } from './pages/claim/previews/movement-update/claim-movement-update.component';
import { ClaimPreviewPmtDutyComponent } from './pages/claim/previews/pmt-duty/claim-preview-pmt-duty.component';
import { ClaimPreviewTyDutyComponent } from './pages/claim/previews/ty-duty/claim-preview-ty-duty.component';
import { ClaimPreviewFteComponent } from './pages/claim/previews/fte/claim-preview-fte.component';
import { ClaimPreviewLtcComponent } from './pages/claim/previews/ltc/claim-preview-ltc.component';
import { ClaimPreviewResettlementComponent } from './pages/claim/previews/resettlement/claim-preview-resettlement.component';
import { AdvanceFormPmtDutyComponent } from './pages/advance/reviews/pmt-duty/advance-form-pmt-duty.component';
import { AdvancePreviewPmtDutyComponent } from './pages/advance/previews/pmt-duty/advance-preview-pmt-duty.component';
import { AdvanceFormTyDutyComponent } from './pages/advance/reviews/ty-duty/advance-form-ty-duty.component';
import { AdvancePreviewTyDutyComponent } from './pages/advance/previews/ty-duty/advance-preview-ty-duty.component';
import { AdvanceFormFteComponent } from './pages/advance/reviews/fte/advance-form-fte.component';
import { AdvancePreviewFteComponent } from './pages/advance/previews/fte/advance-preview-fte.component';
import { AdvanceFormLtcComponent } from './pages/advance/reviews/ltc/advance-form-ltc.component';
import { AdvancePreviewLtcComponent } from './pages/advance/previews/ltc/advance-preview-ltc.component';
import { AdvanceFormManualComponent } from './pages/advance/reviews/manual/advance-form-manual.component';
import { AdvancePreviewManualComponent } from './pages/advance/previews/manual/advance-preview-manual.component';
import { AdvanceFormLtcHistoryComponent } from './pages/advance/reviews/ltc-history/advance-form-ltc-history.component';
import { AdvancePreviewLtcHistoryComponent } from './pages/advance/previews/ltc-history/advance-preview-ltc-history.component';

const routes: Routes = [
  {
    path: '',
    component: ApproverComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { title: 'Dashboard' } },
      { path: 'dashboard-back', component: DashboardComponent, canActivate: [AuthGuard], data: { title: 'Dashboard' } },
      { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard], data: { title: 'Change Password' } },
      { path: 'form-claim-detail', component: FormClaimDetailComponent, canActivate: [AuthGuard], data: { title: 'Claim Detail', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-pmt-duty', component: AdvanceFormPmtDutyComponent, canActivate: [AuthGuard], data: { title: 'PMT Advance Review', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-pmt-duty', component: AdvancePreviewPmtDutyComponent, canActivate: [AuthGuard], data: { title: 'PMT Advance Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-ty-duty', component: AdvanceFormTyDutyComponent, canActivate: [AuthGuard], data: { title: 'TY Duty Advance Review', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-ty-duty', component: AdvancePreviewTyDutyComponent, canActivate: [AuthGuard], data: { title: 'TY Duty Advance Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-fte-advance', component: AdvanceFormFteComponent, canActivate: [AuthGuard], data: { title: 'FTE Advance Review', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-fte-advance', component: AdvancePreviewFteComponent, canActivate: [AuthGuard], data: { title: 'FTE Advance Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-ltc-advance', component: AdvanceFormLtcComponent, canActivate: [AuthGuard], data: { title: 'LTC Advance Review', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-ltc-advance', component: AdvancePreviewLtcComponent, canActivate: [AuthGuard], data: { title: 'LTC Advance Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-manual-adv', component: AdvanceFormManualComponent, canActivate: [AuthGuard], data: { title: 'Manual Advance Review', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-manual-adv', component: AdvancePreviewManualComponent, canActivate: [AuthGuard], data: { title: 'Manual Advance Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-ltc-availed-history', component: AdvanceFormLtcHistoryComponent, canActivate: [AuthGuard], data: { title: 'LTC Availed History Review', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-ltc-availed-history', component: AdvancePreviewLtcHistoryComponent, canActivate: [AuthGuard], data: { title: 'LTC Availed History Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-voucher', component: ClaimPreviewVoucherComponent, canActivate: [AuthGuard], data: { title: 'Voucher Preview', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'movement-update-claim', component: ClaimMovementUpdateComponent, canActivate: [AuthGuard], data: { title: 'Movement Update Claim', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'preview-pmt-duty-claim', component: ClaimPreviewPmtDutyComponent, canActivate: [AuthGuard], data: { title: 'PMT Claim Preview', roles: ['VE1', 'VE2', 'AP'], subFormId: 'PMT' } },
      { path: 'preview-ty-duty-claim', component: ClaimPreviewTyDutyComponent, canActivate: [AuthGuard], data: { title: 'TY Duty Claim Preview', roles: ['VE1', 'VE2', 'AP'], subFormId: 'TYD' } },
      { path: 'preview-fte-claim', component: ClaimPreviewFteComponent, canActivate: [AuthGuard], data: { title: 'FTE Claim Preview', roles: ['VE1', 'VE2', 'AP'], subFormId: 'FTE' } },
      { path: 'preview-ltc-claim', component: ClaimPreviewLtcComponent, canActivate: [AuthGuard], data: { title: 'LTC Claim Preview', roles: ['VE1', 'VE2', 'AP'], subFormId: 'LTC' } },
      { path: 'preview-resettlement-claim', component: ClaimPreviewResettlementComponent, canActivate: [AuthGuard], data: { title: 'Resettlement Claim Preview', roles: ['VE1', 'VE2', 'AP'], subFormId: 'RS' } },
      { path: 'preview-resettlement', component: ClaimPreviewResettlementComponent, canActivate: [AuthGuard], data: { title: 'Resettlement Preview', roles: ['VE1', 'VE2', 'AP'], subFormId: 'RS' } },
      { path: 'preview-pm-resettlementaim', component: ClaimPreviewResettlementComponent, canActivate: [AuthGuard], data: { title: 'Resettlement Preview (Legacy Alias)', roles: ['VE1', 'VE2', 'AP'], subFormId: 'RS' } },
      { path: 'inbox', component: InboxComponent, canActivate: [AuthGuard], data: { title: 'Inbox', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'IB' } },
      { path: 'claim/inbox', component: ClaimInboxComponent, canActivate: [AuthGuard], data: { title: 'Claim Inbox', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'IB' } },
      { path: 'inbox-claim', redirectTo: 'claim/inbox', pathMatch: 'full' },
      { path: 'outbox', component: OutboxComponent, canActivate: [AuthGuard], data: { title: 'Outbox', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'OB' } },
      { path: 'claim/outbox', component: ClaimOutboxComponent, canActivate: [AuthGuard], data: { title: 'Claim Outbox', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'OB' } },
      { path: 'outbox-claim', redirectTo: 'claim/outbox', pathMatch: 'full' },
      { path: 'approved', component: ApprovedComponent, canActivate: [AuthGuard], data: { title: 'Approved', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'AP' } },
      { path: 'claim/approved', component: ClaimApprovedComponent, canActivate: [AuthGuard], data: { title: 'Claim Approved', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'AP' } },
      { path: 'approved-claim', redirectTo: 'claim/approved', pathMatch: 'full' },
      { path: 'rejected', component: ReturnedComponent, canActivate: [AuthGuard], data: { title: 'Rejected', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'RJ' } },
      { path: 'claim/rejected', component: ReturnedComponent, canActivate: [AuthGuard], data: { title: 'Claim Rejected', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'RJ' } },
      { path: 'not-approved', component: ReturnedComponent, canActivate: [AuthGuard], data: { title: 'Not Approved', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'NA' } },
      { path: 'claim/not-approved', component: ClaimNotApprovedComponent, canActivate: [AuthGuard], data: { title: 'Claim Not Approved', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'NA' } },
      { path: 'not-approved-claim', redirectTo: 'claim/not-approved', pathMatch: 'full' },
      { path: 'profile-setting', component: ProfileSettingComponent, canActivate: [AuthGuard], data: { title: 'Profile Setting' } },
      { path: 'settings', component: SettingsLauncherComponent, canActivate: [AuthGuard], data: { title: 'Settings', roles: ['VE1', 'VE2'] } },
      { path: 'esign', component: EsignComponent, canActivate: [AuthGuard], data: { title: 'Esign', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'redirect', component: RedirectComponent, canActivate: [AuthGuard], data: { title: 'eSign Redirect', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'faq', component: FaqComponent, canActivate: [AuthGuard], data: { title: 'FAQ' } },
      { path: 'web-detail', component: WebDetailComponent, canActivate: [AuthGuard], data: { title: 'Web Detail' } },
      { path: 'passed', component: PassedComponent, canActivate: [AuthGuard], data: { title: 'Passed', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'PS' } },
      { path: 'claim/passed', component: ClaimPassedComponent, canActivate: [AuthGuard], data: { title: 'Claim Passed', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'PS' } },
      { path: 'passed-claim', redirectTo: 'claim/passed', pathMatch: 'full' },
      { path: 'not-passed', component: NotPassedComponent, canActivate: [AuthGuard], data: { title: 'Not Passed', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'NP' } },
      { path: 'claim/not-passed', component: ClaimNotPassedComponent, canActivate: [AuthGuard], data: { title: 'Claim Not Passed', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'NP' } },
      { path: 'not-passed-claim', redirectTo: 'claim/not-passed', pathMatch: 'full' },
      { path: 'pay-inbox', component: PayInboxComponent, canActivate: [AuthGuard], data: { title: 'Pay Inbox', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'pay-outbox', component: PayOutboxComponent, canActivate: [AuthGuard], data: { title: 'Pay Outbox', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'pay-approved', component: PayApprovedComponent, canActivate: [AuthGuard], data: { title: 'Pay Approved', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'pay-not-approved', component: PayNotApprovedComponent, canActivate: [AuthGuard], data: { title: 'Pay Not Approved', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-pay-detail', component: FormPayDetailComponent, canActivate: [AuthGuard], data: { title: 'Pay Detail', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'form-pay-details', component: FormPayDetailComponent, canActivate: [AuthGuard], data: { title: 'Pay Detail', roles: ['VE1', 'VE2', 'AP'] } },
      { path: 'manual-draft', component: ManualDraftComponent, canActivate: [AuthGuard], data: { title: 'Manual Draft', roles: ['VE1'] } },
      { path: 'budget-allocation', component: BudgetAllocationComponent, canActivate: [AuthGuard], data: { title: 'Budget Allocation', roles: ['VE1'] } },
      { path: 'archive', component: ArchiveComponent, canActivate: [AuthGuard], data: { title: 'Archive', roles: ['VE1', 'VE2', 'AP'], queueModule: 'ADV', queueState: 'AC' } },
      { path: 'claim/archive', component: ClaimArchiveComponent, canActivate: [AuthGuard], data: { title: 'Claim Archive', roles: ['VE1', 'VE2', 'AP'], queueModule: 'CLM', queueState: 'AC' } },
      { path: 'archive-claim', redirectTo: 'claim/archive', pathMatch: 'full' },
      { path: 'claim-archive', redirectTo: 'claim/archive', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApproverRoutingModule { }



