import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class ReasonApiService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  get(config?: any) {
    return this.http.get<any>('reason/all', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(object: any) {
    return this.http.post<any>('reason/createOrUpdate', object).pipe(map((response: any) => this.parse(response)));
  }

  delete(config: any) {
    return this.http.delete<any>('reason', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
