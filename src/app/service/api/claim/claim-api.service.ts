import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClaimApiService {
  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  // ==========================
  // CORE CLAIM OPERATIONS
  // ==========================

  /**
   * Create or update a claim (all claim types – LTC, Yatra, TY, FTE, etc.).
   * Legacy claim.js posts FormData(yatClaimDTO) to claim/createOrUpdate.
   * url = ApiUrl + "claim"
   */
  // Advance only: Claim-module saves must use createOrUpdateClaim().
  createOrUpdateAdvance(formData: FormData, config?: { headers?: any }) {
    const options: any =
      config && config.headers ? { headers: config.headers } : {};

    return this.http.post<any>('claim/createOrUpdate', formData, options).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * True Claim-module save.
   * Legacy all-claims controllers post claim payloads to claim/createOrUpdateClaim.
   * Creator Advance forms must use createOrUpdateAdvance().
   */
  createOrUpdateClaim(object: any, config?: { headers?: any }) {
    const options: any =
      config && config.headers ? { headers: config.headers } : {};

    return this.http.post<any>('claim/createOrUpdateClaim', object, options).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Get list of claims ready for claim (outbox/inbox style).
   * Old JS: $http.get(url + "/readyForClaim", config)
   */
  getReadyForClaim(config: any) {
    return this.http.get<any>(`claim/readyForClaim`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Get a single claim by id + type, etc.
   * Old JS: $http.get(url + "/single", config)
   */
  getSingleClaim(config: any) {
    return this.http.get<any>(`claim/single`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Claim preview/details endpoint.
   * Legacy claim preview flow uses /getSingleClaim, not /single.
   */
  getSingleClaimPreview(config: any) {
    return this.http.get<any>(`claim/getSingleClaim`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Get all partial claims (used in extension / additional claims).
   * Old JS: $http.get(url + "/getAllPartialClaims", config)
   */
  getAllPartialClaims(config: any) {
    return this.http.get<any>(`claim/getAllPartialClaims`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Get single movement (Yatra / movement-based forms).
   * Old JS: $http.get(url + "/getSingleMovement", config)
   */
  getSingleMovement(config: any) {
    return this.http.get<any>(`claim/getSingleMovement`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Validate movement.
   * Old JS: $http.get(url + "/validateMovement", config)
   */
  validateMovement(config: any) {
    return this.http.get<any>(`claim/validateMovement`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Advance voucher details.
   * Old JS: $http.get(url + "/advanceVoucher", config)
   */
  getAdvanceVoucher(config: any) {
    return this.http.get<any>(`claim/advanceVoucher`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  fileDownloadedVoucher(config: any) {
    return this.http.put<any>(`claim/fileDownloadedVoucher`, {}, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  /**
   * Get verifier unit for a claim.
   * Old JS: $http.put(url + "/getVerifierUnit", {}, config)
   */
  getVerifierUnit(config: any) {
    return this.http.put<any>(`claim/getVerifierUnit`, {}, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  // ==========================
  // MASTER / SUPPORTING LISTS
  // (direct mapping from claim.js / ty-duty-claim.js)
  // ==========================

  getClaimHistory(config?: any) {
    return this.http.get<any>(`claim/claimHistory`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  editClaim(config?: any) {
    return this.http.post<any>(`claim/editClaim`, null, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  cloneClaim(config?: any) {
    return this.http.put<any>(`claim/cloneClaim`, {}, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  deleteClaim(config?: any) {
    return this.http.delete<any>(`claim`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  fileClaimDailySlip(config?: any) {
    return this.http.put<any>(`claim/fileClaimDailySlip`, {}, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  fileDownloadedForInkSign(config?: any) {
    return this.http.put<any>(`claim/fileDownloadedForInkSign`, {}, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  uploadInkSignedFile(formData: FormData) {
    return this.http.post<any>(`claim/uploadInkSignedFile`, formData).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  changeStatusToUploaded(config?: any) {
    return this.http.put<any>(`claim/changeStatusToUploaded`, {}, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getClaimRemarkSummary(config?: any) {
    return this.http.get<any>(`claim/getClaimRemarks`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Validate allowed claim state transition.
   * Old JS equivalent: claim/validateClaimState or claimState/validateClaimState
   */
  validateClaimState(config: any) {
    return this.http.get<any>(`claim/validateClaimState`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }
}

