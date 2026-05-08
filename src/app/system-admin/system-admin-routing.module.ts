import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { AuthGuard } from '../auth.guard';

import { SystemAdminComponent } from './system-admin.component';
import { ManageSystemAdminComponent } from './pages/manage-user/manage-system-admin/manage-system-admin.component';
import { ManageUnitAdminComponent } from './pages/manage-user/manage-unit-admin/manage-unit-admin.component';
import { MappingUnitComponent } from './pages/manage-user/mapping-of-unit/mapping-unit/mapping-unit.component';
import { AddMappingUnitComponent } from './pages/manage-user/mapping-of-unit/add-mapping-unit/add-mapping-unit.component';
import { AddDocumentsModalComponent } from './pages/manage-masters/manage-document/add-documents-modal/add-documents-modal.component';
import { DocumentsComponent } from './pages/manage-masters/manage-document/documents/documents.component';
import { AddFaqModalComponent } from './pages/manage-masters/manage-faq/add-faq-modal/add-faq-modal.component';
import { VersionHistoryComponent } from './pages/manage-masters/manage-version-history/version-history/version-history.component';
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
import { ManageRoleComponent } from './pages/manage-role/manage-role.component';
import { ReasonComponent } from './pages/manage-masters/manage-reason/reason/reason.component';
import { BusinessRuleComponent } from './pages/manage-masters/manage-business-rule/business-rule/business-rule.component';
import { MessageComponent } from './pages/manage-masters/manage-message/message/message.component';
import { PayLevelComponent } from './pages/manage-masters/manage-pay-level/pay-level/pay-level.component';
import { TyDutyPurposeComponent } from './pages/manage-masters/manage-ty-duty-purpose/ty-duty-purpose/ty-duty-purpose.component';
import { EsignReportComponent } from './pages/reports/esign-report/esign-report.component';
import { StatisticsComponent } from './pages/reports/statistics/statistics.component';

const routes: Routes = [
  {
    path: '',
    component: SystemAdminComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'dashboard-back',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Password' },
  },

  {
    path: 'system-admin',
    component: ManageSystemAdminComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage System Admins' },
  },
  {
    path: 'unit-admin',
    component: ManageUnitAdminComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Unit Admins' },
  },
  {
    path: 'manage-role',
    component: ManageRoleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Roles' },
  },
  {
    path: 'mapping-unit',
    component: MappingUnitComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Unit Mappings' },
  },
  {
    path: 'add-mapping-unit',
    component: AddMappingUnitComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Unit Mapping' },
  },

  // manage master
  {
    path: 'documents',
    component: DocumentsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Documents' },
  },
  {
    path: 'ports',
    component: PortComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Ports' },
  },
  {
    path: 'port-rate',
    component: PortRateComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Port Rates' },
  },
  {
    path: 'ships',
    component: ShipComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Ships' },
  },
  {
    path: 'version-history',
    component: VersionHistoryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Version History' },
  },
  {
    path: 'add-documents-modal',
    component: AddDocumentsModalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Documents Modal' },
  },
  {
    path: 'add-port-modal',
    component: AddPortModalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Port Modal' },
  },
  {
    path: 'add-ship-modal',
    component: AddShipModalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Ship Modal' },
  },
  {
    path: 'faq',
    component: FaqComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage FAQs' },
  },
  {
    path: 'reason',
    component: ReasonComponent,
    canActivate: [AuthGuard],
    data: { title: 'Reason' },
  },
  {
    path: 'business-rule',
    component: BusinessRuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Business Rule' },
  },
  {
    path: 'message',
    component: MessageComponent,
    canActivate: [AuthGuard],
    data: { title: 'Message Master' },
  },
  {
    path: 'pay-level',
    component: PayLevelComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Level' },
  },
  {
    path: 'ty-duty-purpose',
    component: TyDutyPurposeComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Purpose' },
  },

  {
    path: 'switch-module',
    component: SwitchModuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Switch Module' },
  },
  {
    path: 'profile-setting',
    component: ProfileSettingComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profile Setting' },
  },

  {
    path: 'manage-approver',
    component: ManageApproverComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Approver' },
  },
  {
    path: 'mapping-approver-form',
    component: MappingApproverFormComponent,
    canActivate: [AuthGuard],
    data: { title: 'Mapping Approver Form' },
  },
  {
    path: 'web-detail',
    component: WebDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Web Detail' },
  },
  {
    path: 'inbox',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Audit Export Queue' },
  },
  {
    path: 'export',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Audit Export Queue' },
  },
  {
    path: 'exported',
    component: ExportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Exported Batches' },
  },
  {
    path: 'backup-Export',
    component: ExportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Backup Export' },
  },
  {
    path: 'archived',
    component: ArchivedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archived Exports' },
  },
  {
    path: 'import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Audit Import Queue' },
  },
  {
    path: 'backup-Import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Backup Import' },
  },
  {
    path: 'excel-import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Excel Import' },
  },
  {
    path: 'diary-import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Diary Import' },
  },
  {
    path: 'imported',
    component: ImportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Imported Batches' },
  },
  {
    path: 'diary-imported',
    component: ImportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Diary Imported' },
  },
  {
    path: 'archived-import',
    component: ArchivedImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archived Imports' },
  },
  {
    path: 'diary-imported-backup',
    component: ArchivedImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Diary Imported Backup' },
  },
  {
    path: 'esign-report',
    component: EsignReportComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Report' },
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Statistics' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
