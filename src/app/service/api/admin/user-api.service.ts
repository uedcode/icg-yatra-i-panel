import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

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

  roleSwitch(config) {
    return this.http.put<any>(`user/roleSwitch`, {}, config).pipe(
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

  getAll(config) {
    return this.http.get<any>(`user/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getSingle(config) {
    return this.http.get<any>(`user/single`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
