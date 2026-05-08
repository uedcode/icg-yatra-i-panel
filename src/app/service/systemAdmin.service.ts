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
    return this.http.get<any>(`role/all`, config).pipe(
      map((response: any) => {

        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getUnitAdminRoles(config) {
    return this.http.get<any>(`role/all`, config).pipe(
      map((response: any) => {

        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object) {
    const formData = new FormData();
    formData.append('aclRoleDTO', JSON.stringify(object));
    return this.http.post<any>(`role/createOrUpdate`, formData).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.delete<any>(`role`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changeStatus(config) {
    return this.http.put<any>(`role/changeStatus`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getForwardTo(config) {
    return this.http.get<any>(`role/byUser`, config).pipe(
      map((response: any) => {

        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}

