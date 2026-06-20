import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class TyDutyPurposeApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAll(config: any) {
    return this.http.get<any>('tyDutyPurpose/all', config).pipe(map((response: any) => this.parse(response)));
  }

  get(config?: any) {
    return this.getAll(config);
  }

  createOrUpdate(object: any) {
    return this.http.post<any>('tyDutyPurpose/createOrUpdate', object).pipe(map((response: any) => this.parse(response)));
  }

  delete(config: any) {
    return this.http.delete<any>('tyDutyPurpose', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
