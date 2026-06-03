import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { CommonSwitchModuleComponent } from './common-switch-module.component';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { UserService } from 'src/app/service/admin/user.service';
import { DeviceService } from 'src/app/service/acl/device.service';
import { environment } from 'src/environments/environment';

describe('CommonSwitchModuleComponent', () => {
  let component: CommonSwitchModuleComponent;
  let fixture: ComponentFixture<CommonSwitchModuleComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let deviceService: jasmine.SpyObj<DeviceService>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserDetails',
      'getTokenDetails',
      'refresh',
      'createSession'
    ]);
    userService = jasmine.createSpyObj<UserService>('UserService', ['moduleSwitch']);
    deviceService = jasmine.createSpyObj<DeviceService>('DeviceService', ['generateBrowserId']);

    authService.getUserDetails.and.returnValue({ userId: 'USR-1' } as any);
    authService.getTokenDetails.and.returnValue({ refreshToken: 'REFRESH-1' } as any);
    userService.moduleSwitch.and.returnValue(of({ status: true }) as any);
    authService.refresh.and.returnValue(of({ access_token: 'A' }) as any);
    deviceService.generateBrowserId.and.returnValue('BROWSER-NEW');

    await TestBed.configureTestingModule({
      declarations: [CommonSwitchModuleComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
        { provide: DeviceService, useValue: deviceService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSwitchModuleComponent);
    component = fixture.componentInstance;
    const old$ = (window as any).$;
    (window as any).$ = () => ({ modal: () => undefined });
    try {
      fixture.detectChanges();
    } finally {
      (window as any).$ = old$;
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user details on init', () => {
    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(component.userIdDetails).toEqual({ userId: 'USR-1' } as any);
  });

  it('should switch module and trigger refresh flow on success', () => {
    component.switchModule('NGIF');

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(userService.moduleSwitch).toHaveBeenCalled();
    expect(authService.refresh).toHaveBeenCalled();
    expect(authService.createSession).toHaveBeenCalledWith(jasmine.anything(), 'LOGIN');
    expect(localStorage.getItem(environment.authConfig.storageKeys.deviceId)).toBe('BROWSER-NEW');
    expect(commonService.hideLoader).toHaveBeenCalled();
    localStorage.removeItem(environment.authConfig.storageKeys.deviceId);
  });

  it('should hide loader when module switch API fails', () => {
    spyOn(console, 'log');
    userService.moduleSwitch.and.returnValue(throwError(() => ({ status: 500 })) as any);

    component.switchModule('INBA');

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });
});

