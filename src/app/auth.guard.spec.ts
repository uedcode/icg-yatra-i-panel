import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthGuard } from './auth.guard';
import { AuthService } from './service/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  const storageKeys = environment.authConfig.storageKeys;

  const routeSnapshot = (
    path: string,
    roles?: string[]
  ): ActivatedRouteSnapshot =>
    ({
      routeConfig: { path },
      data: roles ? { roles } : {},
    }) as ActivatedRouteSnapshot;

  const routerState = (url: string): RouterStateSnapshot =>
    ({ url }) as RouterStateSnapshot;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'destroySession',
      'getModuleName',
      'getUserDetails',
    ]);

    authService.getModuleName.and.returnValue('/creator');
    authService.getUserDetails.and.returnValue({
      roleTypeId: 'CR',
    });

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to login route when no access token is stored', () => {
    const canActivate = guard.canActivate(
      routeSnapshot('dashboard'),
      routerState('/creator/dashboard')
    );

    expect(canActivate).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(authService.destroySession).not.toHaveBeenCalled();
  });

  it('should allow authenticated routes inside the active user module', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');
    authService.getModuleName.and.returnValue('/creator');

    const canActivate = guard.canActivate(
      routeSnapshot('form-request/inbox'),
      routerState('/creator/form-request/inbox')
    );

    expect(canActivate).toBeTrue();
    expect(authService.destroySession).not.toHaveBeenCalled();
  });

  it('should accept the legacy Pilotage access token key', () => {
    localStorage.setItem('pilotageAccessToken', 'legacy-access-token');
    authService.getModuleName.and.returnValue('/approver');
    authService.getUserDetails.and.returnValue({ roleTypeId: 'AP' });

    const canActivate = guard.canActivate(
      routeSnapshot('form-request/inbox'),
      routerState('/approver/form-request/inbox')
    );

    expect(canActivate).toBeTrue();
  });

  it('should allow shared authenticated utility routes outside role modules', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');

    const allowedUrls = [
      '/view-file',
      '/switch-module',
      '/new-device',
      '/common-profile-setting',
      '/common-new-device',
    ];

    allowedUrls.forEach((url) => {
      expect(guard.canActivate(routeSnapshot(url.slice(1)), routerState(url)))
        .withContext(url)
        .toBeTrue();
    });
    expect(authService.destroySession).not.toHaveBeenCalled();
  });

  it('should allow common authenticated page paths by route config', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');

    expect(
      guard.canActivate(routeSnapshot('dashboard'), routerState('/unexpected'))
    ).toBeTrue();
    expect(
      guard.canActivate(routeSnapshot('profile'), routerState('/unexpected'))
    ).toBeTrue();
    expect(
      guard.canActivate(
        routeSnapshot('change-password'),
        routerState('/unexpected')
      )
    ).toBeTrue();
  });

  it('should destroy the session when authenticated user navigates outside their module', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');
    authService.getModuleName.and.returnValue('/creator');

    const canActivate = guard.canActivate(
      routeSnapshot('manage-user'),
      routerState('/system-admin/manage-user')
    );

    expect(canActivate).toBeFalse();
    expect(authService.destroySession).toHaveBeenCalledWith('2');
  });

  it('should allow route data roles when current user role matches', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');
    authService.getUserDetails.and.returnValue({ roleTypeId: 'CR' });

    const canActivate = guard.canActivate(
      routeSnapshot('form-request/inbox', ['CR', 'AP']),
      routerState('/creator/form-request/inbox')
    );

    expect(canActivate).toBeTrue();
    expect(authService.destroySession).not.toHaveBeenCalled();
  });

  it('should reject route data roles when current user role does not match', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');
    authService.getUserDetails.and.returnValue({ roleTypeId: 'CR' });

    const canActivate = guard.canActivate(
      routeSnapshot('manage-user', ['SY']),
      routerState('/creator/manage-user')
    );

    expect(canActivate).toBeFalse();
    expect(authService.destroySession).toHaveBeenCalledWith('2');
  });

  it('should reject role-protected routes when user details are missing', () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');
    authService.getUserDetails.and.returnValue(null);

    const canActivate = guard.canActivate(
      routeSnapshot('manage-user', ['SY']),
      routerState('/system-admin/manage-user')
    );

    expect(canActivate).toBeFalse();
    expect(authService.destroySession).toHaveBeenCalledWith('2');
  });
});
