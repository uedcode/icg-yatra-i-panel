import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrderModule } from 'ngx-order-pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { LogoutModalComponent } from './modals/logout-modal/logout-modal.component';
import { DeleteModalComponent } from './modals/delete-modal/delete-modal.component';
import { ChangeStatusModalComponent } from './modals/change-status-modal/change-status-modal.component';
import { ShowMsgModalComponent } from './modals/show-msg-modal/show-msg-modal.component';
import { ViewUserModalComponent } from './modals/view-user-modal/view-user-modal.component';
import { ViewRemarkModalComponent } from './modals/view-remark-modal/view-remark-modal.component';
import { PipeModule } from './app-pipe.module';
import { DirectiveModule } from './app-directive.module';
import { RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonChangePasswordComponent } from './components/common-change-password/common-change-password.component';
import { ShowZeroPipe } from './pipe/show-zero.pipe';
import { FileExcelService } from './service/core/file-excel.service';

import { CommonManageFaqComponent } from './components/faq/common-manage-faq/common-manage-faq.component';
import { CommonAddFaqModalComponent } from './components/faq/common-add-faq-modal/common-add-faq-modal.component';
import { CommonFaqComponent } from './components/faq/common-faq/common-faq.component';

import { ViewErrorModalComponent } from './modals/view-error-modal/view-error-modal.component';
import { CommonChangeStatusActionComponent } from './components/change-status/common-change-status-action/common-change-status-action.component';
import { LoginFooterComponent } from './components/login-footer/login-footer.component';
import { CommonWebDetailComponent } from './components/common-web-detail/common-web-detail/common-web-detail.component';
import { CommonContactDetailModalComponent } from './components/common-web-detail/common-contact-detail-modal/common-contact-detail-modal.component';
import { CommonUserManualModalComponent } from './components/common-web-detail/common-user-manual-modal/common-user-manual-modal.component';
import { CommonProfileSettingComponent } from './components/common-profile-setting/common-profile-setting/common-profile-setting.component';
import { CommonEnableTOtpModalComponent } from './components/common-profile-setting/common-enable-t-otp-modal/common-enable-t-otp-modal.component';
import { CommonManageDeviceModalComponent } from './components/common-profile-setting/common-manage-device-modal/common-manage-device-modal.component';
import { CommonDocumentComponent } from './components/common-form-detail/document/document/common-document/common-document.component';
import { CommonDocumentDetailComponent } from './components/common-form-detail/document/document-detail/common-document-detail/common-document-detail.component';
import { CommonEsignComponent } from './components/common-esign/common-esign/common-esign.component';
import { CommonEsignModalComponent } from './components/common-esign/common-esign-modal/common-esign-modal.component';
import { CommonRedirectComponent } from './components/common-esign/common-redirect/common-redirect.component';
import { CommonViewFileComponent } from './components/common-view-file/common-view-file.component';

import { ExportFormModalComponent } from './modals/export-form-modal/export-form-modal.component';
import { ChangeBatchStatusComponent } from './modals/change-batch-status/change-batch-status.component';
import { BatchImportModalComponent } from './modals/batch-import-modal/batch-import-modal.component';
import { ChangeStatusStagingModalComponent } from './modals/change-status-staging-modal/change-status-staging-modal.component';
import { DeleteStagingModalComponent } from './modals/delete-staging-modal/delete-staging-modal.component';
import { CommonViewFormHistoryModalComponent } from './modals/common-view-form-history-modal/common-view-form-history-modal.component';
import { CommonTydutyDetailComponent } from './components/common-form-detail/form-detail/ty-duty/common-tyduty-detail/common-tyduty-detail.component';
import { CommonFteDetailComponent } from './components/common-form-detail/form-detail/fte/common-fte-detail/common-fte-detail.component';
import { CommonPreviewTyDutyAdvanceComponent } from './components/common-form-detail/preview/advance/ty-duty/common-preview-ty-duty-advance/common-preview-ty-duty-advance.component';
import { CommonPreviewPmtDutyAdvanceComponent } from './components/common-form-detail/preview/advance/pmt-duty/common-preview-pmt-duty-advance/common-preview-pmt-duty-advance.component';
import { CommonPreviewFteAdvanceComponent } from './components/common-form-detail/preview/advance/fte/common-preview-fte-advance/common-preview-fte-advance.component';
import { CommonPreviewLtcAdvanceComponent } from './components/common-form-detail/preview/advance/ltc/common-preview-ltc-advance/common-preview-ltc-advance.component';
import { CommonPreviewManualAdvanceComponent } from './components/common-form-detail/preview/advance/manual/common-preview-manual-advance/common-preview-manual-advance.component';
import { CommonPreviewLtcAvailedHistoryComponent } from './components/common-form-detail/preview/advance/ltc-availed-history/common-preview-ltc-availed-history/common-preview-ltc-availed-history.component';
import { CommonPreviewResettlementAdvanceComponent } from './components/common-form-detail/preview/advance/resettlement/common-preview-resettlement-advance/common-preview-resettlement-advance.component';
import { CommonPreviewTyDutyClaimComponent } from './components/common-form-detail/preview/claim/ty-duty/common-preview-ty-duty-claim/common-preview-ty-duty-claim.component';
import { CommonPreviewPmtDutyClaimComponent } from './components/common-form-detail/preview/claim/pmt-duty/common-preview-pmt-duty-claim/common-preview-pmt-duty-claim.component';
import { CommonPreviewFteClaimComponent } from './components/common-form-detail/preview/claim/fte/common-preview-fte-claim/common-preview-fte-claim.component';
import { CommonPreviewLtcClaimComponent } from './components/common-form-detail/preview/claim/ltc/common-preview-ltc-claim/common-preview-ltc-claim.component';
import { CommonPreviewResettlementClaimComponent } from './components/common-form-detail/preview/claim/resettlement/common-preview-resettlement-claim/common-preview-resettlement-claim.component';
import { CommonPreviewVoucherClaimComponent } from './components/common-form-detail/preview/claim/voucher/common-preview-voucher-claim/common-preview-voucher-claim.component';
import { CommonPreviewMovementUpdateClaimComponent } from './components/common-form-detail/preview/claim/movement-update/common-preview-movement-update-claim/common-preview-movement-update-claim.component';

