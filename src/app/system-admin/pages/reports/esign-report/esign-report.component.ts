import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';

@Component({
  selector: 'app-esign-report',
  templateUrl: './esign-report.component.html',
  styleUrls: ['./esign-report.component.scss'],
  standalone: false,
})
export class EsignReportComponent implements OnInit {
  list: any[] = [];
  units: any[] = [];
  selectedGxUnitId = '';
  searchObj: any;
  noOfPage: any = 10;
  p = 1;
  key = 'sl';
  reverse = false;

  constructor(
    private $common: CommonService,
    private $report: ReportAnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
    this.getReportData();
  }

  loadUnits() {
    const config = { headers: {} };
    this.$report.getCodeUnits(config).subscribe(
      (response: any) => {
        if (response?.status) {
          this.units = Array.isArray(response.object) ? response.object : [];
        }
      },
      (err) => console.log(err)
    );
  }

  getReportData() {
    try {
      this.$common.showLoader();
      const config = {
        headers: {
          gxUnitId: this.selectedGxUnitId || '',
        },
      };
      this.$report.getEsignReportData(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status) {
            this.list = Array.isArray(response.object) ? response.object : [];
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

  sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}

