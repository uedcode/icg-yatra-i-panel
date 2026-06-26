import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentModule } from '../app-component.module';
import { DirectiveModule } from '../app-directive.module';
import { PipeModule } from '../app-pipe.module';
import { AuthGuard } from '../auth.guard';
import { HeaderInterceptor } from '../HeaderInterceptor';
import { ExecutorRoutingModule } from './executor-routing.module';
import { ExecutorComponent } from './executor.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SearchByPnoComponent } from './pages/search-by-pno/search-by-pno.component';
import { EsignReportComponent } from './pages/esign-report/esign-report.component';
import { PieChartComponent } from './pages/pie-chart/pie-chart.component';
import { ClaimPreviewComponent } from './pages/claim-preview/claim-preview.component';

@NgModule({
  declarations: [
    ExecutorComponent,
    SidebarComponent,
    DashboardComponent,
    SearchByPnoComponent,
    EsignReportComponent,
    PieChartComponent,
    ClaimPreviewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ExecutorRoutingModule,
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
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
  ],
})
export class ExecutorModule {}
