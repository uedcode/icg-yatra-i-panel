import { AuthTokenService } from 'src/app/service/authToken.service';
import { AuthService } from 'src/app/service/auth.service';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, switchMap, catchError, filter, take, mapTo } from 'rxjs/operators';
import { CommonService } from 'src/app/service/common.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private $common: CommonService, public AuthTokenService: AuthTokenService, public $auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    try {

      let isAuthAPI = false;
      let isServiceAPI = false;
      let isWebAPI = false;
      let is3rdPartyAPI = false;

      if (req.url.includes('oauth') || req.url.includes('portal') || req.url.includes('sso')) {
        isAuthAPI = true;
      } else if (req.url.includes('service')) {
        isServiceAPI = true;
      } else if (req.url.includes('whatismyip')) {
        is3rdPartyAPI = true;
      } else {
        isWebAPI = true;
      }

      let userIdDetails = null;

      let commonEndpoint = '';
      if (isAuthAPI) {
        commonEndpoint = environment.baseApi;
      } else if (isServiceAPI) {
        commonEndpoint = environment.baseApi;
      } else if (isWebAPI) {
        commonEndpoint = environment.api;
        userIdDetails = this.$auth.getUserDetails();
      }
      let dummyrequest;
      if (isAuthAPI) {
        dummyrequest = req.clone({
          url: commonEndpoint + req.url,
          headers: req.headers
            //.set('Authorization', `Basic VVNFUl9DTElFTlRfQVBQOnBhc3N3b3Jk`) // APP
            .set('Authorization', `Basic VVNFUl9DTElFTlRfQVBQOnBhc3N3b3Jk`) // WEB
            .set(
              'Content-type',
              `application/x-www-form-urlencoded;charset=utf-8`
            ),
        });
      } else if (isWebAPI) {
        const userToken = localStorage.getItem('pilotageAccessToken');
        const fingerPrint = localStorage.getItem('pilotageDeviceId');
        dummyrequest = req.clone({
          url: commonEndpoint + req.url,
          headers: req.headers
            .set('Authorization', `Bearer ${userToken}`)
            .set('logUserId', `${userIdDetails?.userId}`)
            .set('log_device_fingerprint', `${fingerPrint}`),
        });
      } else {
        dummyrequest = req.clone({
          url: commonEndpoint + req.url,
        });
      }
      return next.handle(dummyrequest).pipe(
        catchError(error => {
          if ((error instanceof HttpErrorResponse && (error.status === 406 || error.status === 408 || error.status === 417))) {
            this.$auth.destroySession("3");
          }
          if (error instanceof HttpErrorResponse && error.status === 401) {
            if (isAuthAPI) {
              if (dummyrequest.body.map.get('is_login') == "1") {
                this.$common.showMessage(
                  "That's not the right password or Username. Please try again.",
                  'danger'
                );
              } else if (dummyrequest.body.map.get('is_login') == "0") {
                this.$auth.destroySession("3");
              }
            } else {
              return this.handle401Error(dummyrequest, next);
            }
          } else {
            if (isAuthAPI) {
              this.$common.showMessage(error.error.error_description, 'danger');
            }
            return throwError(error);
          }
        }));
    } catch (error) {
      console.log(error);
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.AuthTokenService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access_token);
          return next.handle(this.addToken(request, token.access_token));
        }));

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }

}