const CustomSelectOptions: INgxSelectOptions = {
  // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false,
};

@NgModule({
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    NgxSelectModule.forRoot(CustomSelectOptions),
    NgMultiSelectDropDownModule.forRoot(),
    OrderModule,
    AngularEditorModule,

    DirectiveModule,
    PipeModule,
    NgxChartsModule,
    NgxExtendedPdfViewerModule,
    NgxDocViewerModule,
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    CommonChangePasswordComponent,

    DeleteModalComponent,
    ChangeStatusModalComponent,
    LogoutModalComponent,
    ShowMsgModalComponent,
    ViewUserModalComponent,
    ViewRemarkModalComponent,
    ViewErrorModalComponent,
    CommonManageFaqComponent,
    CommonAddFaqModalComponent,
    CommonFaqComponent,

    CommonChangeStatusActionComponent,

    /** Form Detail Starts */
    CommonTydutyDetailComponent,
    CommonFteDetailComponent,
    CommonPreviewTyDutyAdvanceComponent,
    CommonPreviewPmtDutyAdvanceComponent,
    CommonPreviewFteAdvanceComponent,
    CommonPreviewLtcAdvanceComponent,
    CommonPreviewManualAdvanceComponent,
    CommonPreviewLtcAvailedHistoryComponent,
    CommonPreviewResettlementAdvanceComponent,
    CommonPreviewTyDutyClaimComponent,
    CommonPreviewPmtDutyClaimComponent,
    CommonPreviewFteClaimComponent,
    CommonPreviewLtcClaimComponent,
    CommonPreviewResettlementClaimComponent,
    CommonPreviewVoucherClaimComponent,
    CommonPreviewMovementUpdateClaimComponent,
    /** Form Detail Ends */

    CommonWebDetailComponent,
    CommonContactDetailModalComponent,
    CommonUserManualModalComponent,
    LoginFooterComponent,
    CommonProfileSettingComponent,
    CommonEnableTOtpModalComponent,
    CommonManageDeviceModalComponent,
    CommonDocumentComponent,
    CommonDocumentDetailComponent,
    CommonEsignComponent,
    CommonEsignModalComponent,
    CommonRedirectComponent,
    CommonViewFileComponent,

    ExportFormModalComponent,
    ChangeBatchStatusComponent,
    BatchImportModalComponent,
    ChangeStatusStagingModalComponent,
    DeleteStagingModalComponent,

    CommonViewFormHistoryModalComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    CommonChangePasswordComponent,

    DeleteModalComponent,
    ChangeStatusModalComponent,
    LogoutModalComponent,
    ShowMsgModalComponent,

    ViewUserModalComponent,
    ViewRemarkModalComponent,
    ViewErrorModalComponent,

    CommonManageFaqComponent,
    CommonAddFaqModalComponent,
    CommonFaqComponent,

    CommonChangeStatusActionComponent,

    /** Form Detail Starts */
    CommonTydutyDetailComponent,
    CommonFteDetailComponent,
    CommonPreviewTyDutyAdvanceComponent,
    CommonPreviewPmtDutyAdvanceComponent,
    CommonPreviewFteAdvanceComponent,
    CommonPreviewLtcAdvanceComponent,
    CommonPreviewManualAdvanceComponent,
    CommonPreviewLtcAvailedHistoryComponent,
    CommonPreviewResettlementAdvanceComponent,
    CommonPreviewTyDutyClaimComponent,
    CommonPreviewPmtDutyClaimComponent,
    CommonPreviewFteClaimComponent,
    CommonPreviewLtcClaimComponent,
    CommonPreviewResettlementClaimComponent,
    CommonPreviewVoucherClaimComponent,
    CommonPreviewMovementUpdateClaimComponent,

    /** Form Detail Ends */
    CommonWebDetailComponent,
    CommonContactDetailModalComponent,
    CommonUserManualModalComponent,
    LoginFooterComponent,
    CommonProfileSettingComponent,
    CommonEnableTOtpModalComponent,
    CommonDocumentComponent,
    CommonDocumentDetailComponent,
    CommonEsignComponent,
    CommonEsignModalComponent,
    CommonRedirectComponent,
    CommonViewFileComponent,

    ExportFormModalComponent,
    ChangeBatchStatusComponent,
    BatchImportModalComponent,
    ChangeStatusStagingModalComponent,
    DeleteStagingModalComponent,

    CommonViewFormHistoryModalComponent,
  ],
  providers: [[DatePipe], [ShowZeroPipe], [FileExcelService]],
})
export class ComponentModule {}
