import { AuthService } from 'src/app/service/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError, filter, take, finalize } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private hasHandledRefreshFailure = false;
  private readonly refreshFailedToken = '__YATRA_REFRESH_FAILED__';
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private readonly legacyBaseApiPrefixes = [
    'codeMisc',
    'utilPno',
    'faq',
    'versionHistory',
    'businessRule',
  ];

  constructor(private $common: CommonService, public $auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    try {

      let isAuthAPI = false;
      let isServiceAPI = false;
      let isWebAPI = false;
      let is3rdPartyAPI = false;
      let isLegacyBaseAPI = false;
      const relativeUrl = this.normalizeRelativeUrl(req.url);
      const isAbsoluteURL = this.isAbsoluteUrl(req.url);

      if (relativeUrl.includes('oauth') || relativeUrl.includes('portal') || relativeUrl.includes('sso')) {
        isAuthAPI = true;
      } else if (relativeUrl.includes('service')) {
        isServiceAPI = true;
      } else if (relativeUrl.includes('whatismyip')) {
        is3rdPartyAPI = true;
      } else if (this.isLegacyBaseApi(relativeUrl)) {
        isLegacyBaseAPI = true;
      } else {
        isWebAPI = true;
      }

      let userIdDetails = null;

      let commonEndpoint = '';
      if (isAuthAPI) {
        commonEndpoint = environment.baseApi;
      } else if (isServiceAPI) {
        commonEndpoint = environment.baseApi;
      } else if (isLegacyBaseAPI) {
        commonEndpoint = environment.baseApi;
        userIdDetails = this.$auth.getUserDetails();
      } else if (isWebAPI) {
        commonEndpoint = environment.api;
        userIdDetails = this.$auth.getUserDetails();
      }
      let dummyrequest;
      if (isAuthAPI) {
        const basicClientAuth = environment.authConfig?.basicClientAuth;
        if (!basicClientAuth) {
          return throwError(() => new Error('Missing auth client configuration'));
        }
        dummyrequest = req.clone({
          url: this.buildRequestUrl(commonEndpoint, relativeUrl, isAbsoluteURL, req.url),
          headers: req.headers
            .set('Authorization', basicClientAuth)
            .set(
              'Content-type',
              `application/x-www-form-urlencoded;charset=utf-8`
            ),
        });
      } else if (isWebAPI || isLegacyBaseAPI) {
        const userToken = this.$auth.getAccessToken();
        const fingerPrint = this.$auth.getDeviceFingerprint();
        dummyrequest = req.clone({
          url: this.buildRequestUrl(commonEndpoint, relativeUrl, isAbsoluteURL, req.url),
          headers: req.headers
            .set('Authorization', `Bearer ${userToken}`)
            .set('logUserId', `${userIdDetails?.userId}`)
            .set('log_device_fingerprint', `${fingerPrint}`),
        });
      } else {
        dummyrequest = req.clone({
          url: this.buildRequestUrl(commonEndpoint, relativeUrl, isAbsoluteURL, req.url),
        });
      }
      return next.handle(dummyrequest).pipe(
        catchError(error => {
          if ((error instanceof HttpErrorResponse && (error.status === 406 || error.status === 408 || error.status === 417))) {
            this.$auth.destroySession("3");
            return throwError(() => error);
          }
          if (error instanceof HttpErrorResponse && error.status === 401) {
            if (isAuthAPI) {
              const isLogin = this.getRequestBodyValue(dummyrequest.body, 'is_login');
              const grantType = this.getRequestBodyValue(dummyrequest.body, 'grant_type');
              if (grantType === 'refresh_token' || isLogin === "0") {
                this.handleRefreshFailure();
              } else if (isLogin == "1") {
                this.$common.showMessage(
                  "That's not the right password or Username. Please try again.",
                  'danger'
                );
              }
              return throwError(() => error);
            } else {
              return this.handle401Error(dummyrequest, next);
            }
          } else {
            if (isAuthAPI) {
              this.$common.showMessage(error.error.error_description, 'danger');
            }
            return throwError(() => error);
          }
        }));
    } catch (error) {
      console.log(error);
    }
  }

  private normalizeRelativeUrl(url: string): string {
    if (this.isAbsoluteUrl(url)) {
      try {
        const parsedUrl = new URL(url);
        return `${parsedUrl.pathname.replace(/^\/+/, '')}${parsedUrl.search}`;
      } catch (error) {
        return url.replace(/^\/+/, '');
      }
    }

    return url.replace(/^\/+/, '');
  }

  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  private isLegacyBaseApi(url: string): boolean {
    return this.legacyBaseApiPrefixes.some(prefix => url === prefix || url.startsWith(`${prefix}/`));
  }

  private buildRequestUrl(endpoint: string, relativeUrl: string, isAbsoluteURL: boolean, originalUrl: string): string {
    if (isAbsoluteURL) {
      return originalUrl;
    }

    return `${endpoint}${relativeUrl}`;
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private getRequestBodyValue(body: any, key: string): string | null {
    if (!body) {
      return null;
    }
    if (body instanceof HttpParams) {
      return body.get(key);
    }
    if (typeof body.get === 'function') {
      return body.get(key);
    }
    if (body.map && typeof body.map.get === 'function') {
      return body.map.get(key);
    }
    return body[key] ?? null;
  }

  private handleRefreshFailure(): void {
    if (this.hasHandledRefreshFailure) {
      return;
    }
    this.hasHandledRefreshFailure = true;
    this.$auth.destroySession("3");
  }

  private getRefreshAccessToken(response: any): string {
    return response?.access_token || response?.accessToken || response?.object?.access_token || response?.object?.accessToken || '';
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.$auth.getRefreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(this.refreshFailedToken);
        this.handleRefreshFailure();
        return throwError(() => new Error('Refresh token is not available.'));
      }

      let params = new HttpParams();
      params = params.append('refresh_token', refreshToken);
      params = params.append('grant_type', 'refresh_token');

      return this.$auth.refresh(params).pipe(
        catchError((error) => {
          this.refreshTokenSubject.next(this.refreshFailedToken);
          this.handleRefreshFailure();
          return throwError(() => error);
        }),
        switchMap((response: any) => {
          const accessToken = this.getRefreshAccessToken(response);
          if (!accessToken) {
            this.refreshTokenSubject.next(this.refreshFailedToken);
            this.handleRefreshFailure();
            return throwError(() => new Error('Refresh token response did not include an access token.'));
          }

          this.hasHandledRefreshFailure = false;
          this.$auth.createSession(response, 'NONE');
          this.refreshTokenSubject.next(accessToken);
          return next.handle(this.addToken(request, accessToken));
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          if (jwt === this.refreshFailedToken) {
            return throwError(() => new Error('Session expired while refreshing token.'));
          }
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }

}

