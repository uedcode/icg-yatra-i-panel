import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { LegendPosition } from '@swimlane/ngx-charts';
import { CodeMiscApiService } from 'src/app/service/api/code-misc/code-misc-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';

type ChartKind = 'total' | 'advance' | 'claim';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: false,
})
export class StatisticsComponent implements OnInit {
  readonly advModuleId = 'ADV';
  readonly clmModuleId = 'CLM';

  selectedOpt = 'version';
  customFromDate: any = '';
  customToDate: any = '';

  totalChartData: any[] = [];
  advanceChartData: any[] = [];
  claimChartData: any[] = [];
  advList: any[] = [];
  claimList: any[] = [];
  advHead = '';
  clmHead = '';

  readonly totalChartView: [number, number] = [980, 285];
  readonly halfChartView: [number, number] = [590, 285];
  readonly legendPosition = LegendPosition.Right;
  readonly totalChartMargins: [number, number, number, number] = [5, 120, 5, 120];
  readonly halfChartMargins: [number, number, number, number] = [5, 80, 5, 80];
  readonly trimLabels = false;
  readonly maxLabelLength = 40;
  readonly explodeSlices = false;
  readonly totalColorScheme = { domain: ['RoyalBlue', 'Maroon'] };
  readonly advanceColorScheme = { domain: ['RoyalBlue', 'Indigo', 'green'] };
  readonly claimColorScheme = { domain: ['purple', 'maroon', 'gray'] };

  constructor(
    private $common: CommonService,
    private $codeMiscApi: CodeMiscApiService,
    private $auth: AuthService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loadAllCharts();
  }

  applyFilter(): void {
    if (!this.validateFilter()) {
      return;
    }
    this.loadAllCharts();
  }

  loadAllCharts(): void {
    this.advList = [];
    this.claimList = [];
    this.loadChartData('total');
    this.loadChartData('advance');
    this.loadChartData('claim');
  }

  loadChartData(kind: ChartKind): void {
    const config = {
      headers: {
        claimType: kind === 'advance' ? this.advModuleId : kind === 'claim' ? this.clmModuleId : '',
        type: kind === 'total' ? '' : '0',
        isSelected: '',
        ...this.getFilterHeaders()
      }
    };

    this.fetchPieChartData(config, (objects) => {
      const object = objects?.[0] || {};
      if (kind === 'total') {
        this.totalChartData = [
          { name: `Advance: ${this.toNumber(object.slNo)}`, value: this.toNumber(object.slNo) },
          { name: `Claims: ${this.toNumber(object.title)}`, value: this.toNumber(object.title) }
        ];
        return;
      }

      const target = [
        { name: `Submitted: ${this.toNumber(object.submitted)}`, value: this.toNumber(object.submitted) },
        { name: `Approved: ${this.toNumber(object.approved)}`, value: this.toNumber(object.approved) },
        { name: `Paid: ${this.toNumber(object.approvedCda)}`, value: this.toNumber(object.approvedCda) }
      ];
      if (kind === 'advance') {
        this.advanceChartData = target;
      } else {
        this.claimChartData = target;
      }
    });
  }

  onTotalSelect(event: any): void {
    const selectedName = this.getSelectedName(event);
    if (selectedName.includes('Claim')) {
      this.loadChartData('claim');
    } else {
      this.loadChartData('advance');
    }
  }

  onAdvanceSelect(event: any): void {
    const selectedName = this.getSelectedName(event);
    this.advHead = selectedName.split(':')[0];
    this.loadDrilldown(this.advModuleId, selectedName, (objects) => this.advList = objects);
  }

  onClaimSelect(event: any): void {
    const selectedName = this.getSelectedName(event);
    this.clmHead = selectedName.split(':')[0];
    this.loadDrilldown(this.clmModuleId, selectedName, (objects) => this.claimList = objects);
  }

  loadDrilldown(claimType: string, selectedLabel: string, assign: (objects: any[]) => void): void {
    const config = {
      headers: {
        claimType,
        type: '1',
        isSelected: selectedLabel,
        ...this.getFilterHeaders()
      }
    };
    this.fetchPieChartData(config, assign);
  }

  openPreviewReport(): void {
    if (!this.validateFilter()) {
      return;
    }
    const moduleUrl = this.getActiveModuleUrl();
    const queryParams = new URLSearchParams({
      x: this.selectedOpt || 'version',
      y: `${this.customFromDate || 0}`,
      z: `${this.customToDate || 0}`
    });
    const url = `${moduleUrl}/preview-report?${queryParams.toString()}`;
    window.open(url, '_blank');
  }

  private getActiveModuleUrl(): string {
    const roleModuleUrl = this.$auth.getModuleName() || '/system-admin';
    const pathname = this.document?.location?.pathname || '';
    const roleModuleIndex = pathname.indexOf(roleModuleUrl);

    if (roleModuleIndex > 0) {
      return `${pathname.substring(0, roleModuleIndex)}${roleModuleUrl}`;
    }

    return roleModuleUrl;
  }

  getFilterHeaders(): any {
    return {
      filterType: this.selectedOpt || 'version',
      customFromDate: this.customFromDate || 0,
      customToDate: this.customToDate || 0
    };
  }

  validateFilter(): boolean {
    if (this.selectedOpt !== 'custom') {
      return true;
    }
    if (!this.customFromDate) {
      this.$common.showMessage('Please select from date', 'danger');
      return false;
    }
    if (!this.customToDate) {
      this.$common.showMessage('Please select to date', 'danger');
      return false;
    }
    return true;
  }

  private fetchPieChartData(config: any, assign: (objects: any[]) => void): void {
    try {
      this.$common.showLoader();
      this.$codeMiscApi.getPieChartData(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) {
            assign(Array.isArray(response.object) ? response.object : []);
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

  private getSelectedName(event: any): string {
    return event?.name || event?.label || '';
  }

  private toNumber(value: any): number {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
