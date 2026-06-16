import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { SsoLoginComponent } from './sso-login.component';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';

describe('SsoLoginComponent', () => {
  let component: SsoLoginComponent;
  let fixture: ComponentFixture<SsoLoginComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'ssoLogin',
      'login',
      'createSession',
      'getUserDetails',
      'getModuleName',
      'getRuntimeModuleId'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    authService.ssoLogin.and.returnValue(
      of({ status: true, object: { username: 'sso-user', password: 'sso-pass' } }) as any
    );
    authService.login.and.returnValue(of({ access_token: 'token-1' }) as any);
    authService.getUserDetails.and.returnValue(null);
    authService.getModuleName.and.returnValue('/approver');
    authService.getRuntimeModuleId.and.returnValue('ADV');

    await TestBed.configureTestingModule({
      declarations: [SsoLoginComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SsoLoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    history.replaceState({}, '', '/');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger getSsoJwtToken on init', () => {
    spyOn(component, 'getSsoJwtToken');
    component.ngOnInit();
    expect(component.getSsoJwtToken).toHaveBeenCalled();
  });

  it('should call ssoLogin and then login when jwtToken exists and status is true', () => {
    history.replaceState({}, '', '/?jwtToken=jwt-123');
    spyOn(component, 'login');

    component.getSsoJwtToken();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(authService.ssoLogin).toHaveBeenCalledWith({
      headers: { jwtToken: 'jwt-123' }
    });
    expect(component.ssoResponse).toEqual({ username: 'sso-user', password: 'sso-pass' } as any);
    expect(component.login).toHaveBeenCalled();
  });

  it('should not call login when ssoLogin returns status false', () => {
    history.replaceState({}, '', '/?jwtToken=jwt-123');
    authService.ssoLogin.and.returnValue(of({ status: false, object: {} }) as any);
    spyOn(component, 'login');

    component.getSsoJwtToken();

    expect(component.login).not.toHaveBeenCalled();
    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('should show API error when ssoLogin fails', () => {
    history.replaceState({}, '', '/?jwtToken=jwt-123');
    authService.ssoLogin.and.returnValue(
      throwError(() => ({ status: 401, statusText: 'Unauthorized' })) as any
    );

    component.getSsoJwtToken();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(commonService.showMessage).toHaveBeenCalledWith('401 : Unauthorized');
  });

  it('should hide loader and log when jwtToken is missing in URL', () => {
    history.replaceState({}, '', '/');
    spyOn(console, 'error');

    component.getSsoJwtToken();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('JWT Token is missing from URL');
    expect(authService.ssoLogin).not.toHaveBeenCalled();
  });

  it('should call auth login and create session in login()', () => {
    component.ssoResponse = { username: 'sso-user', password: 'sso-pass' };

    component.login();

    expect(authService.login).toHaveBeenCalled();
    const params = authService.login.calls.mostRecent().args[0] as HttpParams;
    const usernameParam = params.get('username') || '';
    expect(usernameParam.startsWith('sso-user---sso-pass---')).toBeTrue();
    const usernameParts = usernameParam.split('---');
    expect(usernameParts.length).toBe(3);
    expect(usernameParts[2]).toBe('ADV');
    expect(params.get('password')).toBe('sso-pass');
    expect(params.get('grant_type')).toBe('password');
    expect(params.get('is_login')).toBe('1');
    expect(authService.createSession).toHaveBeenCalledWith({ access_token: 'token-1' } as any, 'LOGIN');
  });

  it('should handle login API failure path gracefully', () => {
    component.ssoResponse = { username: 'sso-user', password: 'sso-pass' };
    spyOn(console, 'log');
    authService.login.and.returnValue(
      throwError(() => ({ status: 401, error: { error_description: 'Bad credentials' } })) as any
    );

    component.login();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should navigate to dashboard in checkSession when user details exist', () => {
    authService.getUserDetails.and.returnValue({ userId: 'U1' } as any);
    authService.getModuleName.and.returnValue('/approver');

    component.checkSession();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/approver/dashboard');
  });

  it('should not navigate in checkSession when user details are null', () => {
    authService.getUserDetails.and.returnValue(null);

    component.checkSession();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

