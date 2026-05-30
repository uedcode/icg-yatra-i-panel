import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class TyDutyClaimService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  // ==========================
  // TY DUTY / ADVANCE LISTS
  // ==========================

  /**
   * TY duty purpose types.
   * Old JS: purposeTypeUrl = ApiUrl + "tyDutyPurpose";  /all
   */
  getTyDutyPurposeTypes(config?: any) {
    return this.http.get<any>(`tyDutyPurpose/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * All LTC / TY advance records (LTC/TY combined list).
   * Old JS: ltcAdvUrl = ApiUrl + "ltcAdv"; /allR, /allForClaim, etc.
   * Here I’m giving you separate helpers – use whichever you actually need.
   */
  getAllAdvances(config?: any) {
    return this.http.get<any>(`ltcAdv/allR`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getAllAdvancesForClaim(config?: any) {
    return this.http.get<any>(`ltcAdv/allForClaim`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getAllForwardedAdvances(config?: any) {
    return this.http.get<any>(`ltcAdv/allForward`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getAllReturnedAdvances(config?: any) {
    return this.http.get<any>(`ltcAdv/allReturned`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getAllRejectedAdvances(config?: any) {
    return this.http.get<any>(`ltcAdv/allRejected`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Single advance details (used during claim creation from existing advance).
   * Old JS (pattern): ltcAdvUrl + "/getSingle"  (check and align with backend)
   * If your Java endpoint name differs, just change the string below.
   */
  getSingleAdvance(config: any) {
    return this.http.get<any>(`ltcAdv/getSingle`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // PENAL INTEREST / RECOVERY
  // ==========================

  /**
   * Get penal interest for TY duty claim.
   * Old JS: $http.post(tempDutyClaimUrl + "/getPenalInterest", object)
   * (tempDutyClaimUrl was ApiUrl + "tempDutyClaim" or similar)
   *
   * If in your Java code it is actually `tyDutyClaim/getPenalInterest`
   * then update below accordingly.
   */
  getPenalInterest(payload: any) {
    return this.http.post<any>(`tempDutyClaim/getPenalInterest`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // TY ADVANCE SAVE / UPDATE (if separate)
  // ==========================

  /**
   * Create or update TY duty advance itself (not final claim).
   * If in backend you have a separate controller for advances,
   * map that here. Example based on usual pattern:
   *
   *   POST /ltcAdv/createOrUpdateTyAdv
   *
   * If actual URL in Java is different, just change the string.
   */
  createOrUpdateTyAdvance(payload: any) {
    return this.http.post<any>(`ltcAdv/createOrUpdateTyAdv`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }
}

