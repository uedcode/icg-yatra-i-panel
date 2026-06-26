import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import * as crypto from 'crypto-js';

import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { OtpApiService } from 'src/app/service/api/security/otp-api.service';
import { SecurityApiService } from 'src/app/service/api/security/security-api.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let otpService: jasmine.SpyObj<OtpApiService>;
  let router: jasmine.SpyObj<Router>;

  const createComponent = () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'createSession',
      'getModuleName',
      'getPostLoginLandingUrl',
      'getRuntimeModuleId',
      'getUserDetails',
      'login'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'getClientIp',
      'hideLoader',
      'showLoader',
      'showMessage'
    ]);
    otpService = jasmine.createSpyObj<OtpApiService>('OtpApiService', ['sendOtp']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    authService.getUserDetails.and.returnValue(null);
    authService.getModuleName.and.returnValue('/creator');
    authService.getPostLoginLandingUrl.and.returnValue('/creator/new');
    authService.getRuntimeModuleId.and.returnValue('ADV');
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    return TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: OtpApiService, useValue: otpService },
        { provide: Router, useValue: router },
        { provide: SecurityApiService, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps SMS as the default login type', () => {
    expect(component.loginForm.loginType).toBe('SMS');
  });

  it('does not redirect when no user session exists', () => {
    component.checkSession();

    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('redirects an existing session to the legacy role landing page', () => {
    authService.getUserDetails.and.returnValue({ userId: 'U1', roleTypeId: 'CR' });
    authService.getPostLoginLandingUrl.and.returnValue('/creator/new');

    component.checkSession();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/creator/new');
  });

  it('uses the central post-login landing helper when a session exists', () => {
    authService.getUserDetails.and.returnValue({ userId: 'U1', roleTypeId: 'CR' });
    authService.getPostLoginLandingUrl.and.returnValue('/creator/movement-update-claim?statusId=0');

    component.checkSession();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/creator/movement-update-claim?statusId=0');
  });

  it('blocks login and refreshes captcha when captcha does not match', () => {
    spyOn(component, 'captchaGenerate').and.callThrough();
    spyOn(component, 'mainLogin');
    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      captcha: 'WRONG1'
    };

    component.login();

    expect(component.captchaGenerate).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledOnceWith(
      'Please enter a valid captcha',
      'danger'
    );
    expect(commonService.showLoader).not.toHaveBeenCalled();
    expect(component.mainLogin).not.toHaveBeenCalled();
  });

  it('starts the login request only after captcha validation passes', () => {
    spyOn(component, 'mainLogin');
    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      captcha: 'ABC123'
    };

    component.login();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(component.disableBtn).toBeTrue();
    expect(component.mainLogin).toHaveBeenCalled();
  });

  it('submits encrypted OAuth password grant params and creates a login session on success', () => {
    const response = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      userId: 'U1',
      roleTypeId: 'CR'
    };
    authService.login.and.returnValue(of(response));
    component.loginForm = {
      username: 'creator',
      password: 'secret'
    };
    component.disableBtn = true;

    component.mainLogin();

    const params = authService.login.calls.mostRecent().args[0] as HttpParams;
    expect(params.get('grant_type')).toBe('password');
    expect(params.get('is_login')).toBe('1');
    expect(params.get('password')).toBeTruthy();
    const usernameParts = params.get('username')?.split('---') || [];
    expect(usernameParts.length).toBe(3);
    expect(usernameParts[2]).toBe('ADV');
    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('Login Successfully');
    expect(authService.createSession).toHaveBeenCalledOnceWith(response, 'LOGIN');
    expect(component.disableBtn).toBeFalse();
  });

  it('shows the specific invalid credential message for 401 login failures', () => {
    spyOn(console, 'log');
    authService.login.and.returnValue(throwError(() => ({ status: 401 })));
    component.loginForm = {
      username: 'creator',
      password: 'bad-password'
    };
    component.disableBtn = true;

    component.mainLogin();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      "That's not the right password or Username. Please try again.",
      'danger'
    );
    expect(authService.createSession).not.toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
  });

  it('shows backend error descriptions for non-401 login failures', () => {
    spyOn(console, 'log');
    authService.login.and.returnValue(
      throwError(() => ({
        status: 500,
        error: { error_description: 'OAuth service unavailable' }
      }))
    );
    component.loginForm = {
      username: 'creator',
      password: 'secret'
    };
    component.disableBtn = true;

    component.mainLogin();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'OAuth service unavailable',
      'danger'
    );
    expect(authService.createSession).not.toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
  });

  it('falls back to a generic message when non-401 response has no error description', () => {
    spyOn(console, 'log');
    authService.login.and.returnValue(
      throwError(() => ({
        status: 500,
        error: {}
      }))
    );
    component.loginForm = {
      username: 'creator',
      password: 'secret'
    };
    component.disableBtn = true;

    component.mainLogin();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Login failed. Please try again.',
      'danger'
    );
    expect(component.disableBtn).toBeFalse();
  });

  it('sendOtp should proceed on valid captcha and call OTP API', async () => {
    const old$ = (window as any).$;
    (window as any).$ = () => ({ modal: () => undefined });
    spyOn(component, 'captchaGenerate').and.callThrough();
    commonService.getClientIp.and.returnValue(Promise.resolve('127.0.0.1') as any);
    otpService.sendOtp.and.returnValue(of({ status: true, object: [{}] }) as any);

    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      loginType: 'SMS',
      captcha: 'ABC123'
    };

    try {
      await component.sendOtp();

      expect(commonService.showLoader).toHaveBeenCalled();
      expect(otpService.sendOtp).toHaveBeenCalled();
      expect(component.disableBtn).toBeFalse();
      expect(component.captchaGenerate).toHaveBeenCalled();
    } finally {
      (window as any).$ = old$;
    }
  });

  it('sendOtp should decrypt OTP payload fields and open OTP modal on success', async () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });
    commonService.getClientIp.and.returnValue(Promise.resolve('127.0.0.1') as any);
    otpService.sendOtp.and.returnValue(
      of({
        status: true,
        object: [{ userId: 'encUser', phone: 'encPhone', email: 'encEmail', otp: 'encOtp' }]
      }) as any
    );

    spyOn(crypto.AES, 'decrypt').and.callFake((value: any, key: any) => {
      const map: Record<string, string> = {
        otpUserId: 'U-100',
        phoneNo: '9999999999',
        email: 'user@yatra.test',
        otp: '123456'
      };
      return {
        toString: () => map[key as string] || ''
      } as any;
    });

    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      loginType: 'SMS',
      captcha: 'ABC123'
    };

    try {
      await component.sendOtp();

      expect(component.recordObj.userId).toBe('U-100');
      expect(component.recordObj.phone).toBe('9999999999');
      expect(component.recordObj.email).toBe('user@yatra.test');
      expect(commonService.showMessage).toHaveBeenCalledWith('123456');
      expect(modalSpy).toHaveBeenCalledWith('show');
    } finally {
      (window as any).$ = old$;
    }
  });

  it('sendOtp should block request and refresh captcha when captcha does not match', async () => {
    spyOn(component, 'captchaGenerate').and.callThrough();
    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      loginType: 'SMS',
      captcha: 'WRONG1'
    };

    await component.sendOtp();

    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please enter a valid captcha',
      'danger'
    );
    expect(otpService.sendOtp).not.toHaveBeenCalled();
    expect(commonService.showLoader).not.toHaveBeenCalled();
    expect(component.captchaGenerate).toHaveBeenCalled();
  });

  it('sendOtp should hide loader and reset button when OTP API fails', async () => {
    spyOn(console, 'log');
    spyOn(component, 'captchaGenerate').and.callThrough();
    commonService.getClientIp.and.returnValue(Promise.resolve('127.0.0.1') as any);
    otpService.sendOtp.and.returnValue(throwError(() => ({ status: 500 })) as any);

    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      loginType: 'SMS',
      captcha: 'ABC123'
    };
    component.disableBtn = false;

    await component.sendOtp();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(component.disableBtn).toBeFalse();
    expect(component.captchaGenerate).toHaveBeenCalled();
  });

  it('sendOtp should use fallback client IP from rejection payload and call OTP API', async () => {
    commonService.getClientIp.and.returnValue(
      Promise.reject({ error: { text: '10.0.0.7' } }) as any
    );
    otpService.sendOtp.and.returnValue(of({ status: false, message: 'OTP failed' }) as any);

    component.yourCaptcha = 'ABC123';
    component.loginForm = {
      username: 'creator',
      password: 'secret',
      loginType: 'SMS',
      captcha: 'ABC123'
    };

    await component.sendOtp();

    expect(otpService.sendOtp).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('OTP failed', 'danger');
    expect(component.disableBtn).toBeFalse();
  });

  it('generates a new six character captcha and clears the entered captcha', () => {
    component.loginForm.captcha = 'OLD';

    component.captchaGenerate();

    expect(component.loginForm.captcha).toBe('');
    expect(component.yourCaptcha.length).toBe(6);
  });

  it('login should proceed when text captcha is disabled and captcha is undefined', () => {
    spyOn(component, 'mainLogin');
    component.isTextCaptcha = false;
    component.loginForm = {
      username: 'creator',
      password: 'secret'
    } as any;

    component.login();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(component.mainLogin).toHaveBeenCalled();
  });

  it('opens forgot password modal', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });
    try {
      component.forgotPassword();
      expect(modalSpy).toHaveBeenCalledWith('show');
    } finally {
      (window as any).$ = old$;
    }
  });

  it('onPaste should not throw when preventDefault is available', () => {
    const event = { preventDefault: jasmine.createSpy('preventDefault') } as any;
    expect(() => component.onPaste(event)).not.toThrow();
  });
});

