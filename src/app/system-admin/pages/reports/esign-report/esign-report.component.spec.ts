import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { EsignReportComponent } from './esign-report.component';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('EsignReportComponent', () => {
  let component: EsignReportComponent;
  let fixture: ComponentFixture<EsignReportComponent>;
  let claimStateApi: jasmine.SpyObj<ClaimStateApiService>;
  let codeUnitApi: jasmine.SpyObj<CodeUnitApiService>;

  beforeEach(async () => {
    const common = jasmine.createSpyObj<CommonService>('CommonService', ['showLoader', 'hideLoader']);
    claimStateApi = jasmine.createSpyObj<ClaimStateApiService>('ClaimStateApiService', ['getEsignReportData']);
    codeUnitApi = jasmine.createSpyObj<CodeUnitApiService>('CodeUnitApiService', ['getGxUnits']);

    codeUnitApi.getGxUnits.and.returnValue(of({ status: true, object: [{ unit: '000226', descr: 'ICGS Delhi' }] }) as any);
    claimStateApi.getEsignReportData.and.returnValue(of({ status: true, object: [] }) as any);

    await TestBed.configureTestingModule({
      declarations: [EsignReportComponent],
      imports: [FormsModule, PipeModule],
      providers: [
        { provide: CommonService, useValue: common },
        { provide: ClaimStateApiService, useValue: claimStateApi },
        { provide: CodeUnitApiService, useValue: codeUnitApi }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EsignReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads legacy gx units and defaults report to ICGS Delhi unit', () => {
    expect(codeUnitApi.getGxUnits).toHaveBeenCalled();
    expect(component.selectedGxUnitId).toBe('000226');
    expect(claimStateApi.getEsignReportData).toHaveBeenCalledWith({
      headers: { gxUnitId: '000226' }
    });
  });

  it('searches report with selected gxUnitId', () => {
    component.selectedGxUnitId = '000999';

    component.getReportData();

    expect(claimStateApi.getEsignReportData).toHaveBeenCalledWith({
      headers: { gxUnitId: '000999' }
    });
  });

  it('renders legacy report table columns and no records text', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('SL');
    expect(text).toContain('Type of Form');
    expect(text).toContain('WRITER');
    expect(text).toContain('LOGO');
    expect(text).toContain('CO');
    expect(text).toContain('Pending With CDA');
    expect(text).toContain('Passed By CDA');
    expect(text).toContain('Total forms forwarded to CDA');
    expect(text).toContain('No Records');
  });
});
