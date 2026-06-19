import { HttpErrorResponse, HttpHandler, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { HeaderInterceptor } from './HeaderInterceptor';
import { environment } from 'src/environments/environment';

describe('HeaderInterceptor', () => {
  let interceptor: HeaderInterceptor;
  let authService: any;
  let next: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    authService = {
      getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue({ userId: 'U-1' }),
      getAccessToken: jasmine.createSpy('getAccessToken').and.returnValue('token-1'),
      getRefreshToken: jasmine.createSpy('getRefreshToken').and.returnValue('refresh-1'),
      getDeviceFingerprint: jasmine.createSpy('getDeviceFingerprint').and.returnValue('fp-1'),
      refresh: jasmine.createSpy('refresh').and.returnValue(of({ access_token: 'token-2', refresh_token: 'refresh-2' })),
      createSession: jasmine.createSpy('createSession'),
      destroySession: jasmine.createSpy('destroySession'),
    };

    interceptor = new HeaderInterceptor(
      { showMessage: jasmine.createSpy('showMessage') } as any,
      authService
    );

    next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    next.handle.and.returnValue(of(new HttpResponse({ status: 200 })));
  });

  it('routes codeMisc APIs through legacy baseApi without webapi and keeps auth headers', () => {
    const request = new HttpRequest('GET', 'codeMisc/pieChartData', {
      headers: new HttpHeaders(),
    });

    interceptor.intercept(request, next).subscribe();

    const handledRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(handledRequest.url).toBe(`${environment.baseApi}codeMisc/pieChartData`);
    expect(handledRequest.headers.get('Authorization')).toBe('Bearer token-1');
    expect(handledRequest.headers.get('logUserId')).toBe('U-1');
    expect(handledRequest.headers.get('log_device_fingerprint')).toBe('fp-1');
  });

  it('routes other codeMisc APIs through legacy baseApi', () => {
    ['codeMisc/viewReport', 'codeMisc/getAll', 'codeMisc/getDeputationStatus'].forEach(url => {
      const request = new HttpRequest('GET', url);

      interceptor.intercept(request, next).subscribe();

      const handledRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
      expect(handledRequest.url).toBe(`${environment.baseApi}${url}`);
    });
  });

  it('routes utilPno APIs through legacy baseApi', () => {
    const request = new HttpRequest('GET', 'utilPno/updatePno');

    interceptor.intercept(request, next).subscribe();

    const handledRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(handledRequest.url).toBe(`${environment.baseApi}utilPno/updatePno`);
  });

  it('keeps normal business APIs on webapi', () => {
    ['claimState/esignReportData', 'codeUnit/gxUnit', 'claim/all', 'role/all'].forEach(url => {
      const request = new HttpRequest('GET', url);

      interceptor.intercept(request, next).subscribe();

      const handledRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
      expect(handledRequest.url).toBe(`${environment.api}${url}`);
    });
  });

  it('keeps auth and service APIs on baseApi', () => {
    const oauthRequest = new HttpRequest('POST', 'oauth/token', new FormData());
    const serviceRequest = new HttpRequest('POST', 'service/otp/sendOtp', {});

    interceptor.intercept(oauthRequest, next).subscribe();
    expect((next.handle.calls.mostRecent().args[0] as HttpRequest<any>).url).toBe(`${environment.baseApi}oauth/token`);

    interceptor.intercept(serviceRequest, next).subscribe();
    expect((next.handle.calls.mostRecent().args[0] as HttpRequest<any>).url).toBe(`${environment.baseApi}service/otp/sendOtp`);
  });

  it('does not double-prefix absolute urls', () => {
    const request = new HttpRequest('GET', `${environment.baseApi}codeMisc/pieChartData`);

    interceptor.intercept(request, next).subscribe();

    const handledRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(handledRequest.url).toBe(`${environment.baseApi}codeMisc/pieChartData`);
  });

  it('refreshes token on protected API 401 and retries with the new access token', () => {
    const request = new HttpRequest('GET', 'claim/all');
    next.handle.and.returnValues(
      throwError(() => new HttpErrorResponse({ status: 401 })),
      of(new HttpResponse({ status: 200 }))
    );

    interceptor.intercept(request, next).subscribe();

    expect(authService.refresh).toHaveBeenCalled();
    const refreshParams = authService.refresh.calls.mostRecent().args[0] as HttpParams;
    expect(refreshParams.get('grant_type')).toBe('refresh_token');
    expect(refreshParams.get('refresh_token')).toBe('refresh-1');
    expect(authService.createSession).toHaveBeenCalledWith(
      { access_token: 'token-2', refresh_token: 'refresh-2' },
      'NONE'
    );
    const retriedRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(retriedRequest.headers.get('Authorization')).toBe('Bearer token-2');
    expect(retriedRequest.headers.get('logUserId')).toBe('U-1');
    expect(retriedRequest.headers.get('log_device_fingerprint')).toBe('fp-1');
  });

  it('uses one refresh call for concurrent protected API 401 responses', () => {
    const refresh$ = new Subject<any>();
    authService.refresh.and.returnValue(refresh$);
    let handleCount = 0;
    next.handle.and.callFake(() => {
      handleCount++;
      return handleCount <= 2
        ? throwError(() => new HttpErrorResponse({ status: 401 }))
        : of(new HttpResponse({ status: 200 }));
    });

    interceptor.intercept(new HttpRequest('GET', 'claim/all'), next).subscribe();
    interceptor.intercept(new HttpRequest('GET', 'role/all'), next).subscribe();

    expect(authService.refresh).toHaveBeenCalledTimes(1);

    refresh$.next({ access_token: 'token-3', refresh_token: 'refresh-3' });
    refresh$.complete();

    expect(next.handle).toHaveBeenCalledTimes(4);
    const firstRetry = next.handle.calls.argsFor(2)[0] as HttpRequest<any>;
    const secondRetry = next.handle.calls.argsFor(3)[0] as HttpRequest<any>;
    expect(firstRetry.headers.get('Authorization')).toBe('Bearer token-3');
    expect(secondRetry.headers.get('Authorization')).toBe('Bearer token-3');
  });

  it('logs out when refresh token request fails and does not retry the original request', () => {
    const request = new HttpRequest('GET', 'claim/all');
    next.handle.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    authService.refresh.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400 })));

    interceptor.intercept(request, next).subscribe({
      error: () => undefined,
    });

    expect(authService.destroySession).toHaveBeenCalledWith('3');
    expect(next.handle).toHaveBeenCalledTimes(1);
    expect((interceptor as any).isRefreshing).toBeFalse();
  });

  it('logs out when refresh response has no access token', () => {
    const request = new HttpRequest('GET', 'claim/all');
    next.handle.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    authService.refresh.and.returnValue(of({ refresh_token: 'refresh-2' }));

    interceptor.intercept(request, next).subscribe({
      error: () => undefined,
    });

    expect(authService.destroySession).toHaveBeenCalledWith('3');
    expect(authService.createSession).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(1);
  });

  it('does not enter refresh loop for oauth login 401 responses', () => {
    const body = new HttpParams().set('is_login', '1');
    const request = new HttpRequest('POST', 'oauth/token', body);
    next.handle.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

    interceptor.intercept(request, next).subscribe({
      error: () => undefined,
    });

    expect(authService.refresh).not.toHaveBeenCalled();
    expect(authService.destroySession).not.toHaveBeenCalled();
  });

  it('refreshes protected legacy baseApi calls on 401 too', () => {
    const request = new HttpRequest('GET', 'codeMisc/pieChartData');
    next.handle.and.returnValues(
      throwError(() => new HttpErrorResponse({ status: 401 })),
      of(new HttpResponse({ status: 200 }))
    );

    interceptor.intercept(request, next).subscribe();

    expect(authService.refresh).toHaveBeenCalledTimes(1);
    const retriedRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(retriedRequest.url).toBe(`${environment.baseApi}codeMisc/pieChartData`);
    expect(retriedRequest.headers.get('Authorization')).toBe('Bearer token-2');
  });
});
