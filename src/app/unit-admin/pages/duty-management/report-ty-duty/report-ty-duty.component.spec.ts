import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ReportTyDutyComponent } from './report-ty-duty.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { MarkTyApiService } from 'src/app/service/api/mark-ty/mark-ty-api.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('ReportTyDutyComponent', () => {
  let component: ReportTyDutyComponent;
  let fixture: ComponentFixture<ReportTyDutyComponent>;
  let markTyApi: jasmine.SpyObj<MarkTyApiService>;

  beforeEach(async () => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', ['getUserDetails']);
    const common = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    markTyApi = jasmine.createSpyObj<MarkTyApiService>('MarkTyApiService', [
      'getPnoList',
      'getAllMarkedTyDuty',
      'createOrUpdateMarkedTyDuty',
      'changeMarkedTyDutyFlag'
    ]);

    auth.getUserDetails.and.returnValue({ gxUnitId: 'GX-1', unitId: 'UNIT-1' } as any);
    markTyApi.getPnoList.and.returnValue(of({ status: true, object: [] }) as any);
    markTyApi.getAllMarkedTyDuty.and.returnValue(of({ status: true, object: [] }) as any);
    markTyApi.createOrUpdateMarkedTyDuty.and.returnValue(of({ status: true, object: [{}], message: 'Saved' }) as any);
    markTyApi.changeMarkedTyDutyFlag.and.returnValue(of({ status: true, object: [{ id: 'TY-1' }], message: 'Updated' }) as any);

    await TestBed.configureTestingModule({
      declarations: [ReportTyDutyComponent],
      imports: [FormsModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: MarkTyApiService, useValue: markTyApi }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportTyDutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads PNO list with legacy gxUnit and empty unit headers', () => {
    expect(markTyApi.getPnoList).toHaveBeenCalledWith({
      headers: {
        gxUnit: 'GX-1',
        unit: ''
      }
    });
  });

  it('saves mark TY duty with legacy payload', () => {
    component.formObj = {
      pnoId: 'PID-1',
      codeHrDataDTO: { pid: 'PID-1', pno: '01361-T' }
    };

    component.saveRecord();

    expect(markTyApi.createOrUpdateMarkedTyDuty).toHaveBeenCalledWith({
      codeHrDataDTO: { pid: 'PID-1', pno: '01361-T' },
      status: '1'
    });
  });

  it('changes mark TY duty flag with id and status headers', () => {
    component.changeStatus({ id: 'TY-1', currentStatus: '0' });

    expect(markTyApi.changeMarkedTyDutyFlag).toHaveBeenCalledWith({
      headers: {
        id: 'TY-1',
        status: '0'
      }
    });
  });
});
