import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class MarkTyApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getPnoList(config: any) {
    return this.http.get<any>('markTy/getPnoList', config).pipe(map((response: any) => this.parse(response)));
  }

  getAllMarkedTyDuty(config: any) {
    return this.http.get<any>('markTy/all', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdateMarkedTyDuty(object: any) {
    return this.http.post<any>('markTy/createOrUpdate', object).pipe(map((response: any) => this.parse(response)));
  }

  changeMarkedTyDutyFlag(config: any) {
    return this.http.put<any>('markTy/changeFlag', null, config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
