import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class ClaimBudgetApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAll(config?: any) {
    return this.http.get<any>('claimBudget/all', config).pipe(map((response: any) => this.parse(response)));
  }

  getRemaining(config?: any) {
    return this.http.get<any>('claimBudget/getRemaningBudget', config).pipe(map((response: any) => this.parse(response)));
  }

  getSingle(config?: any) {
    return this.http.get<any>('claimBudget/single', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(payload: any) {
    return this.http.post<any>('claimBudget/createOrUpdate', payload).pipe(map((response: any) => this.parse(response)));
  }

  delete(config?: any) {
    return this.http.delete<any>('claimBudget', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
