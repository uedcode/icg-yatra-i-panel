import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { OtpService } from 'src/app/service/otp.service';
import { SecurityService } from 'src/app/service/security.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let otpService: jasmine.SpyObj<OtpService>;
  let router: jasmine.SpyObj<Router>;

  const createComponent = () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'createSession',
      'getModuleName',
      'getUserDetails',
      'login'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'getClientIp',
      'hideLoader',
      'showLoader',
      'showMessage'
    ]);
    otpService = jasmine.createSpyObj<OtpService>('OtpService', ['sendOtp']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    authService.getUserDetails.and.returnValue(null);
    authService.getModuleName.and.returnValue('/creator');
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    return TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: OtpService, useValue: otpService },
        { provide: Router, useValue: router },
        { provide: SecurityService, useValue: {} }
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

  it('redirects an existing session to the role dashboard', () => {
    authService.getUserDetails.and.returnValue({ userId: 'U1', roleTypeId: 'CR' });
    authService.getModuleName.and.returnValue('/creator');

    component.checkSession();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/creator/dashboard');
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
    component.isRecaptcha = false;
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
    expect(params.get('username')?.split('---').length).toBe(3);
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

  it('generates a new six character captcha and clears the entered captcha', () => {
    component.loginForm.captcha = 'OLD';

    component.captchaGenerate();

    expect(component.loginForm.captcha).toBe('');
    expect(component.yourCaptcha.length).toBe(6);
  });
});
