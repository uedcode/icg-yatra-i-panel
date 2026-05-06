import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root',
})
export class FormService {
  getFormDownloadLink(formId: string, arg1: string) {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient, private $common: CommonService) {}

  createOrUpdate(object) {
    return this.http.post<any>(`form/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  get(config) {
    return this.http.get<any>(`form/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getSingleForm(config) {
    return this.http.get<any>(`form/getSingleForm`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  delete(ids) {
    return this.http.get<any>(`form/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getFromDownloadUrl(config) {
    return this.http.get<any>(`form/downloadSingleForm`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getWardList(config) {
    return this.http.get<any>(`form/getListOfWards`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getIhqList(config) {
    return this.http.get<any>(`form/getIHQAPFormState`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getTxnDetails(config) {
    return this.http.get<any>(`form/getTxnDetails`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  validatePortAndCount(config) {
    return this.http.get<any>(`form/validatePortAndCount`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  resubmit(config) {
    return this.http.get<any>(`form/resubmit`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}
