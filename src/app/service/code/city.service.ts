import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/common.service';

@Injectable({
  providedIn: 'root'
})
export class CityService {


  constructor(private http: HttpClient, private $common: CommonService) { }

  getAll(config) {
    return this.http.get<any>(`city/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  sync(config) {
    return this.http.get<any>(`city/sync`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}
