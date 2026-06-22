import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { UserTokenApiService } from 'src/app/service/api/security/user-token-api.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let commonService: jasmine.SpyObj<CommonService>;
  let userTokenService: jasmine.SpyObj<UserTokenApiService>;
  let router: jasmine.SpyObj<Router>;

  const storageKeys = environment.authConfig.storageKeys;
  const legacyStorageKeys = {
    accessToken: 'pilotageAccessToken',
    refreshToken: 'pilotageRefreshToken',
    expiresIn: 'pilotageExpiresIn',
    accessCount: 'pilotageAccessCount',
    userDetails: 'pilotageUserDetails',
    deviceId: 'pilotageDeviceId',
  };

  const sessionPayload = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: '3600',
    userId: 'U1',
    unitId: 'UNIT1',
    unitName: 'Unit 1',
    roleId: 'R1',
    roleTypeId: 'CR',
    desigId: 'D1',
    roleName: 'Creator',
    personName: 'Test User',
    formId: 'FORM1',
    moduleId: 'MOD1',
    formName: 'Form 1',
    cadre: 'GD',
    isSign: 'Y',
  };

  const makeJwt = (payload: any): string => {
    const base64Url = (value: any) =>
      btoa(JSON.stringify(value))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
    return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url(payload)}.`;
  };

  const toRouteSafeBase64 = (value: string) =>
    btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  beforeEach(() => {
    spyOn(console, 'log');

    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'hideLoader',
      'parseResponse',
      'showLoader',
      'showMessage',
    ]);
    commonService.parseResponse.and.callFake((response: any) => response);

    userTokenService = jasmine.createSpyObj<UserTokenApiService>(
      'UserTokenApiService',
      ['userTokenDelete', 'userTokenUpdate']
    );
    userTokenService.userTokenDelete.and.returnValue(of({ status: true }));
    userTokenService.userTokenUpdate.and.returnValue(of({ status: true }));

    router = jasmine.createSpyObj<Router>('Router', [
      'createUrlTree',
      'navigateByUrl',
      'serializeUrl',
    ]);
    router.createUrlTree.and.callFake((commands: readonly any[]) => commands as any);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));
    router.serializeUrl.and.callFake((commands: any) => commands.join('/'));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        DatePipe,
        { provide: CommonService, useValue: commonService },
        { provide: UserTokenApiService, useValue: userTokenService },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('should post login credentials to oauth token and parse the response', () => {
    const params = new HttpParams()
      .set('username', 'creator')
      .set('password', 'secret');
    const expectedResponse = { access_token: 'access-token' };
    let actualResponse: any;

    service.login(params).subscribe((response) => {
      actualResponse = response;
    });

    const request = httpMock.expectOne('oauth/token');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(params);
    request.flush(expectedResponse);

    expect(commonService.parseResponse).toHaveBeenCalledWith(expectedResponse);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should refresh tokens through the same oauth token endpoint', () => {
    const params = new HttpParams().set('grant_type', 'refresh_token');
    const expectedResponse = { refresh_token: 'new-refresh-token' };

    service.refresh(params).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const request = httpMock.expectOne('oauth/token');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(params);
    request.flush(expectedResponse);
    expect(commonService.parseResponse).toHaveBeenCalledWith(expectedResponse);
  });

  it('should read config response object from config/get', () => {
    const config = { headers: { userId: 'U1' } };
    const expectedObject = { sessionTimeout: 30 };

    service.get(config).subscribe((response) => {
      expect(response).toEqual(expectedObject);
    });

    const request = httpMock.expectOne('config/get');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('userId')).toBe('U1');
    request.flush({ status: true, object: expectedObject });
  });

  it('should store new and legacy session keys and route creator login to dashboard', () => {
    service.createSession(sessionPayload, 'LOGIN');

    expect(localStorage.getItem(storageKeys.accessToken)).toBe('access-token');
    expect(localStorage.getItem(storageKeys.refreshToken)).toBe('refresh-token');
    expect(localStorage.getItem(storageKeys.expiresIn)).toBe('3600');
    expect(localStorage.getItem(storageKeys.accessCount)).toBe('0');
    expect(localStorage.getItem(storageKeys.isDashboard)).toBe('1');
    expect(localStorage.getItem(legacyStorageKeys.accessToken)).toBe(
      'access-token'
    );
    expect(localStorage.getItem(legacyStorageKeys.refreshToken)).toBe(
      'refresh-token'
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/creator/dashboard');

    const storedUser = service.getUserDetails();
    expect(storedUser).toEqual(
      jasmine.objectContaining({
        userId: 'U1',
        roleTypeId: 'CR',
        unitId: 'UNIT1',
        formId: 'FORM1',
      })
    );
  });

  it('should read tokens from legacy storage when new keys are absent', () => {
    localStorage.setItem(legacyStorageKeys.accessToken, 'legacy-access');
    localStorage.setItem(legacyStorageKeys.refreshToken, 'legacy-refresh');
    localStorage.setItem(legacyStorageKeys.deviceId, 'legacy-device');

    expect(service.getAccessToken()).toBe('legacy-access');
    expect(service.getRefreshToken()).toBe('legacy-refresh');
    expect(service.getDeviceFingerprint()).toBe('legacy-device');
    expect(service.getTokenDetails()).toEqual({
      accessToken: 'legacy-access',
      refreshToken: 'legacy-refresh',
    });
  });

  it('should parse stored user permissions from JSON text', () => {
    localStorage.setItem(
      storageKeys.userDetails,
      JSON.stringify([
        {
          userId: 'U1',
          roleTypeId: 'CR',
          userPermission: '{"claimCreate":true}',
        },
      ])
    );

    expect(service.getUserDetails()).toEqual(
      jasmine.objectContaining({
        userId: 'U1',
        userPermission: { claimCreate: true },
      })
    );
  });

  it('should update switched role details from refreshed JWT payload', () => {
    service.createSession(sessionPayload, 'NONE');
    router.navigateByUrl.calls.reset();

    const switchedToken = makeJwt({
      userId: 'U1',
      unitId: 'UNIT1',
      roleId: 'ROLE-AP',
      roleTypeId: 'AP',
      roleName: 'Approver',
      personName: 'Test User',
      formId: 'FORM-AP',
      moduleId: 'ADV',
    });

    service.createSession(
      {
        access_token: switchedToken,
        refresh_token: 'refresh-token-2',
        expires_in: '3600',
      },
      'REFRESH'
    );

    const storedUser = service.getUserDetails();
    expect(storedUser).toEqual(
      jasmine.objectContaining({
        roleId: 'ROLE-AP',
        roleTypeId: 'AP',
        roleName: 'Approver',
        formId: 'FORM-AP',
      })
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/approver/dashboard');
  });

  it('should resolve module names for active Yatra roles', () => {
    const expectedModules = [
      ['SAD', '/super-admin'],
      ['SY', '/system-admin'],
      ['UN', '/unit-admin'],
      ['CR', '/creator'],
      ['EX', '/executor'],
      ['VE1', '/approver'],
      ['VE2', '/approver'],
      ['AP', '/approver'],
      ['IHQAP', '/ihq-staff'],
    ];

    expectedModules.forEach(([roleTypeId, moduleName]) => {
      localStorage.setItem(
        storageKeys.userDetails,
        JSON.stringify([{ roleTypeId }])
      );
      expect(service.getModuleName()).toBe(moduleName);
    });
  });

  it('should build creator form edit URLs with form and sub-form ids', () => {
    service.createSession(sessionPayload, 'NONE');

    expect(
      service.getFormEditUrl({
        formId: 'FORM123',
        subFormId: 'PMT',
        formUrl: '/form-pmt-duty',
      })
    ).toBe('/creator/form-pmt-duty?id=FORM123&subFormId=PMT');
  });

  it('should return null when form edit URL is missing required data', () => {
    service.createSession(sessionPayload, 'NONE');

    expect(service.getFormEditUrl({ formId: 'FORM123' })).toBeNull();
    expect(service.getFormEditUrl({ formUrl: 'form-pmt-duty' })).toBeNull();
  });

  it('should build approver action form URLs without browser claimId', () => {
    service.createSession(
      { ...sessionPayload, roleTypeId: 'AP', roleName: 'Approver' },
      'NONE'
    );

    const url = service.getApproverActionFormUrl(
      {
        yatClaimDTO: {
          claimId: 'CLAIM1',
          codeSubFormDTO: {
            subFormId: 'PMT',
            formUrl: '/form-pmt-duty',
          },
        },
      },
      'IB'
    );

    expect(url).toBe(
      '/approver/form-pmt-duty?id=CLAIM1&subFormId=PMT&statusId=IB&actionable=1'
    );
  });

  it('should build approver preview URLs from direct legacy viewUrl', () => {
    service.createSession(
      { ...sessionPayload, roleTypeId: 'VE1', roleName: 'Verifier' },
      'NONE'
    );

    const url = service.getApproverPreviewUrl(
      {
        yatClaimDTO: {
          claimId: 'CLAIM1',
          codeSubFormDTO: {
            subFormId: 'LTC',
            viewUrl: '/preview-ltc-claim',
          },
        },
      },
    );

    expect(url).toBe('/approver/preview-ltc-claim?id=CLAIM1');
  });

  it('should create user token update headers from login response data', async () => {
    await service.updateUserToken({
      userId: 'U1',
      access_token: 'access-token',
    });

    expect(userTokenService.userTokenUpdate).toHaveBeenCalledWith({
      headers: {
        userId: 'U1',
        token: 'access-token',
        type: 'WEB',
      },
    });
  });

  it('should create user token delete headers from the stored access token', async () => {
    localStorage.setItem(storageKeys.accessToken, 'access-token');

    await service.deleteUserToken();

    expect(userTokenService.userTokenDelete).toHaveBeenCalledWith({
      headers: {
        ids: 'access-token',
        type: 'WEB',
      },
    });
  });

  it('should show API errors from user token update failures', async () => {
    userTokenService.userTokenUpdate.and.returnValue(
      throwError(() => ({
        error: { error_description: 'token update failed' },
      }))
    );

    await service.updateUserToken({
      userId: 'U1',
      access_token: 'access-token',
    });

    expect(commonService.showMessage).toHaveBeenCalledWith(
      'token update failed',
      'danger'
    );
  });

  it('should map known status ids to badge classes', () => {
    expect(service.setStatusColor({ id: 'SU' })).toBe('badge-success');
    expect(service.setStatusColor({ id: 'PE' })).toBe('badge-dark');
    expect(service.setStatusColor({ id: 'PRO' })).toBe('badge-warning');
    expect(service.setStatusColor({ id: 'RJ' })).toBe('badge-danger');
    expect(service.setStatusColorRow({ id: 'NA' })).toBe('strikeout');
  });

  it('should map role type ids to role names', () => {
    expect(service.setRoleName('SAD')).toBe('Super Admin');
    expect(service.setRoleName('SY')).toBe('System Admin');
    expect(service.setRoleName('UN')).toBe('Unit Admin');
    expect(service.setRoleName('CR')).toBe('Creator');
    expect(service.setRoleName('EX')).toBe('Executor');
    expect(service.setRoleName('AP')).toBe('Approver');
    expect(service.setRoleName('UNKNOWN')).toBe('-');
  });

  it('should resolve runtime module id from URL path tokens', () => {
    expect(service.getRuntimeModuleId('/claim/creator/dashboard')).toBe('CLM');
    expect(service.getRuntimeModuleId('/adv/creator/dashboard')).toBe('ADV');
    expect(service.getRuntimeModuleId('/creator/dashboard')).toBe('ADV');
  });

  it('should enable module features based on runtime module context', () => {
    spyOn(service, 'getRuntimeModuleId').and.returnValue('ADV');
    expect(service.enableFeatures('ADV')).toBeTrue();
    expect(service.enableFeatures('CLM')).toBeFalse();
    expect(service.enableFeatures('COM')).toBeTrue();
  });

  it('should store and read refreshed tokens from active module scoped storage', () => {
    const moduleStorageKeys = environment.authConfig.moduleStorageKeys.ADV;
    spyOn(service, 'getRuntimeModuleId').and.returnValue('ADV');

    service.createSession(
      {
        access_token: 'adv-access-token',
        refresh_token: 'adv-refresh-token',
        expires_in: '1800',
      },
      'NONE'
    );

    expect(localStorage.getItem(moduleStorageKeys.accessToken)).toBe('adv-access-token');
    expect(localStorage.getItem(moduleStorageKeys.refreshToken)).toBe('adv-refresh-token');
    expect(service.getAccessToken()).toBe('adv-access-token');
    expect(service.getRefreshToken()).toBe('adv-refresh-token');
  });

  it('should build form details payload from stored creator user context', () => {
    service.createSession(sessionPayload, 'NONE');

    expect(service.getFormDetails('PMT', 'SUBMIT')).toEqual({
      codeSubFormDTO: { subFormId: 'PMT' },
      aclUserDTO: { userId: 'U1' },
      codeUnitDTO: { unit: 'UNIT1' },
      formStateInputDTO: {
        roleTypeId: 'CR',
        status: 'SUBMIT',
        unitId: 'UNIT1',
        desigId: 'D1',
        remark: 'Submit',
        codeFormId: 'FORM1',
      },
    });
  });

  it('should format entry dates and operation labels for movement display', () => {
    expect(service.formatEntryDate(new Date(2026, 0, 2), '0930')).toBe(
      '020930/Jan 26'
    );
    expect(service.formatOperation('Approved', '1015')).toBe(
      '<br> <b>(Approved - 1015 Hrs)</b>'
    );
    expect(service.formatOperation('', '1015')).toBe('');
  });

  it('should open creator advance file viewer inside active ADV shell route', () => {
    service.createSession(sessionPayload, 'NONE');
    spyOn(Date, 'now').and.returnValue(1782115442078);
    spyOn(window, 'open');
    window.history.pushState({}, '', '/adv/creator/form-ty-duty');

    service.viewFile('/claim/178/support_doc/file.pdf');

    const expectedUrl = `${environment.fileUrl.replace(/\/$/, '')}/claim/178/support_doc/file.pdf?t=1782115442078`;
    expect(window.open).toHaveBeenCalledWith(
      `/adv/creator/view-file/${toRouteSafeBase64(expectedUrl)}`,
      '_blank'
    );
  });

  it('should open creator claim file viewer inside active CLM shell route', () => {
    service.createSession(sessionPayload, 'NONE');
    spyOn(Date, 'now').and.returnValue(1782115442078);
    spyOn(window, 'open');
    window.history.pushState({}, '', '/claim/creator/preview-ty-duty-claim');

    service.viewFile('claim/178/support_doc/file.pdf');

    const expectedUrl = `${environment.fileUrl.replace(/\/$/, '')}/claim/178/support_doc/file.pdf?t=1782115442078`;
    expect(window.open).toHaveBeenCalledWith(
      `/claim/creator/view-file/${toRouteSafeBase64(expectedUrl)}`,
      '_blank'
    );
  });

  it('should open approver advance file viewer inside active ADV shell route', () => {
    service.createSession(
      { ...sessionPayload, roleTypeId: 'AP', roleName: 'Approver' },
      'NONE'
    );
    spyOn(Date, 'now').and.returnValue(1782115442078);
    spyOn(window, 'open');
    window.history.pushState({}, '', '/adv/approver/form-ty-duty');

    service.viewFile('/claim/178/support_doc/file.pdf');

    const expectedUrl = `${environment.fileUrl.replace(/\/$/, '')}/claim/178/support_doc/file.pdf?t=1782115442078`;
    expect(window.open).toHaveBeenCalledWith(
      `/adv/approver/view-file/${toRouteSafeBase64(expectedUrl)}`,
      '_blank'
    );
  });

  it('should open approver claim file viewer inside active CLM shell route', () => {
    service.createSession(
      { ...sessionPayload, roleTypeId: 'VE1', roleName: 'Verifier' },
      'NONE'
    );
    spyOn(Date, 'now').and.returnValue(1782115442078);
    spyOn(window, 'open');
    window.history.pushState({}, '', '/claim/approver/preview-ty-duty-claim');

    service.viewFile('/claim/178/support_doc/file.pdf');

    const expectedUrl = `${environment.fileUrl.replace(/\/$/, '')}/claim/178/support_doc/file.pdf?t=1782115442078`;
    expect(window.open).toHaveBeenCalledWith(
      `/claim/approver/view-file/${toRouteSafeBase64(expectedUrl)}`,
      '_blank'
    );
  });

  it('should show a message and not open viewer when file URL is empty', () => {
    spyOn(window, 'open');

    service.viewFile('');

    expect(commonService.showMessage).toHaveBeenCalledWith(
      'File URL is not available.',
      'danger'
    );
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should identify null, empty, and string-null values as empty', () => {
    expect(service.isNullOrEmpty(undefined)).toBeTrue();
    expect(service.isNullOrEmpty(null)).toBeTrue();
    expect(service.isNullOrEmpty('')).toBeTrue();
    expect(service.isNullOrEmpty('null')).toBeTrue();
    expect(service.isNullOrEmpty('value')).toBeFalse();
  });
});

