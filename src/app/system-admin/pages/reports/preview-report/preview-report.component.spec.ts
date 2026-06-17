import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PreviewReportComponent } from './preview-report.component';
import { CommonService } from 'src/app/service/core/common.service';
import { ReportAnalyticsService } from 'src/app/service/master/report-analytics.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('PreviewReportComponent', () => {
  let fixture: ComponentFixture<PreviewReportComponent>;
  let report: jasmine.SpyObj<ReportAnalyticsService>;

  beforeEach(async () => {
    const common = jasmine.createSpyObj<CommonService>('CommonService', ['showLoader', 'hideLoader']);
    report = jasmine.createSpyObj<ReportAnalyticsService>('ReportAnalyticsService', ['viewReport']);
    report.viewReport.and.returnValue(of({
      status: true,
      object: {
        dashboardList: [],
        advList: [],
        claimList: []
      }
    }) as any);

    await TestBed.configureTestingModule({
      declarations: [PreviewReportComponent],
      imports: [PipeModule],
      providers: [
        { provide: CommonService, useValue: common },
        { provide: ReportAnalyticsService, useValue: report },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => ({ x: 'custom', y: '2026-06-01', z: '2026-06-17' } as any)[key]
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewReportComponent);
    fixture.detectChanges();
  });

  it('calls legacy viewReport endpoint headers with mode view', () => {
    expect(report.viewReport).toHaveBeenCalledWith({
      headers: {
        filterType: 'custom',
        customFromDate: '2026-06-01',
        customToDate: '2026-06-17',
        mode: 'view'
      }
    });
  });

  it('renders legacy report sections', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Dashboard');
    expect(text).toContain('Advance');
    expect(text).toContain('Claim');
    expect(text).toContain('Pending with CDA');
    expect(text).toContain('Advance Requested');
    expect(text).toContain('No Records');
  });
});
