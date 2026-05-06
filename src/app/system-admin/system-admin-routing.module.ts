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
    data: { title: 'System Admin' },
  },
  {
    path: 'unit-admin',
    component: ManageUnitAdminComponent,
    canActivate: [AuthGuard],
    data: { title: 'Unit Admin' },
  },
  {
    path: 'manage-role',
    component: ManageRoleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Role' },
  },
  {
    path: 'mapping-unit',
    component: MappingUnitComponent,
    canActivate: [AuthGuard],
    data: { title: 'Unit Mapping' },
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
    data: { title: 'Documents' },
  },
  {
    path: 'ports',
    component: PortComponent,
    canActivate: [AuthGuard],
    data: { title: 'Port' },
  },
  {
    path: 'port-rate',
    component: PortRateComponent,
    canActivate: [AuthGuard],
    data: { title: 'Port Rate' },
  },
  {
    path: 'ships',
    component: ShipComponent,
    canActivate: [AuthGuard],
    data: { title: 'Ship' },
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
    data: { title: 'Faq' },
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
    data: { title: 'profile setting' },
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
    data: { title: 'Inbox' },
  },
  {
    path: 'exported',
    component: ExportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Exported' },
  },
  {
    path: 'archived',
    component: ArchivedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archived' },
  },
  {
    path: 'import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Import' },
  },
  {
    path: 'imported',
    component: ImportedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Imported' },
  },
  {
    path: 'archived-import',
    component: ArchivedImportComponent,
    canActivate: [AuthGuard],
    data: { title: 'Archived Import' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
