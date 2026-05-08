import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/common.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  changePassword(config) {
    return this.http.post<any>(`user/changePassword`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  resetPassword(body) {
    return this.http.post<any>(`user/resetPassword`, body).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  roles(config) {
    return this.http.get<any>(`role/byUser`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  rolesById(config) {
    return this.http.get<any>(`role/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  roleSwitch(config) {
    return this.http.post<any>(`user/roleSwitchPil`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  moduleSwitch(config) {
    return this.http.post<any>(`user/moduleSwitch`,null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getUserByPno(config) {
    return this.http.post<any>(`user/getUserByPno`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
