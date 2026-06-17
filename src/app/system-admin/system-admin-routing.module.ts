import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './pages/support/change-password/change-password.component';
import { AuthGuard } from '../auth.guard';

import { SystemAdminComponent } from './system-admin.component';
import { ManageSystemAdminComponent } from './pages/manage-user/manage-system-admin/manage-system-admin.component';
import { ManageUnitAdminComponent } from './pages/manage-user/manage-unit-admin/manage-unit-admin.component';
import { AddDocumentsModalComponent } from './pages/manage-masters/manage-document/add-documents-modal/add-documents-modal.component';
import { DocumentsComponent } from './pages/manage-masters/manage-document/documents/documents.component';
import { AddFaqModalComponent } from './pages/manage-masters/manage-faq/add-faq-modal/add-faq-modal.component';
import { VersionHistoryComponent } from './pages/manage-masters/manage-version-history/version-history/version-history.component';
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
import { ManageRoleComponent } from './pages/manage-role/manage-role.component';
import { ReasonComponent } from './pages/manage-masters/manage-reason/reason/reason.component';
import { BusinessRuleComponent } from './pages/manage-masters/manage-business-rule/business-rule/business-rule.component';
import { MessageComponent } from './pages/manage-masters/manage-message/message/message.component';
import { PayLevelComponent } from './pages/manage-masters/manage-pay-level/pay-level/pay-level.component';
import { TyDutyPurposeComponent } from './pages/manage-masters/manage-ty-duty-purpose/ty-duty-purpose/ty-duty-purpose.component';
import { EsignReportComponent } from './pages/reports/esign-report/esign-report.component';
import { StatisticsComponent } from './pages/reports/statistics/statistics.component';
import { PreviewReportComponent } from './pages/reports/preview-report/preview-report.component';
import { SettingsLauncherComponent } from './pages/settings/launcher/settings-launcher.component';

const SYSTEM_ADMIN_ROLES = ['SY'];

const routes: Routes = [
  {
    path: '',
    component: SystemAdminComponent,
    children: [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'dashboard-back',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Password', roles: SYSTEM_ADMIN_ROLES },
  },

  {
    path: 'settings',
    component: SettingsLauncherComponent,
    canActivate: [AuthGuard],
    data: { title: 'Settings', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'system-admin',
    component: ManageSystemAdminComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage System Admins', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'unit-admin',
    component: ManageUnitAdminComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Unit Admins', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-role',
    component: ManageRoleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Roles', roles: SYSTEM_ADMIN_ROLES },
  },
  // manage master
  {
    path: 'documents',
    component: DocumentsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Documents', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-doc',
    component: DocumentsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Document update', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'ports',
    component: PortComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Ports', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'port-rate',
    component: PortRateComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Port Rates', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-port-rate',
    component: PortRateComponent,
    canActivate: [AuthGuard],
    data: { title: 'Port Rate update', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'ships',
    component: ShipComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Ships', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'version-history',
    component: VersionHistoryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Version History', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-version',
    component: VersionHistoryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Version history update', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'add-documents-modal',
    component: AddDocumentsModalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Documents Modal', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'add-port-modal',
    component: AddPortModalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Port Modal', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'add-ship-modal',
    component: AddShipModalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Ship Modal', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'faq',
    component: SupportFaqComponent,
    canActivate: [AuthGuard],
    data: { title: 'FAQ', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-faq',
    component: ManageFaqComponent,
    canActivate: [AuthGuard],
    data: { title: 'FAQ update', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'reason',
    component: ReasonComponent,
    canActivate: [AuthGuard],
    data: { title: 'Reason', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-reason',
    component: ReasonComponent,
    canActivate: [AuthGuard],
    data: { title: 'Reason', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'business-rule',
    component: BusinessRuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Business Rule', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-business-rule',
    component: BusinessRuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Business Rule', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'message',
    component: MessageComponent,
    canActivate: [AuthGuard],
    data: { title: 'Message Master', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-message',
    component: MessageComponent,
    canActivate: [AuthGuard],
    data: { title: 'Initial Message', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'pay-level',
    component: PayLevelComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay Level', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-pay-level',
    component: PayLevelComponent,
    canActivate: [AuthGuard],
    data: { title: 'Pay level entitlements', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'ty-duty-purpose',
    component: TyDutyPurposeComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Purpose', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'manage-ty-duty-purpose',
    component: TyDutyPurposeComponent,
    canActivate: [AuthGuard],
    data: { title: 'TY Duty Purpose', roles: SYSTEM_ADMIN_ROLES },
  },

  {
    path: 'profile-setting',
    component: ProfileSettingComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profile Setting', roles: SYSTEM_ADMIN_ROLES },
  },

  {
    path: 'web-detail',
    component: WebDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Web Detail', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'inbox',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Audit Export Queue', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'export',
    component: InboxComponent,
    canActivate: [AuthGuard],
    data: { title: 'Audit Export Queue', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'exported',
    component: ExportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Exported Batches', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'backup-Export',
    component: BackupExportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Backup Export', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'archived',
    component: ArchivedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archived Exports', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Audit Import Queue', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'hrcdf-import',
    redirectTo: 'import',
    pathMatch: 'full',
  },
  {
    path: 'backup-Import',
    component: BackupImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Backup Import', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'excel-import',
    component: SysAdminExcelImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Excel Import', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'diary-import',
    component: DiaryImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Diary Import', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'imported',
    component: ImportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Imported Batches', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'diary-imported',
    component: DiaryImportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Diary Imported', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'archived-import',
    component: ArchivedImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archived Imports', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'diary-imported-backup',
    component: DiaryImportedBackupComponent,
    canActivate: [AuthGuard],
    data: { title: 'Diary Imported Backup', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'esign-report',
    component: EsignReportComponent,
    canActivate: [AuthGuard],
    data: { title: 'eSign Report', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Statistics', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: 'preview-report',
    component: PreviewReportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Report Preview', roles: SYSTEM_ADMIN_ROLES },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
