import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { UpdatePmtUnitComponent } from './update-pmt-unit.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { MarkTyApiService } from 'src/app/service/api/mark-ty/mark-ty-api.service';
import { UpdatePmtApiService } from 'src/app/service/api/update-pmt/update-pmt-api.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('UpdatePmtUnitComponent', () => {
  let component: UpdatePmtUnitComponent;
  let fixture: ComponentFixture<UpdatePmtUnitComponent>;
  let updatePmtApi: jasmine.SpyObj<UpdatePmtApiService>;
  let markTyApi: jasmine.SpyObj<MarkTyApiService>;

  beforeEach(async () => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', ['getUserDetails']);
    const common = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    updatePmtApi = jasmine.createSpyObj<UpdatePmtApiService>('UpdatePmtApiService', [
      'getAllRecords',
      'getAllUnits',
      'createOrUpdate',
      'changeFlag'
    ]);
    markTyApi = jasmine.createSpyObj<MarkTyApiService>('MarkTyApiService', [
      'getPnoList'
    ]);

    auth.getUserDetails.and.returnValue({ gxUnitId: 'GX-1', unitId: 'UNIT-1' } as any);
    updatePmtApi.getAllRecords.and.returnValue(of({ status: true, object: [] }) as any);
    updatePmtApi.getAllUnits.and.returnValue(of({ status: true, object: [] }) as any);
    markTyApi.getPnoList.and.returnValue(of({ status: true, object: [] }) as any);
    updatePmtApi.createOrUpdate.and.returnValue(of({ status: true, object: [{}], message: 'Saved' }) as any);
    updatePmtApi.changeFlag.and.returnValue(of({ status: true, object: [{ id: 'PMT-1' }], message: 'Updated' }) as any);

    await TestBed.configureTestingModule({
      declarations: [UpdatePmtUnitComponent],
      imports: [FormsModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: UpdatePmtApiService, useValue: updatePmtApi },
        { provide: MarkTyApiService, useValue: markTyApi }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePmtUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads from units and to units with legacy gxUnit header behavior', () => {
    expect(updatePmtApi.getAllUnits).toHaveBeenCalledWith({ headers: {} });
    expect(updatePmtApi.getAllUnits).toHaveBeenCalledWith({
      headers: {
        gxUnitId: 'GX-1'
      }
    });
  });

  it('reloads PNO list and clears details when From Unit changes', () => {
    component.allUnits = [{ unit: 'UNIT-A', descr: 'Unit A' }];
    component.formObj = {
      pnoId: 'PID-OLD',
      codeHrDataDTO: { pid: 'PID-OLD' }
    };

    component.onFromUnitChange('UNIT-A');

    expect(component.formObj.pnoId).toBe('');
    expect(component.formObj.codeHrDataDTO).toEqual({});
    expect(markTyApi.getPnoList).toHaveBeenCalledWith({
      headers: {
        gxUnit: '',
        unit: 'UNIT-A'
      }
    });
  });

  it('saves update PMT unit with legacy payload', () => {
    component.formObj = {
      fromUnitDTO: { unit: 'FROM-1' },
      codeHrDataDTO: { pid: 'PID-1', pno: '01361-T' },
      toUnitDTO: { unit: 'TO-1' }
    };

    component.saveRecord();

    expect(updatePmtApi.createOrUpdate).toHaveBeenCalledWith({
      fromUnitDTO: { unit: 'FROM-1' },
      codeHrDataDTO: { pid: 'PID-1', pno: '01361-T' },
      toUnitDTO: { unit: 'TO-1' }
    });
  });

  it('changes PMT flag with ids and status headers', () => {
    component.changeStatus({ id: 'PMT-1', currentStatus: 0 });

    expect(updatePmtApi.changeFlag).toHaveBeenCalledWith({
      headers: {
        ids: 'PMT-1',
        status: 0
      }
    });
  });
});
