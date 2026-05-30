import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
declare var $: any;

@Component({
    selector: 'app-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss'],
    standalone: false
})
export class NewComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private $common: CommonService,
    private $codeSubForm: CodeSubFormService,
  ) { }

  dataList: any = [];
  config: any;
  userIdDetails;

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
    if (id === 'P') return 'form-pmt';
    if (id === 'T') return 'form-tyduty';
    if (id === 'F') return 'form-fte';
    if (id === 'L') return 'form-ltc';
    if (id === 'M') return 'form-manual-adv';
    return null;
  }

  actionPage(data) {
    const subFormId = data?.subFormId || data?.codeSubFormDTO?.subFormId;
    const yatraRoute = this.getCreatorClaimRoute(subFormId);
    let moduleUrl = this.$auth.getModuleName();

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

