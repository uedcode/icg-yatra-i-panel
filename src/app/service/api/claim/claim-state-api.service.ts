import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaimStateApiService {
  private readonly statusCountRefreshSubject = new Subject<void>();
  readonly statusCountRefresh$ = this.statusCountRefreshSubject.asObservable();

  constructor(private http: HttpClient, private $common: CommonService) {}

  getEsignReportData(config?: any) {
    return this.http.get<any>('claimState/esignReportData', config).pipe(map((response: any) => this.parse(response)));
  }

  getAll(config?: any) {
    return this.http.get<any>('claimState/all', config).pipe(map((response: any) => this.parse(response)));
  }

  changeStatusById(payload: any) {
    return this.http.post<any>('claimState/changeStatusById', payload).pipe(map((response: any) => this.parse(response)));
  }

  changeStatusArchive(config?: any) {
    return this.http.put<any>('claimState/changeStatusArchive', null, config).pipe(map((response: any) => this.parse(response)));
  }

  getStatusCount(config: any) {
    return this.http.get<any>('claimState/stateCount', config).pipe(map((response: any) => this.parse(response)));
  }

  notifyStatusCountRefresh(): void {
    this.statusCountRefreshSubject.next();
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
