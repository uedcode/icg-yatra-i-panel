import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ArchiveComponent } from './archive.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { SystemAdminService } from 'src/app/service/admin/systemAdmin.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('ArchiveComponent', () => {
  let component: ArchiveComponent;
  let fixture: ComponentFixture<ArchiveComponent>;
  let systemAdmin: jasmine.SpyObj<SystemAdminService>;

  beforeEach(async () => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'codeStatus',
      'getUserDetails',
      'viewFile'
    ]);
    const common = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    systemAdmin = jasmine.createSpyObj<SystemAdminService>('SystemAdminService', [
      'getUnitAdminRoles',
      'changeStatusArchive'
    ]);

    auth.codeStatus.and.returnValue({ activate: 'AC', deactivate: 'DA' } as any);
    auth.getUserDetails.and.returnValue({ unitId: 'UNIT-1', roleTypeId: 'UN' } as any);
    systemAdmin.getUnitAdminRoles.and.returnValue(of({ status: true, object: [] }) as any);
    systemAdmin.changeStatusArchive.and.returnValue(of({ status: true, object: [{}], message: 'Restored' }) as any);

    await TestBed.configureTestingModule({
      declarations: [ArchiveComponent],
      imports: [FormsModule, RouterTestingModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: SystemAdminService, useValue: systemAdmin }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads archived roles using backend archive filter', () => {
    expect(systemAdmin.getUnitAdminRoles).toHaveBeenCalledWith({
      headers: {
        unitId: 'UNIT-1',
        verAppIndicator: '1',
        isArchive: '1'
      }
    });
  });

  it('restores roles with legacy changeStatusArchive headers', () => {
    component.openChangeStatusModal({ roleId: 'ROLE-1' });

    component.changeStatusArchive();

    expect(systemAdmin.changeStatusArchive).toHaveBeenCalledOnceWith({
      headers: {
        ids: 'ROLE-1',
        isArchive: '0'
      }
    });
  });

  it('renders legacy archive table columns', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Authorization No');
    expect(text).toContain('Authorization Date');
    expect(text).toContain('Scanned copy of Authorization');
    expect(text).toContain('Status');
    expect(text).toContain('Restore');
  });
});
