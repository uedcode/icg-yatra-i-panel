import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';

@Component({
  selector: 'app-executor-esign-report',
  templateUrl: './esign-report.component.html',
  styleUrls: ['./esign-report.component.css'],
  standalone: false,
})
export class EsignReportComponent implements OnInit {
  rows: any[] = [];
  user: any;

  constructor(private reportService: ReportAnalyticsService, private $auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.$auth.getUserDetails();
    this.load();
  }

  load(): void {
    const config = {
      headers: {
        roleTypeId: this.user?.roleTypeId,
        unitId: this.user?.unitId,
        userId: this.user?.userId,
      },
    };
    this.reportService.getEsignReportData(config).subscribe({
      next: (res: any) => {
        this.rows = Array.isArray(res?.object) ? res.object : [];
      },
      error: () => {
        this.rows = [];
      },
    });
  }
}
