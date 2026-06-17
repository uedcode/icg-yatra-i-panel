import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/service/core/common.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';

@Component({
  selector: 'app-preview-report',
  templateUrl: './preview-report.component.html',
  styleUrls: ['./preview-report.component.scss'],
  standalone: false,
})
export class PreviewReportComponent implements OnInit {
  reportObject: any = {};

  constructor(
    private route: ActivatedRoute,
    private $common: CommonService,
    private $report: ReportAnalyticsService
  ) {}

  ngOnInit(): void {
    this.viewReport();
  }

  viewReport(): void {
    try {
      this.$common.showLoader();
      const params = this.route.snapshot.queryParamMap;
      const config = {
        headers: {
          filterType: params.get('x') || 'version',
          customFromDate: params.get('y') || 0,
          customToDate: params.get('z') || 0,
          mode: 'view'
        }
      };

      this.$report.viewReport(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) {
            this.reportObject = response.object || {};
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
}
