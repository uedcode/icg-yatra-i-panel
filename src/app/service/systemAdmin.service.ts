import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminService {

  constructor(private $common: CommonService, private http: HttpClient) { }

  getAll(config) {
    return this.http.get<any>(`aclPilRole/all`, config).pipe(
      map((response: any) => {

        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getUnitAdminRoles(config) {
    return this.http.get<any>(`aclPilRole/getUnitAdminRoles`, config).pipe(
      map((response: any) => {

        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object) {
    return this.http.post<any>(`aclPilRole/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.get<any>(`aclPilRole/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changeStatus(config) {
    return this.http.post<any>(`aclPilRole/statusById`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getForwardTo(config) {
    return this.http.get<any>(`aclPilRole/getForwardTo`, config).pipe(
      map((response: any) => {

        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}

