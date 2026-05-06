import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(private $common: CommonService, private http: HttpClient) { }
  
  get(config) {   
    return this.http.get<any>(`utilHoliday/all`,config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(catObj) {
    return this.http.post<any>(`utilHoliday/createOrUpdate`, catObj).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.get<any>(`utilHoliday/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }


}
