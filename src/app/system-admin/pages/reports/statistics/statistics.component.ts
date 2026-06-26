import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { CodeMiscApiService } from 'src/app/service/api/code/code-misc-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';

type ChartKind = 'total' | 'advance' | 'claim';
type PieData = ChartData<'pie', number[], string>;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatisticsComponent implements OnInit {
  readonly advModuleId = 'ADV';
  readonly clmModuleId = 'CLM';

  selectedOpt = 'version';
  customFromDate: any = '';
  customToDate: any = '';

  private readonly totalChartColors = ['RoyalBlue', 'Maroon'];
  private readonly advanceChartColors = ['RoyalBlue', 'Indigo', 'green'];
  private readonly claimChartColors = ['purple', 'maroon', 'gray'];

  totalChartData: PieData = this.createPieData([], this.totalChartColors);
  advanceChartData: PieData = this.createPieData([], this.advanceChartColors);
  claimChartData: PieData = this.createPieData([], this.claimChartColors);
  advList: any[] = [];
  claimList: any[] = [];
  advHead = '';
  clmHead = '';

  readonly pieChartType = 'pie' as const;
  readonly pieChartOptions: ChartOptions<'pie'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: 13,
          color: '#1f2937',
          font: {
            size: 12,
            weight: 600,
          },
          padding: 12,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };
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
        const target = [
          { name: `Advance: ${this.toNumber(object.slNo)}`, value: this.toNumber(object.slNo) },
          { name: `Claims: ${this.toNumber(object.title)}`, value: this.toNumber(object.title) }
        ];
        this.totalChartData = this.createPieData(target, this.totalChartColors);
        return;
      }

      const target = [
        { name: `Submitted: ${this.toNumber(object.submitted)}`, value: this.toNumber(object.submitted) },
        { name: `Approved: ${this.toNumber(object.approved)}`, value: this.toNumber(object.approved) },
        { name: `Paid: ${this.toNumber(object.approvedCda)}`, value: this.toNumber(object.approvedCda) }
      ];
      if (kind === 'advance') {
        this.advanceChartData = this.createPieData(target, this.advanceChartColors);
      } else {
        this.claimChartData = this.createPieData(target, this.claimChartColors);
      }
    });
  }

  onTotalSelect(event: { active?: Array<{ index?: number }> }): void {
    const selectedName = this.getSelectedName(this.totalChartData, event);
    if (selectedName.includes('Claim')) {
      this.loadChartData('claim');
    } else {
      this.loadChartData('advance');
    }
  }

  onAdvanceSelect(event: { active?: Array<{ index?: number }> }): void {
    const selectedName = this.getSelectedName(this.advanceChartData, event);
    if (!selectedName) {
      return;
    }
    this.advHead = selectedName.split(':')[0];
    this.loadDrilldown(this.advModuleId, selectedName, (objects) => this.advList = objects);
  }

  onClaimSelect(event: { active?: Array<{ index?: number }> }): void {
    const selectedName = this.getSelectedName(this.claimChartData, event);
    if (!selectedName) {
      return;
    }
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

  private createPieData(rows: Array<{ name: string; value: number }>, colors: string[]): PieData {
    return {
      labels: rows.map((row) => row.name),
      datasets: [
        {
          data: rows.map((row) => row.value),
          backgroundColor: colors,
          hoverBackgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  }

  private getSelectedName(data: PieData, event: { active?: Array<{ index?: number }> }): string {
    const index = event?.active?.[0]?.index;
    if (index === undefined) {
      return '';
    }
    return `${data.labels?.[index] ?? ''}`;
  }

  private toNumber(value: any): number {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
