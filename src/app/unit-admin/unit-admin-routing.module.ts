import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnitAdminComponent } from './unit-admin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RoleComponent } from './pages/role/role.component';
import { AuthGuard } from '../auth.guard';
import { SwitchModuleComponent } from './pages/switch-module/switch-module.component';
import { ProfileSettingComponent } from './pages/profile-setting/profile-setting.component';
import { FaqComponent } from './pages/faq/faq.component';
import { WebDetailComponent } from './pages/web-detail/web-detail.component';
import { UnitAdminRoleComponent } from './pages/unit-admin-role/unit-admin-role.component';


const routes: Routes = [
  { path: '', component: UnitAdminComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'role',
    component: RoleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Role' },
  },
  {
    path: 'unit-admin',
    component: UnitAdminRoleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Unit Admin' },
  },
  {
    path: 'switch-module',
    component: SwitchModuleComponent,
    canActivate: [AuthGuard],
    data: { title: 'Switch Module' }
  },
  {
    path: 'profile-setting',
    component: ProfileSettingComponent,
    canActivate: [AuthGuard],
    data: { title: 'Switch Module' }
  },

  {
    path: 'faq',
    component:FaqComponent,
    canActivate: [AuthGuard],
    data: { title: 'Faq' }
  },
  {
    path: 'web-detail',
    component: WebDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Web Detail' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnitAdminRoutingModule { }
