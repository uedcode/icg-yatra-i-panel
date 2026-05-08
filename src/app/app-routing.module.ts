import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SwitchModuleExternalComponent } from './pages/switch-module-external/switch-module-external.component';
import { CommonProfileSettingComponent } from './components/common-profile-setting/common-profile-setting/common-profile-setting.component';
import { CommonViewFileComponent } from './components/common-view-file/common-view-file.component';
import { AuthGuard } from './auth.guard';
import { SsoLoginComponent } from './pages/sso-login/sso-login.component';

const routes: Routes = [
  {
    
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
    data: { title: 'Login' },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' },
  },
  {
    path: 'view-file',
    component: CommonViewFileComponent,
    canActivate: [AuthGuard],
    data: { title: 'View File' },
  },
  {
    path: 'switch-module',
    component: SwitchModuleExternalComponent,
    canActivate: [AuthGuard],
    data: { title: 'Switch Module' },
  },
  {
    path: 'common-profile-setting',
    component: CommonProfileSettingComponent,
    canActivate: [AuthGuard],
    data: { title: 'Common Profile Setting ' },
  },
  {
    path: 'sso-login',
    component: SsoLoginComponent,
    data: { title: 'SSO Login' },
  },
  { path: 'system-admin', loadChildren: () => import('./system-admin/system-admin.module').then(m => m.SystemAdminModule) },
  { path: 'unit-admin', loadChildren: () => import('./unit-admin/unit-admin.module').then(m => m.UnitAdminModule) },
  { path: 'creator', loadChildren: () => import('./creator/creator.module').then(m => m.CreatorModule) },
  { path: 'approver', loadChildren: () => import('./approver/approver.module').then(m => m.ApproverModule) },
  { path: 'executor', loadChildren: () => import('./executor/executor.module').then(m => m.ExecutorModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule { }
