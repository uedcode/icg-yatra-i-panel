import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class UpdatePmtApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAllUnits(config: any) {
    return this.http.get<any>('updatePmt/allUnits', config).pipe(map((response: any) => this.parse(response)));
  }

  getAllRecords(config: any) {
    return this.http.get<any>('updatePmt/all', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(object: any) {
    return this.http.post<any>('updatePmt/createOrUpdate', object).pipe(map((response: any) => this.parse(response)));
  }

  changeFlag(config: any) {
    return this.http.put<any>('updatePmt/changeFLag', null, config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
