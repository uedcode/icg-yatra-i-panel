import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ComponentModule } from '../app-component.module';
import { DirectiveModule } from '../app-directive.module';
import { PipeModule } from '../app-pipe.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxSpinnerModule } from 'ngx-spinner';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrderModule } from 'ngx-order-pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AuthGuard } from '../auth.guard';
import { HeaderInterceptor } from '../HeaderInterceptor';
import { FileExcelService } from 'src/app/service/form/file-excel.service';

import { AdminRoutingModule } from './system-admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/support/change-password/change-password.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { SystemAdminComponent } from './system-admin.component';

import { ManageSystemAdminComponent } from './pages/manage-user/manage-system-admin/manage-system-admin.component';
import { ManageUnitAdminComponent } from './pages/manage-user/manage-unit-admin/manage-unit-admin.component';
import { VersionHistoryComponent } from './pages/manage-masters/manage-version-history/version-history/version-history.component';
import { AddVersionHistoryModalComponent } from './pages/manage-masters/manage-version-history/add-version-history-modal/add-version-history-modal.component';
import { DocumentsComponent } from './pages/manage-masters/manage-document/documents/documents.component';
import { AddDocumentsModalComponent } from './pages/manage-masters/manage-document/add-documents-modal/add-documents-modal.component';
import { AddFaqModalComponent } from './pages/manage-masters/manage-faq/add-faq-modal/add-faq-modal.component';
import { FaqComponent as ManageFaqComponent } from './pages/manage-masters/manage-faq/faq/faq.component';
import { FaqComponent as SupportFaqComponent } from './pages/support/faq/faq.component';
import { ProfileSettingComponent } from './pages/support/profile-setting/profile-setting.component';
import { WebDetailComponent } from './pages/support/web-detail/web-detail.component';
import { PortComponent } from './pages/manage-masters/manage-port/port/port.component';
import { AddPortModalComponent } from './pages/manage-masters/manage-port/add-port-modal/add-port-modal.component';
import { ShipComponent } from './pages/manage-masters/manage-ship/ship/ship.component';
import { AddShipModalComponent } from './pages/manage-masters/manage-ship/add-ship-modal/add-ship-modal.component';
import { InboxComponent } from './pages/import-export/normal/inbox/inbox.component';
import { ExportedComponent } from './pages/import-export/normal/exported/exported.component';
import { ArchivedComponent } from './pages/import-export/normal/archived/archived.component';
import { ImportComponent } from './pages/import-export/normal/import/import.component';
import { ImportedComponent } from './pages/import-export/normal/imported/imported.component';
import { ArchivedImportComponent } from './pages/import-export/normal/archived-import/archived-import.component';
import { BackupImportComponent } from './pages/import-export/normal/backup-import/backup-import.component';
import { BackupExportComponent } from './pages/import-export/normal/backup-export/backup-export.component';
import { DiaryImportComponent } from './pages/import-export/diary/import/diary-import.component';
import { DiaryImportedComponent } from './pages/import-export/diary/imported/diary-imported.component';
import { DiaryImportedBackupComponent } from './pages/import-export/diary/imported-backup/diary-imported-backup.component';
import { SysAdminExcelImportComponent } from './pages/import-export/excel/import/excel-import.component';
import { PortRateComponent } from './pages/manage-masters/manage-port-rate/port-rate/port-rate.component';
import { AddPortRateModalComponent } from './pages/manage-masters/manage-port-rate/add-port-rate-modal/add-port-rate-modal.component';
import { ManageRoleComponent } from './pages/manage-role/manage-role.component';
import { ReasonComponent } from './pages/manage-masters/manage-reason/reason/reason.component';
import { AddReasonModalComponent } from './pages/manage-masters/manage-reason/add-reason-modal/add-reason-modal.component';
import { BusinessRuleComponent } from './pages/manage-masters/manage-business-rule/business-rule/business-rule.component';
import { AddBusinessRuleModalComponent } from './pages/manage-masters/manage-business-rule/add-business-rule-modal/add-business-rule-modal.component';
import { MessageComponent } from './pages/manage-masters/manage-message/message/message.component';
import { AddMessageModalComponent } from './pages/manage-masters/manage-message/add-message-modal/add-message-modal.component';
import { PayLevelComponent } from './pages/manage-masters/manage-pay-level/pay-level/pay-level.component';
import { AddPayLevelModalComponent } from './pages/manage-masters/manage-pay-level/add-pay-level-modal/add-pay-level-modal.component';
import { TyDutyPurposeComponent } from './pages/manage-masters/manage-ty-duty-purpose/ty-duty-purpose/ty-duty-purpose.component';
import { AddTyDutyPurposeModalComponent } from './pages/manage-masters/manage-ty-duty-purpose/add-ty-duty-purpose-modal/add-ty-duty-purpose-modal.component';
import { EsignReportComponent } from './pages/reports/esign-report/esign-report.component';
import { StatisticsComponent } from './pages/reports/statistics/statistics.component';
import { PreviewReportComponent } from './pages/reports/preview-report/preview-report.component';
import { SettingsLauncherComponent } from './pages/settings/launcher/settings-launcher.component';


const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false
};

@NgModule({ declarations: [
        SidebarComponent,
        SystemAdminComponent,
        DashboardComponent,
        ChangePasswordComponent,
        ManageSystemAdminComponent,
        ManageUnitAdminComponent,
        // manage master
        VersionHistoryComponent,
        AddVersionHistoryModalComponent,
        DocumentsComponent,
        AddDocumentsModalComponent,
        AddFaqModalComponent,
        PortComponent,
        AddPortModalComponent,
        PortRateComponent,
        AddPortRateModalComponent,
        ShipComponent,
        AddShipModalComponent,
        ManageFaqComponent,
        SupportFaqComponent,
        ReasonComponent,
        AddReasonModalComponent,
        BusinessRuleComponent,
        AddBusinessRuleModalComponent,
        MessageComponent,
        AddMessageModalComponent,
        PayLevelComponent,
        AddPayLevelModalComponent,
        TyDutyPurposeComponent,
        AddTyDutyPurposeModalComponent,
        EsignReportComponent,
        StatisticsComponent,
        PreviewReportComponent,
        SettingsLauncherComponent,
        ProfileSettingComponent,
        InboxComponent,
        ExportedComponent,
        ArchivedComponent,
        ImportComponent,
        ImportedComponent,
        ArchivedImportComponent,
        BackupImportComponent,
        BackupExportComponent,
        DiaryImportComponent,
        DiaryImportedComponent,
        DiaryImportedBackupComponent,
        SysAdminExcelImportComponent,
    ManageRoleComponent,    WebDetailComponent,
    ], imports: [RouterModule,
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        NgxPaginationModule,
        NgxChartsModule,
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
export class SystemAdminModule { }
