import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';

@Component({
  selector: 'app-executor-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: false,
})
export class PieChartComponent implements OnInit {
  selectedOpt = 'version';
  customFromDate: any = '';
  customToDate: any = '';
  totalAdvance = 0;
  totalClaims = 0;
  advList: any[] = [];
  claimList: any[] = [];
  user: any;

  constructor(private reportService: ReportAnalyticsService, private $auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.$auth.getUserDetails();
    this.loadSummary();
    this.getViewReport('view');
  }

  private getFilterHeaders() {
    return {
      filterType: this.selectedOpt || 'version',
      customFromDate: this.customFromDate || 0,
      customToDate: this.customToDate || 0,
    };
  }

  applyFilter(): void {
    this.loadSummary();
    this.getViewReport('view');
  }

  loadSummary(): void {
    const config = {
      headers: {
        roleTypeId: this.user?.roleTypeId,
        unitId: this.user?.unitId,
        userId: this.user?.userId,
        claimType: '',
        type: '',
        isSelected: '',
        ...this.getFilterHeaders(),
      },
    };
    this.reportService.getPieChartData(config).subscribe({
      next: (res: any) => {
        if (res?.status && Array.isArray(res.object) && res.object[0]) {
          const obj = res.object[0];
          this.totalAdvance = Number(obj?.slNo || 0);
          this.totalClaims = Number(obj?.title || 0);
        } else {
          this.totalAdvance = 0;
          this.totalClaims = 0;
        }
      },
      error: () => {
        this.totalAdvance = 0;
        this.totalClaims = 0;
      },
    });
  }

  getViewReport(mode: 'view' | 'download') {
    const config = {
      headers: {
        ...this.getFilterHeaders(),
        mode,
      },
    };
    this.reportService.viewReport(config).subscribe({
      next: (res: any) => {
        if (!res?.status) return;
        const obj = res.object || {};
        if (mode === 'download') {
          if (obj?.fileUrl) this.$auth.viewFile(obj.fileUrl);
          return;
        }
        this.advList = Array.isArray(obj?.advList) ? obj.advList : [];
        this.claimList = Array.isArray(obj?.claimList) ? obj.claimList : [];
      },
      error: () => {
        this.advList = [];
        this.claimList = [];
      },
    });
  }
}
