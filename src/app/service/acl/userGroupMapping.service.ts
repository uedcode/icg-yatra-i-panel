import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/common.service';

@Injectable({
  providedIn: 'root'
})
export class UserGroupMappingService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  createOrUpdate(object) {
    return this.http.post<any>(`userGroupMapping/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getAll(config) {
    return this.http.get<any>(`userGroupMapping/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changeStatus(config) {
    return this.http.put<any>(`userGroupMapping/statusById`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.get<any>(`userGroupMapping/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}
