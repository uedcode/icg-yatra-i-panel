import { HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
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
      getDeviceFingerprint: jasmine.createSpy('getDeviceFingerprint').and.returnValue('fp-1'),
      destroySession: jasmine.createSpy('destroySession'),
    };

    interceptor = new HeaderInterceptor(
      { showMessage: jasmine.createSpy('showMessage') } as any,
      { refreshToken: jasmine.createSpy('refreshToken') } as any,
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
});
