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
import { FileExcelService } from 'src/app/service/fileexcel.service';

import { AdminRoutingModule } from './system-admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';

import { ManageSystemAdminComponent } from './pages/manage-user/manage-system-admin/manage-system-admin.component';
import { ManageUnitAdminComponent } from './pages/manage-user/manage-unit-admin/manage-unit-admin.component';
import { AddMappingUnitComponent } from './pages/manage-user/mapping-of-unit/add-mapping-unit/add-mapping-unit.component';
import { MappingUnitComponent } from './pages/manage-user/mapping-of-unit/mapping-unit/mapping-unit.component';
import { VersionHistoryComponent } from './pages/manage-masters/manage-version-history/version-history/version-history.component';
import { AddVersionHistoryModalComponent } from './pages/manage-masters/manage-version-history/add-version-history-modal/add-version-history-modal.component';
import { DocumentsComponent } from './pages/manage-masters/manage-document/documents/documents.component';
import { AddDocumentsModalComponent } from './pages/manage-masters/manage-document/add-documents-modal/add-documents-modal.component';
import { AddFaqModalComponent } from './pages/manage-masters/manage-faq/add-faq-modal/add-faq-modal.component';
import { FaqComponent } from './pages/manage-masters/manage-faq/faq/faq.component';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { ManageApproverComponent } from './pages/manage-user/manage-approver/manage-approver.component';
import { MappingApproverFormComponent } from './pages/mapping-approver-form/mapping-approver-form.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';
import { PortComponent } from './pages/manage-masters/manage-port/port/port.component';
import { AddPortModalComponent } from './pages/manage-masters/manage-port/add-port-modal/add-port-modal.component';
import { ShipComponent } from './pages/manage-masters/manage-ship/ship/ship.component';
import { AddShipModalComponent } from './pages/manage-masters/manage-ship/add-ship-modal/add-ship-modal.component';
import { InboxComponent } from './pages/audit-import-export/inbox/inbox.component';
import { ExportedComponent } from './pages/audit-import-export/exported/exported.component';
import { ArchivedComponent } from './pages/audit-import-export/archived/archived.component';
import { ImportComponent } from './pages/audit-import-export/import/import.component';
import { ImportedComponent } from './pages/audit-import-export/imported/imported.component';
import { ArchivedImportComponent } from './pages/audit-import-export/archived-import/archived-import.component';
import { PortRateComponent } from './pages/manage-masters/manage-port-rate/port-rate/port-rate.component';
import { AddPortRateModalComponent } from './pages/manage-masters/manage-port-rate/add-port-rate-modal/add-port-rate-modal.component';
import { ManageRoleComponent } from './pages/manage-role/manage-role.component';


const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false
};

@NgModule({ declarations: [
        SidebarComponent,
        DashboardComponent,
        ChangePasswordComponent,
        ManageSystemAdminComponent,
        ManageUnitAdminComponent,
        AddMappingUnitComponent,
        MappingUnitComponent,
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
        FaqComponent,
        SwitchModuleComponent,
        ProfileSettingComponent,
        ManageApproverComponent,
        MappingApproverFormComponent,
        InboxComponent,
        ExportedComponent,
        ArchivedComponent,
        ImportComponent,
        ImportedComponent,
        ArchivedImportComponent,
    ManageRoleComponent,    WebDetailComponent,
    ], imports: [RouterModule,
        CommonModule,
        AdminRoutingModule,
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
export class SystemAdminModule { }
