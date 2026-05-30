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

import { ApproverRoutingModule } from './approver-routing.module';
import { ApproverComponent } from './approver.component';

import { SidebarComponent } from './common/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { InboxComponent } from './pages/form-request/inbox/inbox.component';
import { OutboxComponent } from './pages/form-request/outbox/outbox.component';
import { ApprovedComponent } from './pages/form-request/approved/approved.component';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';
import { ReturnedComponent } from './pages/form-request/returned/returned.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/manage-esign/esign/esign.component';
import { RedirectComponent } from './pages/manage-esign/redirect/redirect.component';
import { FaqComponent } from './pages/faq/faq.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';
import { NotPassedComponent } from './pages/form-request/not-passed/not-passed.component';
import { PassedComponent } from './pages/form-request/passed/passed.component';
import { FormClaimDetailComponent } from './pages/form-detail/form-claim-detail/form-claim-detail.component';
import { PayInboxComponent } from './pages/pay-request/pay-inbox/pay-inbox.component';
import { PayOutboxComponent } from './pages/pay-request/pay-outbox/pay-outbox.component';
import { PayApprovedComponent } from './pages/pay-request/pay-approved/pay-approved.component';
import { PayNotApprovedComponent } from './pages/pay-request/pay-not-approved/pay-not-approved.component';
import { FormPayDetailComponent } from './pages/form-detail/form-pay-detail/form-pay-detail.component';
import { ManualDraftComponent } from './pages/form-request/manual-draft/manual-draft.component';
import { BudgetAllocationComponent } from './pages/settings/budget-allocation/budget-allocation.component';
import { ArchiveComponent } from './pages/form-request/archive/archive.component';
import { FormAdvanceDetailComponent } from './pages/form-detail/form-advance-detail/form-advance-detail.component';
import { SettingsLauncherComponent } from './pages/settings/settings-launcher/settings-launcher.component';

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
        SwitchModuleComponent,
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

