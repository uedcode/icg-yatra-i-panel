import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ArchiveComponent } from './archive.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('ArchiveComponent', () => {
  let component: ArchiveComponent;
  let fixture: ComponentFixture<ArchiveComponent>;
  let roleApi: jasmine.SpyObj<RoleApiService>;

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
    roleApi = jasmine.createSpyObj<RoleApiService>('RoleApiService', [
      'getAllRoles',
      'changeRoleArchiveStatus'
    ]);

    auth.codeStatus.and.returnValue({ activate: 'AC', deactivate: 'DA' } as any);
    auth.getUserDetails.and.returnValue({ unitId: 'UNIT-1', roleTypeId: 'UN' } as any);
    roleApi.getAllRoles.and.returnValue(of({ status: true, object: [] }) as any);
    roleApi.changeRoleArchiveStatus.and.returnValue(of({ status: true, object: [{}], message: 'Restored' }) as any);

    await TestBed.configureTestingModule({
      declarations: [ArchiveComponent],
      imports: [FormsModule, RouterTestingModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: RoleApiService, useValue: roleApi }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads archived roles using backend archive filter', () => {
    expect(roleApi.getAllRoles).toHaveBeenCalledWith({
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

    expect(roleApi.changeRoleArchiveStatus).toHaveBeenCalledOnceWith({
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
