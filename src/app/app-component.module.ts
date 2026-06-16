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
import { FileExcelService } from './service/form/file-excel.service';

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
import { CommonDocumentComponent } from './components/common-form-detail/common-document/common-document.component';
import { CommonDocumentDetailComponent } from './components/common-form-detail/common-document-detail/common-document-detail.component';
import { CommonEsignComponent } from './components/common-esign/common-esign/common-esign.component';
import { CommonEsignModalComponent } from './components/common-esign/common-esign-modal/common-esign-modal.component';
import { CommonRedirectComponent } from './components/common-esign/common-redirect/common-redirect.component';
import { CommonViewFileComponent } from './components/common-view-file/common-view-file.component';

import { ExportFormModalComponent } from './modals/export-form-modal/export-form-modal.component';
import { ChangeBatchStatusComponent } from './modals/change-batch-status/change-batch-status.component';
import { ExcelImportModalComponent } from './modals/excel-import-modal/excel-import-modal.component';
import { ChangeStatusStagingModalComponent } from './modals/change-status-staging-modal/change-status-staging-modal.component';
import { DeleteStagingModalComponent } from './modals/delete-staging-modal/delete-staging-modal.component';
import { CommonViewFormHistoryModalComponent } from './modals/common-view-form-history-modal/common-view-form-history-modal.component';
import { CommonTydutyDetailComponent } from './components/common-form-detail/common-tyduty-detail/common-tyduty-detail.component';
import { CommonFteDetailComponent } from './components/common-form-detail/common-fte-detail/common-fte-detail.component';

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
    ExcelImportModalComponent,
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
    ExcelImportModalComponent,
    ChangeStatusStagingModalComponent,
    DeleteStagingModalComponent,

    CommonViewFormHistoryModalComponent,
  ],
  providers: [[DatePipe], [ShowZeroPipe], [FileExcelService]],
})
export class ComponentModule {}
