import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: false,
})
export class StatisticsComponent implements OnInit {
  selectedOpt = 'version';
  customFromDate: any = '';
  customToDate: any = '';

  totalAdvance = 0;
  totalClaims = 0;
  reportObject: any = null;
  advList: any[] = [];
  claimList: any[] = [];

  constructor(
    private $common: CommonService,
    private $report: ReportAnalyticsService,
    private $auth: AuthService
  ) {}

  ngOnInit(): void {
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

  applyFilter() {
    this.loadSummary();
    this.getViewReport('view');
  }

  loadSummary() {
    try {
      this.$common.showLoader();
      const config = {
        headers: {
          claimType: '',
          type: '',
          isSelected: '',
          ...this.getFilterHeaders(),
        },
      };
      this.$report.getPieChartData(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status && Array.isArray(response.object) && response.object[0]) {
            const o = response.object[0];
            this.totalAdvance = Number(o?.slNo || 0);
            this.totalClaims = Number(o?.title || 0);
          } else {
            this.totalAdvance = 0;
            this.totalClaims = 0;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getViewReport(mode: 'view' | 'download') {
    try {
      this.$common.showLoader();
      const config = {
        headers: {
          ...this.getFilterHeaders(),
          mode,
        },
      };
      this.$report.viewReport(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (!response?.status) return;
          const obj = response.object || {};
          if (mode === 'download') {
            if (obj?.fileUrl) this.$auth.viewFile(obj.fileUrl);
            return;
          }
          this.reportObject = obj;
          this.advList = Array.isArray(obj?.advList) ? obj.advList : [];
          this.claimList = Array.isArray(obj?.claimList) ? obj.claimList : [];
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
}


