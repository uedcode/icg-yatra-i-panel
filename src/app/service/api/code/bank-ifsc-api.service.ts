import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BankIfscApiService {
  constructor(private http: HttpClient) {}

  createOrUpdate(bankObj: any, config?: { headers?: any }) {
    return this.http.post<any>('bankIfsc/createOrUpdate', bankObj, {
      headers: config?.headers || {},
    });
  }
}
