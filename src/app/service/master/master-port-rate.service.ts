import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class MasterPortRateService {

  constructor(private $common: CommonService, private http: HttpClient) { }
  
  get(config) {   
    return this.http.get<any>(`masterPortRate/all`,config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object) {
    return this.http.post<any>(`masterPortRate/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.get<any>(`masterPortRate/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }


}

