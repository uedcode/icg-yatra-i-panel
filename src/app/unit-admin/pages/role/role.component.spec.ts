import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RoleComponent } from './role.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { SystemAdminService } from 'src/app/service/admin/systemAdmin.service';
import { UserService } from 'src/app/service/admin/user.service';
import { DropdownService } from 'src/app/service/form/dropdown.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('RoleComponent', () => {
  let component: RoleComponent;
  let fixture: ComponentFixture<RoleComponent>;
  let systemAdmin: jasmine.SpyObj<SystemAdminService>;
  let user: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'codeRoleType',
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
      'createOrUpdate',
      'changeStatus',
      'changeStatusArchive'
    ]);
    user = jasmine.createSpyObj<UserService>('UserService', ['getAll', 'getSingle']);
    const dropdown = jasmine.createSpyObj<DropdownService>('DropdownService', [
      'getCodeRoleType',
      'getCodeDesignation'
    ]);

    auth.codeRoleType.and.returnValue({ unitAdmin: 'UN' } as any);
    auth.codeStatus.and.returnValue({ activate: 'AC', deactivate: 'DA' } as any);
    auth.getUserDetails.and.returnValue({ unitId: 'UNIT-1', gxUnitId: 'GX-1', roleTypeId: 'UN', moduleId: 'ADV' } as any);
    systemAdmin.getUnitAdminRoles.and.returnValue(of({ status: true, object: [] }) as any);
    systemAdmin.createOrUpdate.and.returnValue(of({ status: true, object: [{}], message: 'Saved' }) as any);
    systemAdmin.changeStatus.and.returnValue(of({ status: true, object: [{}], message: 'Updated' }) as any);
    systemAdmin.changeStatusArchive.and.returnValue(of({ status: true, object: [{}], message: 'Archived' }) as any);
    user.getAll.and.returnValue(of({ status: true, object: [] }) as any);
    user.getSingle.and.returnValue(of({ status: true, object: [] }) as any);
    dropdown.getCodeRoleType.and.returnValue(of({ status: true, object: [] }) as any);
    dropdown.getCodeDesignation.and.returnValue(of({ status: true, object: [] }) as any);

    await TestBed.configureTestingModule({
      declarations: [RoleComponent],
      imports: [FormsModule, RouterTestingModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: SystemAdminService, useValue: systemAdmin },
        { provide: UserService, useValue: user },
        { provide: DropdownService, useValue: dropdown }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('archives roles with legacy changeStatusArchive headers', () => {
    component.openArchiveModal({ roleId: 'ROLE-1' });

    component.changeStatusArchive();

    expect(systemAdmin.changeStatusArchive).toHaveBeenCalledOnceWith({
      headers: {
        ids: 'ROLE-1',
        isArchive: '1'
      }
    });
  });

  it('loads manage role table with legacy gxUnitId header', () => {
    expect(systemAdmin.getUnitAdminRoles).toHaveBeenCalledWith({
      headers: {
        unitId: 'GX-1',
        verAppIndicator: '1'
      }
    });
  });

  it('falls back to unitId when gxUnitId is not available for manage role table', () => {
    component.userIdDetails = { unitId: 'UNIT-ONLY' };

    component.getAll();

    expect(systemAdmin.getUnitAdminRoles).toHaveBeenCalledWith({
      headers: {
        unitId: 'UNIT-ONLY',
        verAppIndicator: '1'
      }
    });
  });

  it('loads users with legacy unit and cadre headers when cadre changes', () => {
    component.formObj.cadre = 'OP';

    component.onCadreChange();

    expect(user.getAll).toHaveBeenCalledWith({
      headers: {
        unitId: 'UNIT-1',
        cadre: 'OP'
      }
    });
  });

  it('loads selected user details and fills PNO', () => {
    user.getSingle.and.returnValue(of({
      status: true,
      object: [{ userId: 'USER-2', pno: '54321', suf: 'T', rank: 'RANK' }]
    }) as any);

    component.onUserChange('USER-2');

    expect(user.getSingle).toHaveBeenCalledWith({ headers: { userId: 'USER-2' } });
    expect(component.userObj.userId).toBe('USER-2');
    expect(component.formObj.pno).toBe('54321-T');
  });

  it('builds legacy multipart payload for manage role save', () => {
    component.formObj = {
      cadre: 'OP',
      userId: 'USER-1',
      pno: '12345-R',
      role: 'AP',
      desig: 'CO',
      authNo: 'AUTH-1',
      authDate: '2026-06-01',
      fromDateTime: '2026-06-01T10:30'
    };
    component.userObj = {
      userId: 'USER-1',
      pno: '12345',
      suf: 'R',
      nameDescr: 'Test User',
      rankDescr: 'Rank'
    };
    component.authDocFile = new File(['pdf'], 'auth.pdf', { type: 'application/pdf' });
    component.disableBtn = false;

    component.saveRecord();

    const formData = systemAdmin.createOrUpdate.calls.mostRecent().args[0] as FormData;
    const dto = JSON.parse(formData.get('aclRoleDTO') as string);
    expect(dto.aclCodeRoleTypeDTO.roleTypeId).toBe('AP');
    expect(dto.aclCodeDesignationDTO.desigId).toBe('CO');
    expect(dto.aclUserDTO.userId).toBe('USER-1');
    expect(dto.codeUnitDTO.unit).toBe('UNIT-1');
    expect(dto.name).toBeUndefined();
    expect(dto.rank).toBeUndefined();
    expect(dto.pno).toBeUndefined();
    expect(formData.get('authDocUrl')).toEqual(jasmine.any(File));
  });

  it('filters roles by legacy designation rules', () => {
    component.allRoleList = [
      { roleTypeId: 'VE1', roleType: 'Verifier 1' },
      { roleTypeId: 'AP', roleType: 'Approver' }
    ];

    component.filterRoles('CO');
    expect(component.roleList.map((role: any) => role.roleTypeId)).toEqual(['AP']);

    component.filterRoles('LOGO');
    expect(component.roleList.map((role: any) => role.roleTypeId)).toEqual(['VE1']);
  });

  it('renders legacy manage role table columns', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Authorization No');
    expect(text).toContain('Authorization Date');
    expect(text).toContain('Scanned copy of Authorization');
    expect(text).toContain('Archive');
  });
});
