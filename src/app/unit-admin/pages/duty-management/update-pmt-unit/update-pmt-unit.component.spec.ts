import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { UpdatePmtUnitComponent } from './update-pmt-unit.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { SystemAdminService } from 'src/app/service/admin/systemAdmin.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('UpdatePmtUnitComponent', () => {
  let component: UpdatePmtUnitComponent;
  let fixture: ComponentFixture<UpdatePmtUnitComponent>;
  let systemAdmin: jasmine.SpyObj<SystemAdminService>;

  beforeEach(async () => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', ['getUserDetails']);
    const common = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    systemAdmin = jasmine.createSpyObj<SystemAdminService>('SystemAdminService', [
      'getUpdatePmtRecords',
      'getUpdatePmtAllUnits',
      'getPnoList',
      'createOrUpdatePmtUnit',
      'changePmtFlag'
    ]);

    auth.getUserDetails.and.returnValue({ gxUnitId: 'GX-1', unitId: 'UNIT-1' } as any);
    systemAdmin.getUpdatePmtRecords.and.returnValue(of({ status: true, object: [] }) as any);
    systemAdmin.getUpdatePmtAllUnits.and.returnValue(of({ status: true, object: [] }) as any);
    systemAdmin.getPnoList.and.returnValue(of({ status: true, object: [] }) as any);
    systemAdmin.createOrUpdatePmtUnit.and.returnValue(of({ status: true, object: [{}], message: 'Saved' }) as any);
    systemAdmin.changePmtFlag.and.returnValue(of({ status: true, object: [{ id: 'PMT-1' }], message: 'Updated' }) as any);

    await TestBed.configureTestingModule({
      declarations: [UpdatePmtUnitComponent],
      imports: [FormsModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: SystemAdminService, useValue: systemAdmin }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePmtUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads from units and to units with legacy gxUnit header behavior', () => {
    expect(systemAdmin.getUpdatePmtAllUnits).toHaveBeenCalledWith({ headers: {} });
    expect(systemAdmin.getUpdatePmtAllUnits).toHaveBeenCalledWith({
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
    expect(systemAdmin.getPnoList).toHaveBeenCalledWith({
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

    expect(systemAdmin.createOrUpdatePmtUnit).toHaveBeenCalledWith({
      fromUnitDTO: { unit: 'FROM-1' },
      codeHrDataDTO: { pid: 'PID-1', pno: '01361-T' },
      toUnitDTO: { unit: 'TO-1' }
    });
  });

  it('changes PMT flag with ids and status headers', () => {
    component.changeStatus({ id: 'PMT-1', currentStatus: 0 });

    expect(systemAdmin.changePmtFlag).toHaveBeenCalledWith({
      headers: {
        ids: 'PMT-1',
        status: 0
      }
    });
  });
});
