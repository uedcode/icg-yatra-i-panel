import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class TyDutyClaimService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getTyDutyPurposeTypes(config?: any) {
    return this.http.get<any>('tyDutyPurpose/all', config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // Backend parity controller exposes ltcAdv/all (legacy variants were consolidated).
  getAllAdvances(config?: any) {
    return this.http.get<any>('ltcAdv/all', config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getAllAdvancesForClaim(config?: any) {
    return this.getAllAdvances(config);
  }

  getAllForwardedAdvances(config?: any) {
    return this.getAllAdvances(config);
  }

  getAllReturnedAdvances(config?: any) {
    return this.getAllAdvances(config);
  }

  getAllRejectedAdvances(config?: any) {
    return this.getAllAdvances(config);
  }

  getSingleAdvance(config: any) {
    return this.http.get<any>('ltcAdv/single', config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // Legacy + backend parity: POST yatTempDutyClaim/getPenalInterest (header subFormId expected).
  getPenalInterest(payload: any, config?: any) {
    return this.http
      .post<any>('yatTempDutyClaim/getPenalInterest', payload, config || {})
      .pipe(
        map((res) => {
          this.$common.parseResponse(res);
          return res;
        })
      );
  }

  // Backend parity: POST ltcAdv/createOrUpdate
  createOrUpdateTyAdvance(payload: any) {
    return this.http.post<any>('ltcAdv/createOrUpdate', payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }
}

