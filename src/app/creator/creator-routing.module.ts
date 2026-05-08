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
import { FormManualAdvComponent } from './pages/form/form-manual-adv/form-manual-adv.component';
import { FormManualAdvDetailComponent } from './pages/form-detail/form-manual-adv-detail/form-manual-adv-detail.component';
import { FormLtcAvailedHistoryComponent } from './pages/form/form-ltc-availed-history/form-ltc-availed-history.component';
import { FormLtcAvailedHistoryDetailComponent } from './pages/form-detail/form-ltc-availed-history-detail/form-ltc-availed-history-detail.component';
import { FormPayDetailsComponent } from './pages/form/form-pay-details/form-pay-details.component';
import { FormPayDetailsDetailComponent } from './pages/form-detail/form-pay-details-detail/form-pay-details-detail.component';
import { MovementUpdateClaimComponent } from './pages/claim/movement-update-claim/movement-update-claim.component';
import { PreviewVoucherComponent } from './pages/claim/preview-voucher/preview-voucher.component';
import { ClaimNewComponent } from './pages/claim/claim-new/claim-new.component';
import { ClaimFormShellComponent } from './pages/claim/claim-form-shell/claim-form-shell.component';
import { ArchiveComponent } from './pages/form-request/archive/archive.component';

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
    path: 'claim/inbox',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Inbox' },
  },
  {
    path: 'outbox',
    component: OutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Outbox' },
  },
  {
    path: 'claim/outbox',
    component: OutboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Outbox' },
  },
  {
    path: 'draft',
    component: DraftComponent,
    canActivate: [AuthGuard],
    data: { title: 'Draft' },
  },
  {
    path: 'claim/draft',
    component: DraftComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Draft' },
  },
  {
    path: 'approved',
    component: ApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Approved' },
  },
  {
    path: 'claim/approved',
    component: ApprovedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Approved' },
  },
  {
    path: 'rejected',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Rejected' },
  },
  {
    path: 'claim/not-approved',
    component: ReturnedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Not Approved' },
  },

  {
    path: 'new',
    component: NewComponent,
    canActivate: [AuthGuard],
    data: { title: 'New Claim' },
  },
  {
    path: 'claim/new',
    component: ClaimNewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim New' },
  },
  {
    path: 'form-tyduty',
    component: FormTydutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Advance' },
  },
  {
    path: 'form-fte',
    component: FormFteComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Advance' },
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
    data: { title: 'Creator Profile' },
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
    path: 'redirect',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Redirect' },
  },
  {
    path: 'redirectPil',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Redirect' },
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
    data: { title: 'FAQ' },
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
    path: 'claim/passed',
    component: PassedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Passed' },
  },
  {
    path: 'not-passed',
    component: NotPassedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Not Passed' },
  },
  {
    path: 'claim/not-passed',
    component: NotPassedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Not Passed' },
  },
  {
    path: 'archive',
    component: ArchiveComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archive' },
  },
  {
    path: 'claim/archive',
    component: ArchiveComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim Archive' },
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
    data: { title: 'TY Duty Detail' },
  },
  {
    path: 'preview-ty-duty-claim',
    component: FormTydutyDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Claim Preview' },
  },
  {
    path: 'preview-ty-duty',
    component: FormTydutyDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Advance Preview' },
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
    data: { title: 'FTE Detail' },
  },
  {
    path: 'form-pmt-detail',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Detail' },
  },
  {
    path: 'form-pmt',
    component: FormPmtDutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Advance' },
  },
  {
    path: 'form-ltc-detail',
    component: FormLtcDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Detail' },
  },
  {
    path: 'form-ltc',
    component: FormLtcAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance' },
  },
  {
    path: 'form-manual-adv',
    component: FormManualAdvComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance' },
  },
  {
    path: 'form-manual-adv-detail',
    component: FormManualAdvDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manual Advance Detail' },
  },
  {
    path: 'form-ltc-availed-history',
    component: FormLtcAvailedHistoryComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History' },
  },
  {
    path: 'form-ltc-availed-history-detail',
    component: FormLtcAvailedHistoryDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Availed History Detail' },
  },
  {
    path: 'form-pay-details',
    component: FormPayDetailsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Details' },
  },
  {
    path: 'form-pay-details-detail',
    component: FormPayDetailsDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Details Detail' },
  },
  {
    path: 'movement-update-claim',
    component: MovementUpdateClaimComponent,
    canActivate: [AuthGuard],
    data: { title: 'Movement Update Claim' },
  },
  {
    path: 'preview-voucher',
    component: PreviewVoucherComponent,
    canActivate: [AuthGuard],
    data: { title: 'Preview Voucher' },
  },
  {
    path: 'claim-new',
    component: ClaimNewComponent,
    canActivate: [AuthGuard],
    data: { title: 'Claim New' },
  },
  {
    path: 'form-pmt-duty-claim',
    component: FormPmtDutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Duty Claim' },
  },
  {
    path: 'form-ty-duty-claim',
    component: FormTydutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Claim' },
  },
  {
    path: 'form-fte-claim',
    component: FormFteComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim' },
  },
  {
    path: 'form-ltc-claim',
    component: FormLtcAdvanceComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim' },
  },
  {
    path: 'form-resettlement-claim',
    component: FormPmtDutyComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim' },
  },
  {
    path: 'preview-pmt-duty-claim',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Duty Claim Preview' },
  },
  {
    path: 'preview-pmt-duty',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'PMT Duty Advance Preview' },
  },
  {
    path: 'preview-fte-claim',
    component: FormFteDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'FTE Claim Preview' },
  },
  {
    path: 'preview-ltc-claim',
    component: FormLtcDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Claim Preview' },
  },
  {
    path: 'preview-ltc-advance',
    component: FormLtcDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'LTC Advance Preview' },
  },
  {
    path: 'preview-resettlement-claim',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Claim Preview' },
  },
  {
    path: 'preview-resettlement',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Advance Preview' },
  },
  {
    path: 'preview-pm-resettlementaim',
    component: FormPmtDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Resettlement Supplementary Preview' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatorRoutingModule {}
