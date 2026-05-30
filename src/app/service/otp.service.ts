import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  url = 'service/otp';

  constructor(private $common: CommonService, private http: HttpClient) { }

  sendOtp(object) {
    return this.http.post<any>(this.url + `/sendOtp`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  sendOtpByNumber(object) {
    return this.http.post<any>(this.url + `/sendOtpByNumber`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  verifyOtp(object) {
    return this.http.post<any>(this.url + `/verifyOtp`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  verifyTOtp(object) {
    return this.http.post<any>(this.url + `/verifyTOtp`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  resetUserPassword(object) {
    return this.http.post<any>(this.url + `/resetUserPassword`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  loginLog(object) {
    return this.http.post<any>(this.url + `/loginLog`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  sendOtpByEmail(object) {
    return this.http.post<any>(this.url + `/sendOtpByEmail`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  verifyMobNumByOTP(object) {
    return this.http.post<any>(this.url + `/verifyMobNumByOTP`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  verifyOtpAndSaveMobNo(object) {
    return this.http.post<any>(this.url + `/verifyOtpAndSaveMobNo`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}


