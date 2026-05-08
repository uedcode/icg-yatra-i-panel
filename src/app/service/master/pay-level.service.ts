import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root',
})
export class PayLevelService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  get(config?: any) {
    return this.http.get<any>(`payLevel/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object: any) {
    return this.http.post<any>(`payLevel/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}

