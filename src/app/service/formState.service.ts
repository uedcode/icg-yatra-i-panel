
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class FormStateService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  changeStatusById(object) {
    return this.http.post<any>(`formState/changeStatusById`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  changeStatusByIhq(object) {
    return this.http.post<any>(`form/changeStatusById`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  moveToDraft(config) {
    return this.http.post<any>(`formState/moveToDraft`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getState(config) {

    return this.http.get<any>(`formState/getState`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getStateCount(config) {
    return this.http.get<any>(`formState/getStateCount`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getReturnUsers(config) {

    return this.http.get<any>(`formState/getReturnUsers`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  validationStateMgt(object) {
    return this.http.post<any>(`formState/validationStateMgt`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getHistory(config) {
    return this.http.get<any>(`formState/getHistory`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  saveAsDraft(config) {
    return this.http.post<any>(`formState/saveAsDraft`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}

