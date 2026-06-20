import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class PayStateApiService {
  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  getAll(config?: any) {
    return this.http.get<any>('payState/all', config).pipe(map((response: any) => this.parse(response)));
  }

  changeStatusById(payload: any) {
    return this.http.post<any>('payState/changeStatusById', payload).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
