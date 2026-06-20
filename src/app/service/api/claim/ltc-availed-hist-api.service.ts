import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class LtcAvailedHistApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAll(config?: any) {
    return this.http.get<any>('ltcAvailedHist/all', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(payload: any) {
    return this.http.post<any>('ltcAvailedHist/createOrUpdate', payload).pipe(map((response: any) => this.parse(response)));
  }

  getLtcEntitled(config?: any) {
    return this.http.get<any>('ltcAvailedHist/getLTCEntitled', config).pipe(map((response: any) => this.parse(response)));
  }

  getLtcAvailedEntitledHistory(config?: any) {
    return this.http.get<any>('ltcAvailedHist/getLTCAvailedHistory', config).pipe(map((response: any) => this.parse(response)));
  }

  getDoeDifference(config?: any) {
    return this.http.get<any>('ltcAvailedHist/getDOEDifference', config).pipe(map((response: any) => this.parse(response)));
  }

  checkAvailedHistory(config?: any) {
    return this.http.get<any>('ltcAvailedHist/checkIsAvaliedHistory', config).pipe(map((response: any) => this.parse(response)));
  }

  getFamilyDetails(config?: any) {
    return this.http.get<any>('ltcAvailedHist/getFamilyDetails', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
