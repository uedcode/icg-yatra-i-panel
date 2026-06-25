import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { EsignApiService } from 'src/app/service/api/security/esign-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';

export interface ESignFlowContext {
  id?: string;
  claimId?: string;
  roleTypeId?: string;
  desigId?: string;
  userId?: string;
  status?: string;
  remark?: string;
  formRemarks?: string;
  financialYear?: string;
  moduleId?: string;
  unitId?: string;
  formId?: string;
  recommendedAmount?: string | number;
  allotedBudget?: string | number;
  balanceAmount?: string | number;
  balanceAmt?: string | number;
  progressiveExpenditureAmt?: string | number;
  balance?: string | number;
  redPercent?: string | number;
  redAmount?: string | number;
  redRemarks?: string;
  billAmount?: string | number;
  billAmt?: string | number;
  verifierUnit?: string;
}

export interface PreparedESignFlow {
  context: ESignFlowContext;
  message: string;
  documents: any[];
}

@Injectable({
  providedIn: 'root',
})
export class ESignFlowService {
  private readonly gatewayStorageKey = environment.esignConfig.gatewayStorageKey;
  private readonly redirectStorageKey = environment.esignConfig.redirectStorageKey;

  constructor(
    private $esign: EsignApiService,
    private $auth: AuthService,
    private $common: CommonService,
    private router: Router,
  ) {}

  start(context: ESignFlowContext): Observable<PreparedESignFlow | null> {
    const claimId = context?.claimId ?? context?.id;
    if (!claimId) {
      this.$common.showMessage('Unable to prepare eSign request.', 'danger');
      return of(null);
    }

    this.$common.showLoader();
    return this.$esign.prepareForESign(this.buildRequest(context)).pipe(
      map((response: any) => {
        if (!response?.status) {
          this.$common.showMessage(response?.message || 'Unable to prepare eSign request.', 'danger');
          return null;
        }

        return {
          context,
          message: response?.message || '',
          documents: Array.isArray(response?.object) ? response.object : [],
        };
      }),
      catchError((error) => {
        console.error(error);
        this.$common.showMessage('Unable to prepare eSign request.', 'danger');
        return of(null);
      }),
      finalize(() => this.$common.hideLoader()),
    );
  }

  perform(context: ESignFlowContext, eSignTransDocDTOs: any[]): Observable<boolean> {
    const claimId = context?.claimId ?? context?.id;
    if (!claimId) {
      this.$common.showMessage('Unable to perform eSign.', 'danger');
      return of(false);
    }

    this.$common.showLoader();
    return this.$esign.performESign({
      ...this.buildRequest(context, eSignTransDocDTOs),
      codeFormId: '',
      name: this.$auth.getUserDetails()?.personName,
    }).pipe(
      map((response: any) => {
        if (!response?.status || !response?.object) {
          this.$common.showMessage(response?.message || 'Unable to perform eSign.', 'danger');
          return false;
        }

        const moduleUrl = this.$auth.getModuleName();
        localStorage.setItem(this.gatewayStorageKey, response.object);
        localStorage.setItem(
          this.redirectStorageKey,
          this.router.url || (moduleUrl ? `${moduleUrl}/dashboard` : '/login'),
        );
        this.router.navigateByUrl(`${moduleUrl}/esign`);
        return true;
      }),
      catchError((error) => {
        console.error(error);
        this.$common.showMessage('Unable to perform eSign.', 'danger');
        return of(false);
      }),
      finalize(() => this.$common.hideLoader()),
    );
  }

  buildRequest(context: ESignFlowContext, eSignTransDocDTOs?: any[]): any {
    const userDetails = this.$auth.getUserDetails();
    return {
      claimId: context?.claimId ?? context?.id,
      roleTypeId: context?.roleTypeId ?? userDetails?.roleTypeId,
      desigId: context?.desigId ?? userDetails?.desigId,
      userId: context?.userId ?? userDetails?.userId,
      status: context?.status ?? 'OB',
      remark: context?.remark ?? context?.formRemarks,
      financialYear: context?.financialYear ?? userDetails?.financialYear,
      moduleId: context?.moduleId ?? userDetails?.moduleId,
      redPercent: context?.redPercent,
      redAmount: context?.redAmount,
      redRemarks: context?.redRemarks,
      unitId: context?.unitId ?? userDetails?.unitId,
      formId: context?.formId ?? context?.id,
      recommendedAmount: context?.recommendedAmount,
      allotedBudget: context?.allotedBudget,
      balanceAmt: context?.balanceAmt ?? context?.balanceAmount,
      progressiveExpenditureAmt: context?.progressiveExpenditureAmt,
      balance: context?.balance,
      billAmt: context?.billAmt ?? context?.billAmount,
      ...(eSignTransDocDTOs ? { eSignTransDocDTOs } : {}),
    };
  }

  isESignForward(signWith: string | null | undefined, status: string | null | undefined, roleTypeId: string | null | undefined): boolean {
    const normalizedSign = String(signWith || '').toUpperCase();
    const normalizedStatus = String(status || '').toUpperCase();
    const normalizedRole = String(roleTypeId || '').toUpperCase();
    const isESign = normalizedSign === 'ES' || normalizedSign === 'E_SIGN' || normalizedSign === 'ESIGNALT';
    return isESign && normalizedStatus === 'OB' && (normalizedRole === 'VE2' || normalizedRole === 'AP');
  }

  handleEsignFeedback(route: ActivatedRoute): Subscription {
    return route.queryParamMap.subscribe((params) => {
      const status = params.get('esignStatus');
      const txnId = params.get('txnId');
      if (!status) {
        return;
      }

      if (status === 'SC') {
        this.$common.showMessage(
          txnId ? `eSign completed successfully. Transaction ID: ${txnId}` : 'eSign completed successfully.',
          'success',
        );
      } else if (status === 'US' || status === 'ER') {
        this.$common.showMessage(
          txnId ? `eSign could not be completed. Transaction ID: ${txnId}` : 'eSign could not be completed.',
          'danger',
        );
      } else {
        this.$common.showMessage(
          txnId ? `eSign status is being processed. Transaction ID: ${txnId}` : 'eSign status is being processed.',
          'info',
        );
      }

      this.router.navigate([], {
        relativeTo: route,
        queryParams: { esignStatus: null, txnId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }
}
