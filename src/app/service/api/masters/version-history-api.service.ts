import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class VersionHistoryApiService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  get(config?: any) {
    return this.http.get<any>('versionHistory/all', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(object: any) {
    return this.http.post<any>('versionHistory/createOrUpdate', object).pipe(map((response: any) => this.parse(response)));
  }

  delete(ids: any) {
    return this.http.delete<any>('versionHistory', ids).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
