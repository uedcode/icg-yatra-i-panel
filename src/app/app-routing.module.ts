import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CommonProfileSettingComponent } from './components/common-profile-setting/common-profile-setting/common-profile-setting.component';
import { CommonViewFileComponent } from './components/common-view-file/common-view-file.component';
import { AuthGuard } from './auth.guard';
import { SsoLoginComponent } from './pages/sso-login/sso-login.component';
import { PublicFaqComponent } from './pages/public-faq/public-faq.component';
import { PublicVersionHistoryComponent } from './pages/public-version-history/public-version-history.component';
import { PublicPreviewUpdatePnoComponent } from './pages/public-preview-update-pno/public-preview-update-pno.component';
import { PublicSupportComponent } from './pages/public-support/public-support.component';
import { PublicParamvtComponent } from './pages/public-paramvt/public-paramvt.component';
import { PublicTestRedirectComponent } from './pages/public-test-redirect/public-test-redirect.component';

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
    path: 'view-file/:id',
    component: CommonViewFileComponent,
    canActivate: [AuthGuard],
    data: { title: 'View File' },
  },
  {
    path: 'view-file',
    component: CommonViewFileComponent,
    canActivate: [AuthGuard],
    data: { title: 'View File' },
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
  {
    path: 'faq',
    component: PublicFaqComponent,
    data: { title: 'FAQ' },
  },
  {
    path: 'version-history',
    component: PublicVersionHistoryComponent,
    data: { title: 'Version History' },
  },
  {
    path: 'preview-update-pno',
    component: PublicPreviewUpdatePnoComponent,
    data: { title: 'PNO Update' },
  },
  {
    path: 'support',
    component: PublicSupportComponent,
    data: { title: 'Support' },
  },
  {
    path: 'paramvt',
    component: PublicParamvtComponent,
    data: { title: 'Video Tutorial' },
  },
  {
    path: 'test-redirect',
    component: PublicTestRedirectComponent,
    data: { title: 'Test Redirect' },
  },
  { path: 'system-admin', loadChildren: () => import('./system-admin/system-admin.module').then(m => m.SystemAdminModule) },
  { path: 'unit-admin', loadChildren: () => import('./unit-admin/unit-admin.module').then(m => m.UnitAdminModule) },
  { path: 'creator', loadChildren: () => import('./creator/creator.module').then(m => m.CreatorModule) },
  { path: 'approver', loadChildren: () => import('./approver/approver.module').then(m => m.ApproverModule) },
  { path: 'executor', loadChildren: () => import('./executor/executor.module').then(m => m.ExecutorModule) },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule { }

