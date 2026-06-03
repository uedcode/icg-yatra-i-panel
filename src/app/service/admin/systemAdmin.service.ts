import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

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

  getUpdatePmtAllUnits(config) {
    return this.http.get<any>(`updatePmt/allUnits`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getUpdatePmtRecords(config) {
    return this.http.get<any>(`updatePmt/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdatePmtUnit(object) {
    return this.http.post<any>(`updatePmt/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changePmtFlag(config) {
    return this.http.put<any>(`updatePmt/changeFLag`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getPnoList(config) {
    return this.http.get<any>(`markTy/getPnoList`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getMarkedTyDuty(config) {
    return this.http.get<any>(`markTy/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createMarkedTyDuty(object) {
    return this.http.post<any>(`markTy/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changeMarkedTyDutyFlag(config) {
    return this.http.put<any>(`markTy/changeFlag`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getPayLevelTransactions(config) {
    return this.http.get<any>(`codehrpay/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdatePayLevelTransaction(object) {
    return this.http.post<any>(`codehrpay/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}


