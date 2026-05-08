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
import { FormPilotageDetailComponent } from './pages/form-detail/form-pilotage-detail/form-pilotage-detail.component';
import { NotPassedComponent } from './pages/form-request/not-passed/not-passed.component';
import { PassedComponent } from './pages/form-request/passed/passed.component';
import { PilotageHistoryStatusComponent } from './pages/form-detail/pilotage-history-status/pilotage-history-status.component';
import { PilotageChildModalComponent } from './pages/form-detail/pilotage-child-modal/pilotage-child-modal.component';
import { ChangeApproverStatusComponent } from './pages/form-detail/change-approver-status/change-approver-status.component';
import { FormClaimDetailComponent } from './pages/form-detail/form-claim-detail/form-claim-detail.component';

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
        FormPilotageDetailComponent,
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
        PilotageHistoryStatusComponent,
        PilotageChildModalComponent,
        ChangeApproverStatusComponent,
        FormClaimDetailComponent,
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
