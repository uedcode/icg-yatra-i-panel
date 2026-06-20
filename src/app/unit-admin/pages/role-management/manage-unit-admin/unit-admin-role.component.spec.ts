import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { UnitAdminRoleComponent } from './unit-admin-role.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';
import { UserApiService } from 'src/app/service/api/admin/user-api.service';
import { PipeModule } from 'src/app/app-pipe.module';

describe('UnitAdminRoleComponent', () => {
  let component: UnitAdminRoleComponent;
  let fixture: ComponentFixture<UnitAdminRoleComponent>;
  let roleApi: jasmine.SpyObj<RoleApiService>;
  let user: jasmine.SpyObj<UserApiService>;

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
    roleApi = jasmine.createSpyObj<RoleApiService>('RoleApiService', [
      'getAllRoles',
      'createOrUpdateRole',
      'changeRoleStatus'
    ]);
    user = jasmine.createSpyObj<UserApiService>('UserApiService', ['getAll', 'getSingle']);

    auth.codeRoleType.and.returnValue({ unitAdmin: 'UN' } as any);
    auth.codeStatus.and.returnValue({ activate: 'AC', deactivate: 'DA' } as any);
    auth.getUserDetails.and.returnValue({ unitId: 'UNIT-1', roleTypeId: 'UN' } as any);
    roleApi.getAllRoles.and.returnValue(of({ status: true, object: [] }) as any);
    roleApi.createOrUpdateRole.and.returnValue(of({ status: true, object: [{}], message: 'Saved' }) as any);
    roleApi.changeRoleStatus.and.returnValue(of({ status: true, object: [{}], message: 'Updated' }) as any);
    user.getAll.and.returnValue(of({ status: true, object: [] }) as any);
    user.getSingle.and.returnValue(of({ status: true, object: [] }) as any);

    await TestBed.configureTestingModule({
      declarations: [UnitAdminRoleComponent],
      imports: [FormsModule, RouterTestingModule, PipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: RoleApiService, useValue: roleApi },
        { provide: UserApiService, useValue: user }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitAdminRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds legacy multipart payload for unit admin save', () => {
    component.formObj = {
      cadre: 'OP',
      pno: '12345-R',
      authNo: 'AUTH-1',
      authDate: '2026-06-01',
      fromDateTime: '2026-06-01T10:30'
    };
    component.formObj.userId = 'USER-1';
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

    const formData = roleApi.createOrUpdateRole.calls.mostRecent().args[0] as FormData;
    const dto = JSON.parse(formData.get('aclRoleDTO') as string);
    expect(dto.aclCodeRoleTypeDTO.roleTypeId).toBe('UN');
    expect(dto.aclUserDTO.userId).toBe('USER-1');
    expect(dto.codeUnitDTO.unit).toBe('UNIT-1');
    expect(dto.authNo).toBe('AUTH-1');
    expect(dto.name).toBeUndefined();
    expect(dto.rank).toBeUndefined();
    expect(dto.pno).toBeUndefined();
    expect(formData.get('authDocUrl')).toEqual(jasmine.any(File));
  });

  it('loads users with legacy unit and cadre headers', () => {
    component.formObj.cadre = 'OP';

    component.loadUsersForCadre();

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
      object: [{ userId: 'USER-2', pno: '54321', suf: 'T', name: 'Second User' }]
    }) as any);

    component.onUserChange('USER-2');

    expect(user.getSingle).toHaveBeenCalledWith({ headers: { userId: 'USER-2' } });
    expect(component.userObj.userId).toBe('USER-2');
    expect(component.formObj.pno).toBe('54321-T');
  });

  it('renders legacy unit admin table columns', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Unit');
    expect(text).toContain('Authorization No');
    expect(text).toContain('Authorization Date');
    expect(text).toContain('Scanned copy of Authorization');
    expect(text).toContain('From Date and Time');
  });
});
