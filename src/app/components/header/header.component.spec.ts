import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { UserService } from 'src/app/service/admin/user.service';
import { environment } from 'src/environments/environment';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserDetails',
      'destroySession',
      'getTokenDetails',
      'refresh',
      'createSession'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader'
    ]);
    userService = jasmine.createSpyObj<UserService>('UserService', [
      'roles',
      'roleSwitch'
    ]);

    authService.getUserDetails.and.returnValue({
      userId: 'USR-1',
      roleId: 'ROLE-1',
      roleTypeId: 'CR',
      formId: 'FORM-1',
      personName: 'Test User',
      roleName: 'Creator'
    } as any);
    authService.getRuntimeModuleId = jasmine.createSpy().and.returnValue('ADV');
    userService.roles.and.returnValue(
      of({ status: true, object: [{ id: 'R1', roleName: 'Approver' }] }) as any
    );

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: UserService, useValue: userService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    localStorage.setItem(environment.authConfig.storageKeys.accessCount, '0');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(environment.authConfig.storageKeys.accessCount);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user details and role list on init', () => {
    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(userService.roles).toHaveBeenCalledWith({
      headers: {
        userId: 'USR-1',
        roleId: 'ROLE-1',
        moduleId: 'ADV'
      }
    });
    expect(component.dataList).toEqual([{ id: 'R1', roleName: 'Approver' }]);
    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('should destroy session when role API returns RD action', () => {
    userService.roles.and.returnValue(
      of({ status: true, action: 'RD', object: [] }) as any
    );

    component.getRoles();

    expect(authService.destroySession).toHaveBeenCalledWith('4');
  });

  it('should hide loader on role API error', () => {
    spyOn(console, 'log');
    userService.roles.and.returnValue(throwError(() => ({ status: 500 })) as any);

    component.getRoles();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should return roleId fallback from getRoleId helper', () => {
    expect(component.getRoleId({ roleId: 'ROLE-2', id: 'ROW-2' })).toBe('ROLE-2');
    expect(component.getRoleId({ id: 'ROW-3' })).toBe('ROW-3');
  });

  it('should hide current role by legacy roleTypeId comparison', () => {
    expect(component.isCurrentRole({
      roleId: 'ROLE-2',
      aclCodeRoleTypeDTO: { roleTypeId: 'CR' }
    })).toBeTrue();
    expect(component.isCurrentRole({
      roleId: 'ROLE-2',
      aclCodeRoleTypeDTO: { roleTypeId: 'AP' }
    })).toBeFalse();
  });
});

