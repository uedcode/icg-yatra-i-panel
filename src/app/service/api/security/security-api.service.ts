import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityApiService {

  constructor(private $common: CommonService, private http: HttpClient) { }

  checkDeviceLimit(config) {
    return this.http.get<any>(`service/security/checkDeviceLimit`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}


