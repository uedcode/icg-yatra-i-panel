import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root',
})
export class TyDutyPurposeService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  get(config?: any) {
    return this.http.get<any>(`tyDutyPurpose/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object: any) {
    return this.http.post<any>(`tyDutyPurpose/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(config: any) {
    return this.http.delete<any>(`tyDutyPurpose`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}

