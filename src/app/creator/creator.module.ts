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
import { FileExcelService } from 'src/app/service/fileexcel.service';

import { CreatorRoutingModule } from './creator-routing.module';
import { CreatorComponent } from './creator.component';

import { SidebarComponent } from './common/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';

import { OutboxComponent } from './pages/form-request/outbox/outbox.component';
import { DraftComponent } from './pages/form-request/draft/draft.component';
import { ApprovedComponent } from './pages/form-request/approved/approved.component';
import { NewComponent } from './pages/new/new.component';
import { InboxComponent } from './pages/form-request/inbox/inbox.component';
import { ReturnedComponent } from './pages/form-request/returned/returned.component';
import { CreatorProfileComponent } from './pages/creator-profile/creator-profile.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { EsignComponent } from './pages/manage-esign/esign/esign.component';
import { RedirectComponent } from './pages/manage-esign/redirect/redirect.component';
import { ViewFileComponent } from './pages/view-file/view-file.component';
import { FaqComponent } from './pages/faq/faq.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';

import { FormPilotageComponent } from './pages/form/form-pilotage/form-pilotage.component';
import { FormPilotageDetailComponent } from './pages/form-detail/form-pilotage-detail/form-pilotage-detail.component';
import { PreviewDetailsComponent } from './pages/form/preview-details/preview-details.component';
import { PassedComponent } from './pages/form-request/passed/passed.component';
import { NotPassedComponent } from './pages/form-request/not-passed/not-passed.component';
import { PilotageHistoryComponent } from './pages/form/pilotage-history-pages/pilotage-history/pilotage-history.component';
import { PilotageHistoryStatusComponent } from './pages/form/pilotage-history-pages/pilotage-history-status/pilotage-history-status.component';
import { PilotageChildModalComponent } from './pages/form/pilotage-history-pages/pilotage-child-modal/pilotage-child-modal.component';
import { PortRateModalComponent } from './pages/form/port-rate-modal/port-rate-modal.component';
import { FormTydutyComponent } from './pages/form/form-tyduty/form-tyduty.component';
import { FormFteComponent } from './pages/form/form-fte/form-fte.component';
import { FormFteDetailComponent } from './pages/form-detail/form-fte-detail/form-fte-detail.component';
import { FormPmtDutyComponent } from './pages/form/form-pmt/form-pmt.component';
import { FormPmtDetailComponent } from './pages/form-detail/form-pmt-detail/form-pmt-detail.component';
import { FormLtcAdvanceComponent } from './pages/form/form-ltc/form-ltc.component';
import { FormLtcDetailComponent } from './pages/form-detail/form-ltc-detail/form-ltc-detail.component';

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
    SwitchModuleComponent,
    // new component add here
    FormPilotageComponent,
    InboxComponent,
    OutboxComponent,
    DraftComponent,
    ApprovedComponent,
    ReturnedComponent,
    FormPilotageDetailComponent,
    NewComponent,
    CreatorProfileComponent,
    ProfileSettingComponent,
    EsignComponent,
    RedirectComponent,
    ViewFileComponent,
    FaqComponent,
    WebDetailComponent,
    PreviewDetailsComponent,
    PassedComponent,
    NotPassedComponent,
    PilotageHistoryComponent,
    PilotageHistoryStatusComponent,
    PilotageChildModalComponent,
    PortRateModalComponent,

    FormTydutyComponent,
    FormFteComponent,
    FormFteDetailComponent,
    FormPmtDutyComponent,
    FormPmtDetailComponent,
    FormLtcAdvanceComponent,
    FormLtcDetailComponent,
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
