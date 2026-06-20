import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class RoleApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAllRoles(config: any) {
    return this.http.get<any>('role/all', config).pipe(map((response: any) => this.parse(response)));
  }

  getRolesById(config: any) {
    return this.getAllRoles(config);
  }

  createOrUpdateRole(object: any) {
    const formData = object instanceof FormData ? object : new FormData();
    if (!(object instanceof FormData)) {
      formData.append('aclRoleDTO', JSON.stringify(object));
    }

    return this.http.post<any>('role/createOrUpdate', formData).pipe(map((response: any) => this.parse(response)));
  }

  deleteRoles(config: any) {
    return this.http.delete<any>('role', config).pipe(map((response: any) => this.parse(response)));
  }

  changeRoleStatus(config: any) {
    return this.http.put<any>('role/changeStatus', null, config).pipe(map((response: any) => this.parse(response)));
  }

  changeRoleArchiveStatus(config: any) {
    return this.http.put<any>('role/changeStatusArchive', null, config).pipe(map((response: any) => this.parse(response)));
  }

  getRolesByUser(config: any) {
    return this.http.get<any>('role/byUser', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
