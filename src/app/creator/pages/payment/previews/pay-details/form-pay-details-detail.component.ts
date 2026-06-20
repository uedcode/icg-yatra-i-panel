import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { YatPayDetailsApiService } from 'src/app/service/api/payment/yat-pay-details-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

@Component({
  selector: 'app-form-pay-details-detail',
  templateUrl: './form-pay-details-detail.component.html',
  styleUrls: ['./form-pay-details-detail.component.scss'],
  standalone: false,
})
export class FormPayDetailsDetailComponent implements OnInit {
  payDetails: any = {};

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private $auth: AuthService,
    private $payDetailsApi: YatPayDetailsApiService,
    private $common: CommonService,
    private datePipe: DatePipe,
    private previewWindow: PreviewWindowService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id') || '';
      if (!id) return;
      const config = { headers: { id } };
      this.$common.showLoader();
      this.$payDetailsApi.getAll(config).subscribe(
        (res: any) => {
          this.$common.hideLoader();
          if (res?.status && Array.isArray(res.object) && res.object.length) {
            this.payDetails = res.object[0];
          }
        },
        () => this.$common.hideLoader()
      );
    });
  }

  viewDocument(): void {
    const docUrl = this.payDetails?.docUrl;
    if (!docUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return;
    }
    this.$auth.viewFile(docUrl);
  }

  asDate(value: any): string {
    if (!value) return '-';
    const date = typeof value === 'number' || /^\d+$/.test(`${value}`)
      ? new Date(Number(value))
      : new Date(value);
    return Number.isNaN(date.getTime()) ? `${value}` : (this.datePipe.transform(date, 'dd/MM/yyyy') || '-');
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }
}



