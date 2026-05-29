import { Tokens } from './../model/tokens';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, Observable, config } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthTokenService {

    private readonly storageKeys = environment.authConfig.storageKeys;
    private readonly JWT_TOKEN = this.storageKeys.accessToken;
    private readonly REFRESH_TOKEN = this.storageKeys.refreshToken;
    private loggedUser: string;

    constructor(private http: HttpClient) { }

    login(user: { username: string, password: string }): Observable<boolean> {
        return this.http.post<any>(`oauth/token`, user)
            .pipe(
                tap(tokens => this.doLoginUser(user.username, tokens)),
                mapTo(true),
                catchError(error => {
                    alert(error.error);
                    return of(false);
                }));
    }

    logout() {
        return this.http.post<any>(`logout`, {
            'refreshToken': this.getRefreshToken()
        }).pipe(
            tap(() => this.doLogoutUser()),
            mapTo(true),
            catchError(error => {
                alert(error.error);
                return of(false);
            }));
    }

    isLoggedIn() {
        return !!this.getJwtToken();
    }

    refreshToken() {

        var params = new HttpParams();
        params = params.append('refresh_token', this.getRefreshToken());
        params = params.append('grant_type', 'refresh_token');
        params = params.append('is_login', '0');
    
        return this.http.post<any>(`oauth/token`, params, 
        ).pipe(tap((tokens: Tokens) => {
            this.storeTokens(tokens);

            // $rootScope.updateUserToken($rootScope.userId,r.data.access_token,response,$injector,deferred);
        }));
    }

    getJwtToken() {
        return localStorage.getItem(this.JWT_TOKEN);
    }

    private doLoginUser(username: string, tokens: Tokens) {
        this.loggedUser = username;
        this.storeTokens(tokens);
    }

    private doLogoutUser() {
        this.loggedUser = null;
        this.removeTokens();
    }

    private getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN);
    }

    private storeTokens(tokens: Tokens) {
        localStorage.setItem(this.JWT_TOKEN, tokens.access_token);
        localStorage.setItem(this.REFRESH_TOKEN, tokens.refresh_token);
    }

    private removeTokens() {
        localStorage.removeItem(this.JWT_TOKEN);
        localStorage.removeItem(this.REFRESH_TOKEN);
    }
}
