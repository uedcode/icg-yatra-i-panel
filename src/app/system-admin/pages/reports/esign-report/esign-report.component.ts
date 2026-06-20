import { Component, OnInit } from '@angular/core';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { CodeUnitApiService } from 'src/app/service/api/code-unit/code-unit-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-esign-report',
  templateUrl: './esign-report.component.html',
  styleUrls: ['./esign-report.component.scss'],
  standalone: false,
})
export class EsignReportComponent implements OnInit {
  list: any[] = [];
  units: any[] = [];
  selectedGxUnitId = '000226';
  searchObj: any;
  noOfPage: any = 10;
  p = 1;
  key = 'sl';
  reverse = false;

  constructor(
    private $common: CommonService,
    private $claimStateApi: ClaimStateApiService,
    private $codeUnitApi: CodeUnitApiService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
    this.getReportData('000226');
  }

  loadUnits(): void {
    this.$codeUnitApi.getGxUnits({ headers: {} }).subscribe(
      (response: any) => {
        if (response?.status) {
          this.units = this.normalizeUnits(response.object || []);
          const defaultUnit = this.units.find((unit) => unit.unit === this.selectedGxUnitId);
          if (!defaultUnit && this.units.length) {
            this.selectedGxUnitId = this.units[0].unit;
          }
        }
      },
      (err) => console.log(err)
    );
  }

  getReportData(unitId = this.selectedGxUnitId): void {
    try {
      this.$common.showLoader();
      this.selectedGxUnitId = unitId || '';
      const config = {
        headers: {
          gxUnitId: this.selectedGxUnitId || '',
        },
      };
      this.$claimStateApi.getEsignReportData(config).subscribe(
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

  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }

  private normalizeUnits(units: any[]): any[] {
    return units.map((unit) => ({
      ...unit,
      unit: unit?.unit || unit?.gxUnitId || unit?.unitId || '',
      descr: unit?.descr || unit?.unitName || unit?.gxUnitName || '-'
    }));
  }
}
