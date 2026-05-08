import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  getCodeYatAdvPayLevel(config?: any) {
    return this.http.get<any>(`payLevel/getAll`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }
  constructor(private http: HttpClient, private $common: CommonService) {}
  private apiUrl = environment.api;

  // ==========================
  // CORE CLAIM OPERATIONS
  // ==========================

  /**
   * Create or update a claim (all claim types – LTC, Pilotage, TY, FTE, etc.).
   * Old JS: $http.post(url + "/createOrUpdateClaim", $scope.claim)
   * url = ApiUrl + "claim"
   */
  // claim.service.ts
  createOrUpdateClaim(object: any, config?: { headers?: any }) {
    const options: any =
      config && config.headers ? { headers: config.headers } : {};

    return this.http.post<any>('claim/createOrUpdate', object, options).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  // Update Ifsc Code
  createOrUpdateIfsc(bankObj: any, config?: { headers?: any }) {
    const options: any = {
      headers: config?.headers || {},
    };

    return this.http.post<any>('bankIfsc/createOrUpdate', bankObj, options);
  }

  /**
   * Validate claims before submit.
   * Old JS: $http.post(validationUrl + "/claims", $scope.claimsForValidation)
   * validationUrl = ApiUrl + "validation"
   */
  validateClaims(payload: any) {
    return this.http.post<any>(`validation/claims`, payload).pipe(
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
   * Old JS: $http.get(url + "/getSingleClaim", config)
   */
  getSingleClaim(config: any) {
    return this.http.get<any>(`claim/single`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  // createOrUpdateIfsc(body: any, config?: { headers?: any }) {
  //   const url = this.apiUrl + 'bankIfsc/createOrUpdate'; // same as old $rootScope.ApiUrl
  //   const options = config || { headers: {} };
  //   return this.http.post(url, body, options);
  // }

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
   * Get single movement (Pilotage / movement-based forms).
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

  /**
   * Get verifier unit for a claim.
   * Old JS: $http.get(url + "/getVerifierUnit", config)
   */
  getVerifierUnit(config: any) {
    return this.http.get<any>(`claim/getVerifierUnit`, config).pipe(
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

  /**
   * Claim state master (Draft / Outbox / Returned / etc.).
   * Old JS: claimStateUrl = ApiUrl + "claimState"; /all
   */
  getClaimStates(config?: any) {
    return this.http.get<any>(`claimState/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  createOrUpdateClaimFormData(formData: FormData) {
    return this.http.post<any>('claim/createOrUpdate', formData).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changeClaimStatusById(payload: any) {
    return this.http.post<any>(`claimState/changeStatusById`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  changeClaimStatusArchive(config?: any) {
    return this.http.put<any>(`claimState/changeStatusArchive`, null, config).pipe(
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

  deleteClaim(config?: any) {
    return this.http.delete<any>(`claim`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Sub form master (Pilotage, TY Advance, FTE, LTC etc.).
   * Old JS: codeSubFormUrl = ApiUrl + "codeSubForm"; /all
   */
  getSubForms(config?: any) {
    return this.http.get<any>(`codeSubForm/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Pay level list.
   * Old JS: payLevelUrl = ApiUrl + "payLevel"; /getAll
   */
  getPayLevels(config?: any) {
    return this.http.get<any>(`payLevel/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Unit master.
   * Old JS: codeUnitUrl = ApiUrl + "codeUnit"; /all
   */
  getUnits(config?: any) {
    return this.http.get<any>(`codeUnit/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Budget head / claim budget master.
   * Old JS: claimBudgetUrl = ApiUrl + "claimBudget"; /all
   */
  getClaimBudgets(config?: any) {
    return this.http.get<any>(`claimBudget/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getRemainingClaimBudget(config?: any) {
    return this.http.get<any>(`claimBudget/getRemaningBudget`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getSingleClaimBudget(config?: any) {
    return this.http.get<any>(`claimBudget/single`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  createOrUpdateClaimBudget(payload: any) {
    return this.http.post<any>(`claimBudget/createOrUpdate`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  deleteClaimBudget(config?: any) {
    return this.http.delete<any>(`claimBudget`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Directorate / DIR master.
   * Old JS: codeDirUrl = ApiUrl + "codeDir"; /all
   */
  getDirectorates(config?: any) {
    return this.http.get<any>(`codeDir/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * LTC type master (LTC, HT LTC, etc.).
   * Old JS: codeLtcTypeUrl = ApiUrl + "codeLtcType"; /all
   */
  getLtcTypes(config?: any) {
    return this.http.get<any>(`codeLtcType/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * General remarks master for form.
   * Old JS: formRemarkUrl = ApiUrl + "formRemark"; /all
   */
  getFormRemarks(config?: any) {
    return this.http.get<any>(`formRemark/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Claim observation master.
   * Old JS: claimObservationUrl = ApiUrl + "claimObservation"; /all
   */
  getClaimObservations(config?: any) {
    return this.http.get<any>(`claimObservation/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * LTC availed history.
   * Old JS: ltcAvailedUrl = ApiUrl + "ltcAvailedHist"; /all
   */
  getLtcAvailedHistory(config?: any) {
    return this.http.get<any>(`ltcAvailedHist/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  createOrUpdateLtcAvailedHistory(payload: any) {
    return this.http.post<any>(`ltcAvailedHist/createOrUpdate`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getLtcEntitled(config?: any) {
    return this.http.get<any>(`ltcAvailedHist/getLTCEntitled`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getLtcAvailedEntitledHistory(config?: any) {
    return this.http.get<any>(`ltcAvailedHist/getLTCAvailedHistory`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getPayDetails(config?: any) {
    return this.http.get<any>(`yatPayDetails/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  createOrUpdatePayDetails(payload: any) {
    return this.http.post<any>(`yatPayDetails/createOrUpdate`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  getPayStates(config?: any) {
    return this.http.get<any>(`payState/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  changePayStatusById(payload: any) {
    return this.http.post<any>(`payState/changeStatusById`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Debit / credit note master.
   * Old JS: debitCreditNoteUrl = ApiUrl + "debitCreditNote"; /all
   */
  getDebitCreditNotes(config?: any) {
    return this.http.get<any>(`debitCreditNote/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Manual advance master.
   * Old JS: manualAdvUrl = ApiUrl + "manualAdv"; /all
   */
  getManualAdvances(config?: any) {
    return this.http.get<any>(`manualAdv/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Reason master (reason for delay, reason for non-DTS, etc.).
   * Old JS: reasonUrl = ApiUrl + "reason"; /all
   */
  getReasons(config?: any) {
    return this.http.get<any>(`reason/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * E-sign configuration / availability.
   * Old JS: esignUrl = ApiUrl + "esign"; /all
   */
  getEsignConfig(config?: any) {
    return this.http.get<any>(`esign/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Claim remark master (used in PI / processing).
   * Old JS: piRemarkUrl = ApiUrl + "claimRemark"; /all
   */
  getClaimRemarks(config?: any) {
    return this.http.get<any>(`claimRemark/all`, config).pipe(
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
   * Recovery adjusted master.
   * Old JS: recoveryAdjustedUrl = ApiUrl + "recoveryAdjusted"; /all
   */
  getRecoveryAdjustedList(config?: any) {
    return this.http.get<any>(`recoveryAdjusted/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * HR pay code master.
   * Old JS: codehrpayUrl = ApiUrl + "codehrpay"; /all
   */
  getHrPayCodes(config?: any) {
    return this.http.get<any>(`codehrpay/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * GX type master.
   * Old JS: codeGxTypeUrl = ApiUrl + "codeGxType"; /all
   */
  getGxTypes(config?: any) {
    return this.http.get<any>(`codeGxType/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Misc code master (from BaseUrl in old JS).
   * Old JS: codeMiscUrl = BaseUrl + "codeMisc"; /getAll
   */
  getMiscCodes(config?: any) {
    return this.http.get<any>(`codeMisc/getAll`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // E-SIGN
  // ==========================

  /**
   * Perform E-sign.
   * Old JS: $http.post(esignUrl + "/performESign", object)
   */
  performESign(payload: any) {
    return this.http.post<any>(`esign/performESign`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // =========================================================
  // EXTRA METHODS ADDED TO MIRROR OLD claim.js / ty-duty-claim.js
  // (These are the ones I’d referenced earlier but weren’t in
  //  your current file. Existing methods above are untouched.)
  // =========================================================

  /**
   * Move claim into workflow (submit / send to next level).
   * Old JS equivalent: claim/sendToWorkflow
   */
  sendToWorkflow(payload: any) {
    return this.http.post<any>(`claim/sendToWorkflow`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Get status count (dashboard tiles etc.).
   * Old JS equivalent: claim/getStatusCount
   */
  getStatusCount(config: any) {
    return this.http.get<any>(`claim/getStatusCount`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Get status count per-claim (for filters / drill-down).
   * Old JS equivalent: claim/getStatusCountByClaim
   */
  getStatusCountByClaim(config: any) {
    return this.http.get<any>(`claim/getStatusCountByClaim`, config).pipe(
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

  // ==========================
  // PAY LEVEL / BASIC PAY
  // ==========================

  /**
   * Get single pay level / entitlement (used in TY Duty getTransBasicPay()).
   * Old JS equivalent: payLevel/getSinglePayLevel
   */
  getSinglePayLevel(config: any) {
    return this.http.get<any>(`payLevel/getSinglePayLevel`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // FIELD VALIDATION HELPERS
  // ==========================

  /**
   * Validate specific fields (server-side validation rules).
   * Old JS equivalent: validation/fields
   */
  validateFields(payload: any) {
    return this.http.post<any>(`validation/fields`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Get validation metadata for fields (min/max, mandatory, etc.).
   * Old JS equivalent: validation/getValidationFieldDetails
   */
  getValidationFieldDetails(config: any) {
    return this.http
      .get<any>(`validation/getValidationFieldDetails`, config)
      .pipe(
        map((res) => {
          this.$common.parseResponse(res);
          return res;
        })
      );
  }

  // ==========================
  // CLAIM-SPECIFIC UTILITIES
  // ==========================

  /**
   * Get WEF date (effective date) – used in some claim flows.
   * Old JS equivalent: claim/getWefDate
   */
  getWefDate(config: any) {
    return this.http.get<any>(`claim/getWefDate`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Penal interest calculation, if applicable.
   * Old JS equivalent: claim/getPenalInterest
   */
  getPenalInterest(config: any) {
    return this.http.get<any>(`claim/getPenalInterest`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // MASTER ALIASES / EXTRAS
  // ==========================

  /**
   * Alias for GX types list (kept to match old JS function names).
   */
  getAllGxTypes(config?: any) {
    return this.getGxTypes(config);
  }

  /**
   * Alias for HR pay code list.
   */
  getAllHrPayCodes(config?: any) {
    return this.getHrPayCodes(config);
  }

  /**
   * Alias for misc codes list.
   */
  getAllMiscCodes(config?: any) {
    return this.getMiscCodes(config);
  }

  /**
   * Deputation / misc status – typically pulled from codeMisc in old JS.
   * You can pass key/type in config.params to filter server-side.
   */
  getDeputationStatus(config?: any) {
    return this.http.get<any>(`codeMisc/getDeputationStatus`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Bank master – used when changing IFSC / bank in some flows.
   */
  getAllBanks(config?: any) {
    return this.http.get<any>(`codeBank/all`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // E-SIGN ADDITIONALS
  // ==========================

  /**
   * Prepare payload for eSign (server-side pre-processing).
   * Old JS equivalent: esign/prepareForESign
   */
  prepareForESign(payload: any) {
    return this.http.post<any>(`esign/prepareForESign`, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Check whether eSign is available for given claim / user.
   * Alias to getEsignConfig if your backend doesn’t have a separate endpoint.
   */
  checkEsignAvailability(config?: any) {
    // If you later create a dedicated endpoint, just change this URL.
    return this.http.get<any>(`esign/checkEsignAvailability`, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  // ==========================
  // GENERIC HTTP HELPERS
  // ==========================

  /**
   * Generic GET helper – useful when porting remaining JS calls.
   */
  getFromPath(path: string, config?: any) {
    return this.http.get<any>(path, config).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }

  /**
   * Generic POST helper – useful when porting remaining JS calls.
   */
  postToPath(path: string, payload: any) {
    return this.http.post<any>(path, payload).pipe(
      map((res) => {
        this.$common.parseResponse(res);
        return res;
      })
    );
  }
}
