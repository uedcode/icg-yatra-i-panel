import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class TotpService {

  constructor(private $common: CommonService, private http: HttpClient) { }

  checkTOtp(config) {
    return this.http.post<any>(`totp/checkTOtp`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  setupQrCode(config) {
    return this.http.post<any>(`totp/setupQrCode`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  enableTOtp(config) {
    return this.http.post<any>(`totp/enableTOtp`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  disableTOtp(config) {
    return this.http.post<any>(`totp/disableTOtp`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }


}


