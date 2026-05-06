import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UserTokenService {

  constructor(private $common: CommonService, private http: HttpClient) { }

  userTokenUpdate(config) {
    return this.http.post<any>(`service/userToken/createOrUpdate`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  userTokenDelete(config) {
    return this.http.get<any>(`service/userToken/deleteByIds`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}

