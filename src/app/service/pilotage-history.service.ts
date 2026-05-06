import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PilotageHistoryService {

  constructor(private http: HttpClient, private $common: CommonService) { }
  get(config) {   
    return this.http.get<any>(`pilotageHistory/all`,config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object) {
    return this.http.post<any>(`pilotageHistory/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.get<any>(`pilotageHistory/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changeStatusById(config) {   
    return this.http.get<any>(`pilotageHistory/changeStatusById`,config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getHistory(config) {   
    return this.http.get<any>(`pilotageHistory/getHistory`,config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  permissionCreate(config) {   
    return this.http.get<any>(`pilotageHistory/permissionCreate`,config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
