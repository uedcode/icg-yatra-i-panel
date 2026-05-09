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
import { UnitAdminRoutingModule } from './unit-admin-routing.module';
import { UnitAdminComponent } from './unit-admin.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { RoleComponent } from './pages/role/role.component';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { FaqComponent } from './pages/faq/faq.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';
import { UnitAdminRoleComponent } from './pages/unit-admin-role/unit-admin-role.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { UpdatePmtUnitComponent } from './pages/update-pmt-unit/update-pmt-unit.component';
import { ReportTyDutyComponent } from './pages/report-ty-duty/report-ty-duty.component';
import { ManagePaylevelTransactionComponent } from './pages/manage-paylevel-transaction/manage-paylevel-transaction.component';

const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false
};

@NgModule({ declarations: [
        SidebarComponent,
        DashboardComponent,
        ChangePasswordComponent,
        UnitAdminComponent,
        RoleComponent,
        UnitAdminRoleComponent,
        ArchiveComponent,
        UpdatePmtUnitComponent,
        ReportTyDutyComponent,
        ManagePaylevelTransactionComponent,
        SwitchModuleComponent,
        ProfileSettingComponent,
        FaqComponent,
        WebDetailComponent,
    ], imports: [RouterModule,
        CommonModule,
        UnitAdminRoutingModule,
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
export class UnitAdminModule { }
