import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class PortRateApiService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  get(config) {
    return this.http.get<any>(`portRate/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(object) {
    return this.http.post<any>(`portRate/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(config) {
    return this.http.delete<any>(`portRate`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getPortRateStations(config?: any) {
    return this.http.get<any>(`codeStation/getPortRateStations`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
