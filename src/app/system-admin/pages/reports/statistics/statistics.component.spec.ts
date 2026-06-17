import { DOCUMENT } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { StatisticsComponent } from './statistics.component';
import { CommonService } from 'src/app/service/core/common.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';
import { PipeModule } from 'src/app/app-pipe.module';
import { AuthService } from 'src/app/service/auth/auth.service';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let common: jasmine.SpyObj<CommonService>;
  let report: jasmine.SpyObj<ReportAnalyticsService>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    common = jasmine.createSpyObj<CommonService>('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    report = jasmine.createSpyObj<ReportAnalyticsService>('ReportAnalyticsService', ['getPieChartData']);
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getModuleName']);

    report.getPieChartData.and.returnValue(of({ status: true, object: [{ slNo: '2', title: '3', submitted: '1', approved: '2', approvedCda: '3' }] }) as any);
    auth.getModuleName.and.returnValue('/system-admin');
    spyOn(window, 'open');

    await TestBed.configureTestingModule({
      declarations: [StatisticsComponent],
      imports: [FormsModule, PipeModule],
      providers: [
        { provide: CommonService, useValue: common },
        { provide: ReportAnalyticsService, useValue: report },
        { provide: AuthService, useValue: auth },
        { provide: DOCUMENT, useValue: { location: { pathname: '/claim/system-admin/statistics' } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads legacy total, advance and claim chart calls on init', () => {
    expect(report.getPieChartData.calls.count()).toBe(3);
    expect(report.getPieChartData).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({ claimType: '', type: '', isSelected: '', filterType: 'version' })
    });
    expect(report.getPieChartData).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({ claimType: 'ADV', type: '0', isSelected: '', filterType: 'version' })
    });
    expect(report.getPieChartData).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({ claimType: 'CLM', type: '0', isSelected: '', filterType: 'version' })
    });
  });

  it('renders legacy chart titles', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Total Claims');
    expect(text).toContain('Advance');
    expect(text).toContain('Claims');
  });

  it('uses readable pie chart label configuration', () => {
    expect(component.trimLabels).toBeFalse();
    expect(component.maxLabelLength).toBe(40);
    expect(component.explodeSlices).toBeFalse();
    expect(component.totalChartView).toEqual([980, 285]);
    expect(component.halfChartView).toEqual([590, 285]);
    expect(component.totalChartMargins).toEqual([5, 120, 5, 120]);
    expect(component.halfChartMargins).toEqual([5, 80, 5, 80]);
  });

  it('keeps chart labels with full values', () => {
    expect(component.totalChartData).toEqual([
      { name: 'Advance: 2', value: 2 },
      { name: 'Claims: 3', value: 3 }
    ]);
    expect(component.advanceChartData).toEqual([
      { name: 'Submitted: 1', value: 1 },
      { name: 'Approved: 2', value: 2 },
      { name: 'Paid: 3', value: 3 }
    ]);
  });

  it('blocks custom filter without dates', () => {
    report.getPieChartData.calls.reset();
    component.selectedOpt = 'custom';
    component.customFromDate = '';
    component.customToDate = '';

    component.applyFilter();

    expect(common.showMessage).toHaveBeenCalledWith('Please select from date', 'danger');
    expect(report.getPieChartData).not.toHaveBeenCalled();
  });

  it('sends custom dates in filter headers', () => {
    report.getPieChartData.calls.reset();
    component.selectedOpt = 'custom';
    component.customFromDate = '2026-06-01';
    component.customToDate = '2026-06-17';

    component.applyFilter();

    expect(report.getPieChartData).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({
        filterType: 'custom',
        customFromDate: '2026-06-01',
        customToDate: '2026-06-17'
      })
    });
  });

  it('loads advance drilldown with clicked legacy label', () => {
    report.getPieChartData.calls.reset();

    component.onAdvanceSelect({ name: 'Submitted: 1' });

    expect(report.getPieChartData).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({ claimType: 'ADV', type: '1', isSelected: 'Submitted: 1' })
    });
  });

  it('loads claim drilldown with clicked legacy label', () => {
    report.getPieChartData.calls.reset();

    component.onClaimSelect({ name: 'Paid: 3' });

    expect(report.getPieChartData).toHaveBeenCalledWith({
      headers: jasmine.objectContaining({ claimType: 'CLM', type: '1', isSelected: 'Paid: 3' })
    });
  });

  it('opens legacy preview-report route with x y z params', () => {
    component.openPreviewReport();

    expect(window.open).toHaveBeenCalledWith('/claim/system-admin/preview-report?x=version&y=0&z=0', '_blank');
  });

  it('keeps custom filter values in module-aware preview-report url', () => {
    component.selectedOpt = 'custom';
    component.customFromDate = '2026-06-01';
    component.customToDate = '2026-06-17';

    component.openPreviewReport();

    expect(window.open).toHaveBeenCalledWith(
      '/claim/system-admin/preview-report?x=custom&y=2026-06-01&z=2026-06-17',
      '_blank'
    );
  });
});
