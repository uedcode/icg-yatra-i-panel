import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodeMiscApiService } from 'src/app/service/api/code/code-misc-api.service';
import { CommonService } from 'src/app/service/core/common.service';

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
    private $codeMiscApi: CodeMiscApiService
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

      this.$codeMiscApi.viewReport(config).subscribe(
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
