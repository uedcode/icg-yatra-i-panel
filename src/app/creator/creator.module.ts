import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ComponentModule } from '../app-component.module';
import { DirectiveModule } from '../app-directive.module';
import { PipeModule } from '../app-pipe.module';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrderModule } from 'ngx-order-pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AuthGuard } from '../auth.guard';
import { HeaderInterceptor } from '../HeaderInterceptor';
import { FileExcelService } from 'src/app/service/core/file-excel.service';

import { CreatorRoutingModule } from './creator-routing.module';
import { CreatorComponent } from './creator.component';

import { SidebarComponent } from './common/shell/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/support/change-password/change-password.component';

import { OutboxComponent } from './pages/advance/queues/outbox/outbox.component';
import { DraftComponent } from './pages/advance/queues/draft/draft.component';
import { ApprovedComponent } from './pages/advance/queues/approved/approved.component';
import { NewComponent } from './pages/advance/launcher/new.component';
import { InboxComponent } from './pages/advance/queues/inbox/inbox.component';
import { ReturnedComponent } from './pages/advance/queues/returned/returned.component';
import { CreatorProfileComponent } from './pages/support/profile/creator-profile.component';
import { ProfileSettingComponent } from './pages/support/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/support/esign/esign/esign.component';
import { RedirectComponent } from './pages/support/esign/redirect/redirect.component';
import { FaqComponent } from './pages/support/faq/faq.component';
import { WebDetailComponent } from './pages/support/web-detail/web-detail.component';

import { PassedComponent } from './pages/advance/queues/passed/passed.component';
import { NotPassedComponent } from './pages/advance/queues/not-passed/not-passed.component';
import { FormTydutyComponent } from './pages/advance/forms/ty-duty/form-tyduty.component';
import { FormFteComponent } from './pages/advance/forms/fte/form-fte.component';
import { PreviewFteAdvanceComponent } from './pages/advance/previews/fte-advance/preview-fte-advance.component';
import { FormPmtDutyComponent } from './pages/advance/forms/pmt/form-pmt.component';
import { PreviewPmtDutyComponent } from './pages/advance/previews/pmt-duty-advance/preview-pmt-duty-advance.component';
import { PreviewTyDutyComponent } from './pages/advance/previews/ty-duty-advance/preview-ty-duty-advance.component';
import { FormResettlementPreviewComponent } from './pages/claim/previews/resettlement-advance/preview-resettlement-advance.component';
import { FormLtcAdvanceComponent } from './pages/advance/forms/ltc/form-ltc.component';
import { PreviewLtcAdvanceComponent } from './pages/advance/previews/ltc-advance/preview-ltc-advance.component';
import { FormManualAdvComponent } from './pages/advance/forms/manual-advance/form-manual-adv.component';
import { PreviewManualAdvanceComponent } from './pages/advance/previews/manual-advance/preview-manual-advance.component';
import { FormLtcAvailedHistoryComponent } from './pages/advance/forms/ltc-availed-history/form-ltc-availed-history.component';
import { PreviewLtcAvailedHistoryComponent } from './pages/advance/previews/ltc-availed-history/preview-ltc-availed-history.component';
import { FormPayDetailsComponent } from './pages/payment/form/pay-details/form-pay-details.component';
import { FormPayDetailsDetailComponent } from './pages/payment/previews/pay-details/form-pay-details-detail.component';
import { MovementUpdateClaimComponent } from './pages/claim/movement-update/movement-update-claim.component';
import { PreviewVoucherComponent } from './pages/claim/voucher-preview/preview-voucher.component';
import { ClaimNewComponent } from './pages/claim/launcher/claim-new.component';
import { ClaimFormShellComponent } from './pages/claim/shell/claim-form-shell.component';
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
import { ClaimPreviewPmtDutyComponent } from './pages/claim/previews/pmt-duty-claim/preview-pmt-duty-claim.component';
import { ClaimPreviewTyDutyComponent } from './pages/claim/previews/ty-duty-claim/preview-ty-duty-claim.component';
import { ClaimPreviewFteComponent } from './pages/claim/previews/fte-claim/preview-fte-claim.component';
import { ClaimPreviewLtcComponent } from './pages/claim/previews/ltc-claim/preview-ltc-claim.component';
import { ClaimPreviewResettlementComponent } from './pages/claim/previews/resettlement-claim/preview-resettlement-claim.component';

const CustomSelectOptions: INgxSelectOptions = {
  // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false,
};

@NgModule({
  declarations: [
    SidebarComponent,
    DashboardComponent,
    ChangePasswordComponent,
    CreatorComponent,
    // new component add here
    InboxComponent,
    OutboxComponent,
    DraftComponent,
    ApprovedComponent,
    ReturnedComponent,
    NewComponent,
    CreatorProfileComponent,
    ProfileSettingComponent,
    EsignComponent,
    RedirectComponent,
    FaqComponent,
    WebDetailComponent,
    PassedComponent,
    NotPassedComponent,

    FormTydutyComponent,
    FormFteComponent,
    PreviewFteAdvanceComponent,
    FormPmtDutyComponent,
    PreviewPmtDutyComponent,
    PreviewTyDutyComponent,
    FormResettlementPreviewComponent,
    FormLtcAdvanceComponent,
    PreviewLtcAdvanceComponent,
    FormManualAdvComponent,
    PreviewManualAdvanceComponent,
    FormLtcAvailedHistoryComponent,
    PreviewLtcAvailedHistoryComponent,
    FormPayDetailsComponent,
    FormPayDetailsDetailComponent,
    PayOutboxComponent,
    PayApprovedComponent,
    PayNotApprovedComponent,
    MovementUpdateClaimComponent,
    PreviewVoucherComponent,
    ClaimNewComponent,
    ClaimFormShellComponent,
    ArchiveComponent,
    ClaimInboxComponent,
    ClaimOutboxComponent,
    ClaimDraftComponent,
    ClaimApprovedComponent,
    ClaimNotApprovedComponent,
    ClaimPassedComponent,
    ClaimNotPassedComponent,
    ClaimArchiveComponent,
    ClaimFormPmtDutyComponent,
    ClaimFormTyDutyComponent,
    ClaimFormFteComponent,
    ClaimFormLtcComponent,
    ClaimFormResettlementComponent,
    ClaimPreviewPmtDutyComponent,
    ClaimPreviewTyDutyComponent,
    ClaimPreviewFteComponent,
    ClaimPreviewLtcComponent,
    ClaimPreviewResettlementComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    CreatorRoutingModule,
    FormsModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    NgxSelectModule.forRoot(CustomSelectOptions),
    NgMultiSelectDropDownModule.forRoot(),
    OrderModule,
    AngularEditorModule,
    ComponentModule,
    DirectiveModule,
    PipeModule,
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true,
    },
    [DatePipe],
    [FileExcelService],
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class CreatorModule {}

