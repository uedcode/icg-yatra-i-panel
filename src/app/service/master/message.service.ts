import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  get(config?: any) {
    return this.http.get<any>(`utilMessage/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object: any) {
    return this.http.post<any>(`utilMessage/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(config: any) {
    return this.http.delete<any>(`utilMessage`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}

