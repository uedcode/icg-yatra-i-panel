import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatorComponent } from './creator.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/support/change-password/change-password.component';
import { AuthGuard } from '../auth.guard';

import { OutboxComponent } from './pages/advance/queues/outbox/outbox.component';
import { DraftComponent } from './pages/advance/queues/draft/draft.component';
import { ApprovedComponent } from './pages/advance/queues/approved/approved.component';
import { NewComponent } from './pages/advance/launcher/new.component';

import { InboxComponent } from './pages/advance/queues/inbox/inbox.component';
import { SwitchModuleComponent } from './pages/support/switch-module/switch-module.component';
import { ReturnedComponent } from './pages/advance/queues/returned/returned.component';
import { CreatorProfileComponent } from './pages/support/profile/creator-profile.component';
import { ProfileSettingComponent } from './pages/support/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/support/esign/esign/esign.component';
import { RedirectComponent } from './pages/support/esign/redirect/redirect.component';
import { ViewFileComponent } from './pages/support/view-file/view-file.component';
import { FaqComponent } from './pages/support/faq/faq.component';
import { WebDetailComponent } from './pages/support/web-detail/web-detail.component';
import { PassedComponent } from './pages/advance/queues/passed/passed.component';
import { NotPassedComponent } from './pages/advance/queues/not-passed/not-passed.component';
import { PreviewTyDutyComponent } from './pages/advance/previews/ty-duty/preview-ty-duty.component';
import { FormTydutyComponent } from './pages/advance/forms/ty-duty/form-tyduty.component';
import { FormFteDetailComponent } from './pages/advance/previews/fte/form-fte-detail.component';
import { FormFteComponent } from './pages/advance/forms/fte/form-fte.component';
import { FormPmtDetailComponent } from './pages/advance/previews/pmt/form-pmt-detail.component';
import { FormPmtDutyComponent } from './pages/advance/forms/pmt/form-pmt.component';
import { FormResettlementClaimComponent } from './pages/claim/forms/resettlement/form-resettlement-claim/form-resettlement-claim.component';
import { FormResettlementPreviewComponent } from './pages/claim/previews/resettlement-linked/form-resettlement-preview.component';
import { FormLtcDetailComponent } from './pages/advance/previews/ltc/form-ltc-detail.component';
import { FormLtcAdvanceComponent } from './pages/advance/forms/ltc/form-ltc.component';
import { FormManualAdvComponent } from './pages/advance/forms/manual-advance/form-manual-adv.component';
import { FormManualAdvDetailComponent } from './pages/advance/previews/manual-advance/form-manual-adv-detail.component';
import { FormLtcAvailedHistoryComponent } from './pages/advance/forms/ltc-availed-history/form-ltc-availed-history.component';
import { FormLtcAvailedHistoryDetailComponent } from './pages/advance/previews/ltc-availed-history/form-ltc-availed-history-detail.component';
import { FormPayDetailsComponent } from './pages/payment/form/pay-details/form-pay-details.component';
import { FormPayDetailsDetailComponent } from './pages/payment/previews/pay-details/form-pay-details-detail.component';
import { MovementUpdateClaimComponent } from './pages/claim/movement-update/movement-update-claim.component';
import { PreviewVoucherComponent } from './pages/claim/voucher-preview/preview-voucher.component';
import { ClaimNewComponent } from './pages/claim/launcher/claim-new.component';
import { ArchiveComponent } from './pages/advance/queues/archive/archive.component';
import { PayOutboxComponent } from './pages/payment/queues/outbox/pay-outbox.component';
import { PayApprovedComponent } from './pages/payment/queues/approved/pay-approved.component';
import { PayNotApprovedComponent } from './pages/payment/queues/not-approved/pay-not-approved.component';
import { ClaimInboxComponent } from './pages/claim/queues/inbox/claim-inbox.component';
import { ClaimOutboxComponent } from './pages/claim/queues/outbox/claim-outbox.component';
import { ClaimDraftComponent } from './pages/claim/queues/draft/claim-draft.component';
import { ClaimApprovedComponent } from './pages/claim/queues/approved/claim-approved.component';
import { ClaimNotApprovedComponent } from './pages/claim/queues/not-approved/claim-not-approved.component';
import { ClaimPassedComponent } from './pages/claim/queues/passed/claim-passed.component';
import { ClaimNotPassedComponent } from './pages/claim/queues/not-passed/claim-not-passed.component';
import { ClaimArchiveComponent } from './pages/claim/queues/archive/claim-archive.component';
import { ClaimFormPmtDutyComponent } from './pages/claim/forms/pmt-duty/claim-form-pmt-duty.component';
import { ClaimFormTyDutyComponent } from './pages/claim/forms/ty-duty/claim-form-ty-duty.component';
import { ClaimFormFteComponent } from './pages/claim/forms/fte/claim-form-fte.component';
import { ClaimFormLtcComponent } from './pages/claim/forms/ltc/claim-form-ltc.component';
import { ClaimFormResettlementComponent } from './pages/claim/forms/resettlement/claim-form-resettlement.component';
import { ClaimPreviewPmtDutyComponent } from './pages/claim/previews/pmt-duty/claim-preview-pmt-duty.component';
import { ClaimPreviewTyDutyComponent } from './pages/claim/previews/ty-duty/claim-preview-ty-duty.component';
import { ClaimPreviewFteComponent } from './pages/claim/previews/fte/claim-preview-fte.component';
import { ClaimPreviewLtcComponent } from './pages/claim/previews/ltc/claim-preview-ltc.component';
import { ClaimPreviewResettlementComponent } from './pages/claim/previews/resettlement/claim-preview-resettlement.component';

