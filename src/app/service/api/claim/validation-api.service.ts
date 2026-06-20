import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationApiService {
  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  validateClaims(payload: any) {
    return this.http.post<any>('validation/claims', payload).pipe(map((response: any) => this.parse(response)));
  }

  checkValidSignType(config?: any) {
    return this.http.get<any>('validation/checkValidSignType', config).pipe(map((response: any) => this.parse(response)));
  }

  validateFields(payload: any) {
    return this.http.post<any>('validation/fields', payload).pipe(map((response: any) => this.parse(response)));
  }

  getValidationFieldDetails(config: any) {
    return this.http.get<any>('validation/getValidationFieldDetails', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
