import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeSubFormApiService } from 'src/app/service/api/code/code-sub-form-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HometownApiService } from 'src/app/service/api/claim/hometown-api.service';
import { LtcAvailedHistApiService } from 'src/app/service/api/claim/ltc-availed-hist-api.service';
declare var $: any;

@Component({
    selector: 'app-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NewComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private $common: CommonService,
    private $codeSubForm: CodeSubFormApiService,
    private $ltcAvailedHistApi: LtcAvailedHistApiService,
    private $hometownApi: HometownApiService
  ) { }

  dataList: any = [];
  config: any;
  userIdDetails;
  ltcCreateSubForm: any = null;
  ltcFamilyDetails: any[] = [];
  ltcHomeTown = '';
  ltcCertify: 1 | 0 | null = null;
  showLtcFamilyModal = false;
  showUpdateFamilyModal = false;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.handleEsignFeedback();
    this.getForm();
  }

  private handleEsignFeedback(): void {
    this.route.queryParamMap.subscribe((params) => {
      const status = params.get('esignStatus');
      const txnId = params.get('txnId');
      if (!status) {
        return;
      }

      if (status === 'SC') {
        this.$common.showMessage(
          txnId
            ? `eSign completed successfully. Transaction ID: ${txnId}`
            : 'eSign completed successfully.',
          'success'
        );
      } else if (status === 'US' || status === 'ER') {
        this.$common.showMessage(
          txnId
            ? `eSign could not be completed. Transaction ID: ${txnId}`
            : 'eSign could not be completed.',
          'danger'
        );
      } else {
        this.$common.showMessage(
          txnId
            ? `eSign status is being processed. Transaction ID: ${txnId}`
            : 'eSign status is being processed.',
          'info'
        );
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { esignStatus: null, txnId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }


  getForm() {
    try {
      this.$common.showLoader();
      // Legacy flow used codeForm.advVoucher / codeForm.claimForm (ADV/CLM),
      // not user profile formId. Runtime module id maps to the same values.
      const activeFormId = this.$auth.getRuntimeModuleId();
      this.config = {
        headers: {
          formId: activeFormId
        }
      }
      this.$codeSubForm.get(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.dataList = response?.object;
        }
      }, err => {
        this.$common.hideLoader();
        console.log(err);
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  private getCreatorClaimRoute(subFormId: string | null): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'P') return 'form-pmt-duty';
    if (id === 'T') return 'form-ty-duty';
    if (id === 'F') return 'form-fte-advance';
    if (id === 'L') return 'form-ltc-advance';
    if (id === 'M') return 'form-manual-adv';
    return null;
  }

  actionPage(data) {
    const subFormId = data?.subFormId || data?.codeSubFormDTO?.subFormId;
    const yatraRoute = this.getCreatorClaimRoute(subFormId);
    let moduleUrl = this.$auth.getModuleName();

    if ((subFormId || '').toUpperCase() === 'L') {
      this.startLegacyLtcCreateFlow(data);
      return;
    }

    if (yatraRoute) {
      this.router.navigateByUrl(
        moduleUrl + `/${yatraRoute}?subFormId=${subFormId}`
      );
      return;
    }

    this.router.navigateByUrl(
      moduleUrl + `/${data?.formUrl}?subFormId=${data.subFormId}`
    );
  }

  private startLegacyLtcCreateFlow(subForm: any): void {
    const userId = this.userIdDetails?.userId || '';
    const config = { headers: { userId } };

    this.ltcCreateSubForm = subForm;
    this.$common.showLoader();
    this.$ltcAvailedHistApi.getDoeDifference(config).subscribe({
      next: (response: any) => {
        const doe = Number(response?.object || 0);
        if (!(doe > 1)) {
          this.$common.hideLoader();
          this.$common.showMessage('On completion of one year service LTC entitlement commence', 'danger');
          return;
        }
        this.loadLtcAvailedHistory(config);
      },
      error: (error) => {
        this.$common.hideLoader();
        this.$common.showMessage(`${error?.status || ''} : ${error?.statusText || 'Unable to check LTC entitlement'}`, 'danger');
      },
    });
  }

  private loadLtcAvailedHistory(config: any): void {
    this.$ltcAvailedHistApi.checkAvailedHistory(config).subscribe({
      next: (response: any) => {
        const result = Number(response?.object);
        if (result === 0) {
          this.loadLtcFamilyDetails(config);
          return;
        }
        this.$common.hideLoader();
        if (result === 1) {
          this.navigateToLtcForm();
          return;
        }
        this.$common.showMessage(response?.message || 'Unable to create LTC advance.', 'danger');
      },
      error: (error) => {
        this.$common.hideLoader();
        this.$common.showMessage(`${error?.status || ''} : ${error?.statusText || 'Unable to check LTC availed history'}`, 'danger');
      },
    });
  }

  private loadLtcFamilyDetails(config: any): void {
    this.$ltcAvailedHistApi.getFamilyDetails(config).subscribe({
      next: (response: any) => {
        this.ltcFamilyDetails = Array.isArray(response?.object) ? response.object : [];
        this.loadHomeTown(config);
      },
      error: (error) => {
        this.$common.hideLoader();
        this.$common.showMessage(`${error?.status || ''} : ${error?.statusText || 'Unable to load family details'}`, 'danger');
      },
    });
  }

  private loadHomeTown(config: any): void {
    this.$hometownApi.init(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        this.ltcHomeTown = response?.object || '';
        this.ltcCertify = null;
        this.showLtcFamilyModal = true;
      },
      error: () => {
        this.$common.hideLoader();
        this.ltcHomeTown = '';
        this.ltcCertify = null;
        this.showLtcFamilyModal = true;
      },
    });
  }

  submitLtcFamilyConfirmation(): void {
    const homeTown = String(this.ltcHomeTown || '').trim();
    if (!homeTown) {
      this.$common.showMessage('Please Enter Home Town', 'danger');
      return;
    }
    if (this.ltcCertify !== 1 && this.ltcCertify !== 0) {
      this.$common.showMessage('Choose some option', 'danger');
      return;
    }

    const userId = this.userIdDetails?.userId || '';
    this.$common.showLoader();
    this.$hometownApi.createOrUpdate({ homeTown, userId }).subscribe({
      next: () => {
        this.$common.hideLoader();
        this.showLtcFamilyModal = false;
        if (this.ltcCertify === 1) {
          this.router.navigateByUrl(this.$auth.getModuleName() + '/form-ltc-availed-history');
          return;
        }
        this.showUpdateFamilyModal = true;
      },
      error: (error) => {
        this.$common.hideLoader();
        this.$common.showMessage(`${error?.status || ''} : ${error?.statusText || 'Unable to save home town'}`, 'danger');
      },
    });
  }

  closeLtcFamilyModal(): void {
    this.showLtcFamilyModal = false;
  }

  closeUpdateFamilyModal(): void {
    this.showUpdateFamilyModal = false;
  }

  private navigateToLtcForm(): void {
    const moduleUrl = this.$auth.getModuleName();
    const subFormId = this.ltcCreateSubForm?.subFormId || 'L';
    this.router.navigateByUrl(moduleUrl + `/form-ltc-advance?subFormId=${subFormId}`);
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {

    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end
}