const CREATOR_ROLES = ['CR'];

const routes: Routes = [
  {
    path: '',
    component: CreatorComponent,
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
        data: { title: 'Dashboard', roles: CREATOR_ROLES },
      },
      {
        path: 'dashboard-back',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { title: 'Dashboard', roles: CREATOR_ROLES },
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
        data: { title: 'Change Password', roles: CREATOR_ROLES },
      },
      {
        path: 'switch-module',
        component: SwitchModuleComponent,
        canActivate: [AuthGuard],
        data: { title: 'Switch Module', roles: CREATOR_ROLES },
      },
      {
        path: 'claim/new',
        redirectTo: 'claim-new',
        pathMatch: 'full',
      },
      {
        path: 'new-claim',
        redirectTo: 'claim-new',
        pathMatch: 'full',
      },
      {
        path: 'movement-update-claim',
        component: MovementUpdateClaimComponent,
        canActivate: [AuthGuard],
        data: { title: 'Movement Update Claim', roles: CREATOR_ROLES },
      },
      {
        path: 'claim/movement-update-claim',
        redirectTo: 'movement-update-claim',
        pathMatch: 'full',
      },
      {
        path: 'preview-voucher',
        component: PreviewVoucherComponent,
        canActivate: [AuthGuard],
        data: { title: 'Preview Voucher', roles: CREATOR_ROLES },
      },
      {
        path: 'claim/preview-voucher',
        redirectTo: 'preview-voucher',
        pathMatch: 'full',
      },
      {
        path: 'claim-new',
        component: ClaimNewComponent,
        canActivate: [AuthGuard],
        data: { title: 'Claim New', roles: CREATOR_ROLES },
      },
      {
        path: 'form-tyduty-detail',
        redirectTo: 'preview-ty-duty',
        pathMatch: 'full',
      },
      {
        path: 'preview-ty-duty-claim',
        component: ClaimPreviewTyDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'TY Duty Claim Preview', roles: CREATOR_ROLES, subFormId: 'TYD', previewKind: 'claim' },
      },
      {
        path: 'preview-ty-duty',
        component: PreviewTyDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'TY Duty Advance Preview', roles: CREATOR_ROLES },
      },
      {
        path: 'form-fte-detail',
        component: FormFteDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'FTE Detail', roles: CREATOR_ROLES },
      },
      {
        path: 'form-pmt-detail',
        component: FormPmtDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'PMT Detail', roles: CREATOR_ROLES, subFormId: 'P', previewKind: 'advance' },
      },
      {
        path: 'form-ltc-detail',
        component: FormLtcDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Detail', roles: CREATOR_ROLES },
      },
      {
        path: 'form-pay-details-detail',
        component: FormPayDetailsDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'Pay Details Detail', roles: CREATOR_ROLES },
      },
      {
        path: 'preview-pmt-duty-claim',
        component: ClaimPreviewPmtDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'PMT Duty Claim Preview', roles: CREATOR_ROLES, subFormId: 'PMT', previewKind: 'claim' },
      },
      {
        path: 'preview-pmt-duty',
        component: FormPmtDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'PMT Duty Advance Preview', roles: CREATOR_ROLES },
      },
      {
        path: 'preview-fte-claim',
        component: ClaimPreviewFteComponent,
        canActivate: [AuthGuard],
        data: { title: 'FTE Claim Preview', roles: CREATOR_ROLES, subFormId: 'FTE', previewKind: 'claim' },
      },
      {
        path: 'preview-ltc-claim',
        component: ClaimPreviewLtcComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Claim Preview', roles: CREATOR_ROLES, subFormId: 'LTC', previewKind: 'claim' },
      },
      {
        path: 'preview-ltc-advance',
        component: FormLtcDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Advance Preview', roles: CREATOR_ROLES },
      },
      {
        path: 'preview-resettlement-claim',
        component: ClaimPreviewResettlementComponent,
        canActivate: [AuthGuard],
        data: { title: 'Resettlement Claim Preview', roles: CREATOR_ROLES, subFormId: 'RS', previewKind: 'claim' },
      },
      {
        path: 'preview-resettlement',
        component: FormResettlementPreviewComponent,
        canActivate: [AuthGuard],
        data: { title: 'Resettlement Advance Preview', roles: CREATOR_ROLES, subFormId: 'RS', previewKind: 'advance' },
      },
      {
        path: 'preview-pm-resettlementaim',
        component: ClaimPreviewResettlementComponent,
        canActivate: [AuthGuard],
        data: { title: 'Resettlement Supplementary Preview', roles: CREATOR_ROLES, subFormId: 'RS', previewKind: 'claim' },
      },
      {
        path: 'inbox',
        component: InboxComponent,
        canActivate: [AuthGuard],
        data: { title: 'Inbox - Advance', roles: CREATOR_ROLES, queueModule: 'ADV' },
      },
      {
        path: 'claim/inbox',
        component: ClaimInboxComponent,
        canActivate: [AuthGuard],
        data: { title: 'Inbox - Claim', roles: CREATOR_ROLES, queueModule: 'CLM' },
      },
      { path: 'inbox-claim', redirectTo: 'claim/inbox', pathMatch: 'full' },
      {
        path: 'outbox',
        component: OutboxComponent,
        canActivate: [AuthGuard],
        data: { title: 'Outbox - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'OB' },
      },
      {
        path: 'claim/outbox',
        component: ClaimOutboxComponent,
        canActivate: [AuthGuard],
        data: { title: 'Outbox - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'OB' },
      },
      { path: 'outbox-claim', redirectTo: 'claim/outbox', pathMatch: 'full' },
      {
        path: 'draft',
        component: DraftComponent,
        canActivate: [AuthGuard],
        data: { title: 'Draft - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'DR' },
      },
      {
        path: 'claim/draft',
        component: ClaimDraftComponent,
        canActivate: [AuthGuard],
        data: { title: 'Draft - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'DR' },
      },
      { path: 'draft-claim', redirectTo: 'claim/draft', pathMatch: 'full' },
      {
        path: 'approved',
        component: ApprovedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Approved - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'AP' },
      },
      {
        path: 'claim/approved',
        component: ClaimApprovedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Approved - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'AP' },
      },
      { path: 'approved-claim', redirectTo: 'claim/approved', pathMatch: 'full' },
      {
        path: 'rejected',
        component: ReturnedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Not Approved - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'NA' },
      },
      { path: 'not-approved', redirectTo: 'rejected', pathMatch: 'full' },
      {
        path: 'claim/not-approved',
        component: ClaimNotApprovedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Not Approved - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'NA' },
      },
      { path: 'not-approved-claim', redirectTo: 'claim/not-approved', pathMatch: 'full' },
      {
        path: 'new',
        component: NewComponent,
        canActivate: [AuthGuard],
        data: { title: 'New Claim', roles: CREATOR_ROLES },
      },
      {
        path: 'creator-profile',
        component: CreatorProfileComponent,
        canActivate: [AuthGuard],
        data: { title: 'Creator Profile', roles: CREATOR_ROLES },
      },
      {
        path: 'profile-setting',
        component: ProfileSettingComponent,
        canActivate: [AuthGuard],
        data: { title: 'Profile Setting', roles: CREATOR_ROLES },
      },
      {
        path: 'esign',
        component: EsignComponent,
        canActivate: [AuthGuard],
        data: { title: 'Esign', roles: CREATOR_ROLES },
      },
      {
        path: 'test-esign',
        component: EsignComponent,
        canActivate: [AuthGuard],
        data: { title: 'Test ESign (Legacy Alias)', roles: CREATOR_ROLES },
      },
      {
        path: 'redirect',
        component: RedirectComponent,
        canActivate: [AuthGuard],
        data: { title: 'eSign Redirect', roles: CREATOR_ROLES },
      },
      {
        path: 'view-file/:id',
        component: ViewFileComponent,
        canActivate: [AuthGuard],
        data: { title: 'View File', roles: CREATOR_ROLES },
      },
      {
        path: 'faq',
        component: FaqComponent,
        canActivate: [AuthGuard],
        data: { title: 'FAQ', roles: CREATOR_ROLES },
      },
      {
        path: 'web-detail',
        component: WebDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'Web Detail', roles: CREATOR_ROLES },
      },
      {
        path: 'passed',
        component: PassedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Passed - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'PS' },
      },
      {
        path: 'claim/passed',
        component: ClaimPassedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Passed - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'PS' },
      },
      { path: 'passed-claim', redirectTo: 'claim/passed', pathMatch: 'full' },
      {
        path: 'not-passed',
        component: NotPassedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Not Passed - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'NP' },
      },
      {
        path: 'claim/not-passed',
        component: ClaimNotPassedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Not Passed - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'NP' },
      },
      { path: 'not-passed-claim', redirectTo: 'claim/not-passed', pathMatch: 'full' },
      {
        path: 'archive',
        component: ArchiveComponent,
        canActivate: [AuthGuard],
        data: { title: 'Archive - Advance', roles: CREATOR_ROLES, queueModule: 'ADV', queueState: 'AC' },
      },
      {
        path: 'claim/archive',
        component: ClaimArchiveComponent,
        canActivate: [AuthGuard],
        data: { title: 'Archive - Claim', roles: CREATOR_ROLES, queueModule: 'CLM', queueState: 'AC' },
      },
      { path: 'archive-claim', redirectTo: 'claim/archive', pathMatch: 'full' },
      { path: 'claim-archive', redirectTo: 'claim/archive', pathMatch: 'full' },
      {
        path: 'form-tyduty',
        component: FormTydutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'TY Duty Advance', roles: CREATOR_ROLES },
      },
      {
        path: 'form-fte',
        component: FormFteComponent,
        canActivate: [AuthGuard],
        data: { title: 'FTE Advance', roles: CREATOR_ROLES },
      },
      {
        path: 'form-pmt',
        component: FormPmtDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'PMT Advance', roles: CREATOR_ROLES, subFormId: 'P', formKind: 'advance' },
      },
      {
        path: 'form-ltc',
        component: FormLtcAdvanceComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Advance', roles: CREATOR_ROLES, subFormId: 'L', formKind: 'advance' },
      },
      {
        path: 'form-manual-adv',
        component: FormManualAdvComponent,
        canActivate: [AuthGuard],
        data: { title: 'Manual Advance', roles: CREATOR_ROLES },
      },
      {
        path: 'form-manual-adv-detail',
        component: FormManualAdvDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'Manual Advance Detail', roles: CREATOR_ROLES },
      },
      {
        path: 'form-ltc-availed-history',
        component: FormLtcAvailedHistoryComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Availed History', roles: CREATOR_ROLES },
      },
      {
        path: 'form-ltc-availed-history-detail',
        component: FormLtcAvailedHistoryDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Availed History Detail', roles: CREATOR_ROLES },
      },
      {
        path: 'form-pay-details',
        component: FormPayDetailsComponent,
        canActivate: [AuthGuard],
        data: { title: 'Pay Details', roles: CREATOR_ROLES },
      },
      {
        path: 'pay-outbox',
        component: PayOutboxComponent,
        canActivate: [AuthGuard],
        data: { title: 'Pay Outbox', roles: CREATOR_ROLES },
      },
      {
        path: 'pay-approved',
        component: PayApprovedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Pay Approved', roles: CREATOR_ROLES },
      },
      {
        path: 'pay-not-approved',
        component: PayNotApprovedComponent,
        canActivate: [AuthGuard],
        data: { title: 'Pay Not Approved', roles: CREATOR_ROLES },
      },
      {
        path: 'form-pmt-duty-claim',
        component: ClaimFormPmtDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'PMT Duty Claim', roles: CREATOR_ROLES, subFormId: 'PMT', formKind: 'claim' },
      },
      {
        path: 'form-ty-duty-claim',
        component: ClaimFormTyDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'TY Duty Claim', roles: CREATOR_ROLES, subFormId: 'TYD', formKind: 'claim' },
      },
      {
        path: 'form-fte-claim',
        component: ClaimFormFteComponent,
        canActivate: [AuthGuard],
        data: { title: 'FTE Claim', roles: CREATOR_ROLES, subFormId: 'FTE', formKind: 'claim' },
      },
      {
        path: 'form-ltc-claim',
        component: ClaimFormLtcComponent,
        canActivate: [AuthGuard],
        data: { title: 'LTC Claim', roles: CREATOR_ROLES, subFormId: 'LTC', formKind: 'claim' },
      },
      {
        path: 'form-resettlement-claim',
        component: ClaimFormResettlementComponent,
        canActivate: [AuthGuard],
        data: { title: 'Resettlement Claim', roles: CREATOR_ROLES, subFormId: 'RS', formKind: 'claim' },
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
export class CreatorRoutingModule {}



