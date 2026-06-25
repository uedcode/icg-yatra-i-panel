import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnitAdminComponent } from './unit-admin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RoleComponent } from './pages/role-management/manage-role/role.component';
import { AuthGuard } from '../auth.guard';
import { ProfileSettingComponent } from './pages/support/profile-setting/profile-setting.component';
import { FaqComponent } from './pages/support/faq/faq.component';
import { WebDetailComponent } from './pages/support/web-detail/web-detail.component';
import { UnitAdminRoleComponent } from './pages/role-management/manage-unit-admin/unit-admin-role.component';
import { ArchiveComponent } from './pages/role-management/archive/archive.component';
import { UpdatePmtUnitComponent } from './pages/duty-management/update-pmt-unit/update-pmt-unit.component';
import { ReportTyDutyComponent } from './pages/duty-management/report-ty-duty/report-ty-duty.component';
import { ManagePaylevelTransactionComponent } from './pages/duty-management/manage-paylevel-transaction/manage-paylevel-transaction.component';
import { CommonViewFileComponent } from '../components/common-view-file/common-view-file.component';

const UNIT_ADMIN_ROLES = ['UN'];

export const routes: Routes = [
  {
    path: 'view-file/:id',
    component: CommonViewFileComponent,
    canActivate: [AuthGuard],
    data: { title: 'View File', roles: UNIT_ADMIN_ROLES },
  },
  {
    path: '',
    component: UnitAdminComponent,
    children: [
      { path: '', redirectTo: 'manage-unit-admin', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { title: 'Dashboard', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'role',
        component: RoleComponent,
        canActivate: [AuthGuard],
        data: { title: 'Role', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'manage-role',
        component: RoleComponent,
        canActivate: [AuthGuard],
        data: { title: 'Manage Role', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'unit-admin',
        component: UnitAdminRoleComponent,
        canActivate: [AuthGuard],
        data: { title: 'Unit Admin', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'manage-unit-admin',
        component: UnitAdminRoleComponent,
        canActivate: [AuthGuard],
        data: { title: 'Manage Unit Admin', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'archive',
        component: ArchiveComponent,
        canActivate: [AuthGuard],
        data: { title: 'Archive', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'update-pmt-unit',
        component: UpdatePmtUnitComponent,
        canActivate: [AuthGuard],
        data: { title: 'Update PMT Unit', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'report-ty-duty',
        component: ReportTyDutyComponent,
        canActivate: [AuthGuard],
        data: { title: 'Report TY Duty', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'manage-paylevel-transaction',
        component: ManagePaylevelTransactionComponent,
        canActivate: [AuthGuard],
        data: { title: 'Manage Paylevel Transaction', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'profile-setting',
        component: ProfileSettingComponent,
        canActivate: [AuthGuard],
        data: { title: 'Switch Module', roles: UNIT_ADMIN_ROLES }
      },
      {
        path: 'faq',
        component:FaqComponent,
        canActivate: [AuthGuard],
        data: { title: 'Faq', roles: UNIT_ADMIN_ROLES }
      },
      {
        path: 'web-detail',
        component: WebDetailComponent,
        canActivate: [AuthGuard],
        data: { title: 'Web Detail', roles: UNIT_ADMIN_ROLES },
      },
      {
        path: 'instructions',
        redirectTo: 'web-detail',
        pathMatch: 'full',
      },
      {
        path: 'demand-depo-firm-status',
        redirectTo: 'archive',
        pathMatch: 'full',
      },
      {
        path: 'chairman',
        redirectTo: 'unit-admin',
        pathMatch: 'full',
      },
      {
        path: 'vice-chairman',
        redirectTo: 'unit-admin',
        pathMatch: 'full',
      },
      {
        path: 'manager',
        redirectTo: 'role',
        pathMatch: 'full',
      },
      {
        path: 'salesman',
        redirectTo: 'role',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'manage-unit-admin',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnitAdminRoutingModule { }
