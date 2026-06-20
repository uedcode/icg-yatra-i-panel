import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class CodeHrPayApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAll(config: any) {
    return this.http.get<any>('codehrpay/all', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(object: any) {
    return this.http.post<any>('codehrpay/createOrUpdate', object).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
