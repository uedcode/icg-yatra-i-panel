import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ComponentModule } from '../app-component.module';
import { DirectiveModule } from '../app-directive.module';
import { PipeModule } from '../app-pipe.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrderModule } from 'ngx-order-pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AuthGuard } from '../auth.guard';
import { HeaderInterceptor } from '../HeaderInterceptor';
import { FileExcelService } from 'src/app/service/form/file-excel.service';

import { ApproverRoutingModule } from './approver-routing.module';
import { ApproverComponent } from './approver.component';

import { SidebarComponent } from './common/shell/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/support/change-password/change-password.component';
import { InboxComponent } from './pages/advance/queues/inbox/inbox.component';
import { OutboxComponent } from './pages/advance/queues/outbox/outbox.component';
import { ApprovedComponent } from './pages/advance/queues/approved/approved.component';
import { ReturnedComponent } from './pages/advance/queues/returned/returned.component';
import { ProfileSettingComponent } from './pages/support/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/support/esign/esign/esign.component';
import { RedirectComponent } from './pages/support/esign/redirect/redirect.component';
import { FaqComponent } from './pages/support/faq/faq.component';
import { WebDetailComponent } from './pages/support/web-detail/web-detail.component';
import { NotPassedComponent } from './pages/advance/queues/not-passed/not-passed.component';
import { PassedComponent } from './pages/advance/queues/passed/passed.component';
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

const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false
};

@NgModule({ declarations: [
        SidebarComponent,
        DashboardComponent,
        ChangePasswordComponent,
        ApproverComponent,
        InboxComponent,
        OutboxComponent,
        ApprovedComponent,
        ReturnedComponent,
        ProfileSettingComponent,
        FaqComponent,
        WebDetailComponent,
        EsignComponent,
        RedirectComponent,
        PassedComponent,
        NotPassedComponent,
        FormClaimDetailComponent,
        PayInboxComponent,
        PayOutboxComponent,
        PayApprovedComponent,
        PayNotApprovedComponent,
        FormPayDetailComponent,
        FormAdvanceDetailComponent,
        ManualDraftComponent,
        BudgetAllocationComponent,
        SettingsLauncherComponent,
        ArchiveComponent,
        ClaimInboxComponent,
        ClaimOutboxComponent,
        ClaimApprovedComponent,
        ClaimNotApprovedComponent,
        ClaimPassedComponent,
        ClaimNotPassedComponent,
        ClaimArchiveComponent,
        ClaimPreviewVoucherComponent,
        ClaimMovementUpdateComponent,
        ClaimPreviewPmtDutyComponent,
        ClaimPreviewTyDutyComponent,
        ClaimPreviewFteComponent,
        ClaimPreviewLtcComponent,
        ClaimPreviewResettlementComponent,
        AdvanceFormPmtDutyComponent,
        AdvancePreviewPmtDutyComponent,
        AdvanceFormTyDutyComponent,
        AdvancePreviewTyDutyComponent,
        AdvanceFormFteComponent,
        AdvancePreviewFteComponent,
        AdvanceFormLtcComponent,
        AdvancePreviewLtcComponent,
        AdvanceFormManualComponent,
        AdvancePreviewManualComponent,
        AdvanceFormLtcHistoryComponent,
        AdvancePreviewLtcHistoryComponent,
    ], imports: [RouterModule,
        CommonModule,
        ApproverRoutingModule,
        FormsModule,
        NgxPaginationModule,
        NgxSpinnerModule,
        NgxSelectModule.forRoot(CustomSelectOptions),
        NgMultiSelectDropDownModule.forRoot(),
        OrderModule,
        AngularEditorModule,
        ComponentModule,
        DirectiveModule,
        PipeModule], providers: [
        AuthGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HeaderInterceptor,
            multi: true,
        },
        [DatePipe],
        [FileExcelService],
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class ApproverModule { }

