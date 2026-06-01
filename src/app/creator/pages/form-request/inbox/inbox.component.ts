import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { FormStateService } from 'src/app/service/formState.service';
import { ClaimService } from 'src/app/service/claim.service';
import { buildLegacyClaimStateHeaders } from 'src/app/shared/utils/legacy-api.util';
declare var $: any;

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.scss'],
    standalone: false
})
export class InboxComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    public $formManage: FormManageService,
    private router: Router,
    public $formState: FormStateService,
    private $claim: ClaimService,
    private route: ActivatedRoute,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  filterObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  toggleFilter: any = false;
  readonly moduleType: 'ADV' = 'ADV';
  queueLabel = 'Advance';

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.queueLabel = 'Advance';
this.handleEsignFeedback();
    this.getState();
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

  filterDataObj
  getState() {
    const searchHeaders = this.getLegacySearchHeaders();
    const formId = this.moduleType;
    const codeRoleList = this.$auth.codeRoleType();
    const config = {
      headers: buildLegacyClaimStateHeaders({
        ...this.userIdDetails,
        claimState: this.codeStatus?.inbox,
        formId,
        isArchive: '0',
        searchFormId: searchHeaders.formId,
        pno: searchHeaders.pno,
        searchedName: searchHeaders.searchedName,
      }, codeRoleList),
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  private getLegacySearchHeaders(): { formId: string; pno: string; searchedName: string } {
    const formId = (this.filterObj?.formId || '').toString().trim();
    const pno = (this.filterObj?.pno || '').toString().trim();
    const searchedName = (this.filterObj?.searchedName || '').toString().trim();
    if (formId || pno || searchedName) {
      return { formId, pno, searchedName };
    }

    const raw = (this.searchObj || '').toString().trim();
    if (!raw) {
      return { formId: '', pno: '', searchedName: '' };
    }
    if (/^\d+$/.test(raw)) {
      return { formId: raw, pno: raw, searchedName: '' };
    }
    if (/^[A-Za-z0-9/-]+$/.test(raw)) {
      return { formId: '', pno: raw, searchedName: '' };
    }
    return { formId: '', pno: '', searchedName: raw };
  }

  applyServerSearch(): void {
    this.p = 1;
    this.getState();
  }

  onSearchInput(): void {
    if (!(this.searchObj || '').toString().trim()) {
      this.applyServerSearch();
    }
  }

  resetAdvancedFilters(): void {
    this.filterObj = {};
    this.applyServerSearch();
  }

  private getCreatorClaimRoute(subFormId: string | null, detail = false): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'PMTA' || id === 'PMT') return detail ? 'preview-pmt-duty-claim' : 'form-pmt-duty-claim';
    if (id === 'TYA' || id === 'TY') return detail ? 'preview-ty-duty-claim' : 'form-ty-duty-claim';
    if (id === 'FTEA' || id === 'FTE') return detail ? 'preview-fte-claim' : 'form-fte-claim';
    if (id === 'LTCA' || id === 'LTC') return detail ? 'preview-ltc-claim' : 'form-ltc-claim';
    if (id === 'RS' || id === 'RES' || id === 'R' || id === 'RESCLM') return detail ? 'preview-resettlement-claim' : 'form-resettlement-claim';
    if (id === 'P') return detail ? 'form-pmt-detail' : 'form-pmt';
    if (id === 'T') return detail ? 'form-tyduty-detail' : 'form-tyduty';
    if (id === 'F') return detail ? 'form-fte-detail' : 'form-fte';
    if (id === 'L') return detail ? 'form-ltc-detail' : 'form-ltc';
    if (id === 'M') return detail ? 'form-manual-adv-detail' : 'form-manual-adv';
    return null;
  }

  viewForm(data) {
    const payId = data?.yatPayDetailsDTO?.id || data?.id;
    if (payId && (data?.yatPayDetailsDTO || data?.viewUrl === 'form-pay-details' || data?.formUrl === 'form-pay-details')) {
      this.router.navigateByUrl(this.$auth.getModuleName() + `/form-pay-details?id=${payId}`);
      return;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    const subFormId =
      claim?.codeSubFormDTO?.subFormId ||
      data?.subFormId ||
      data?.codeSubFormDTO?.subFormId;
    const route = this.getCreatorClaimRoute(subFormId, false);

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() +
          `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(moduleUrl + `/${data?.viewUrl}?id=${data.formId}`);
  }

  moveToDraft(data) {
    try {
      const claim = data?.yatClaimDTO || {};
      const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
      if (claimId) {
        const config = {
          headers: {
            id: claimId,
          },
        };
        this.$claim.editClaim(config).subscribe(
          (response: any) => {
            if (response.status === true) {
              this.$common.showMessage(`${response.message}`);
              this.dataList = this.dataList.filter(
                (elem: any) =>
                  (elem?.yatClaimDTO?.claimId || elem?.formId || elem?.id) != claimId
              );
              setTimeout(() => {
                let moduleUrl = this.$auth.getModuleName();
                this.router.navigateByUrl(moduleUrl + `/draft`);
              }, 1000);
            }
          },
          () => {
            this.$common.hideLoader();
          }
        );
        return;
      }

      let config = {
        headers:{
          "formId": data?.formId,
        }
        // "roleTypeId": this.userIdDetails?.roleTypeId,
        // "status": this.codeStatus?.draft,
        // "unitId": data?.unitId,
        
        // "codeFormId": this.userIdDetails?.formId,
      }
      this.$formState.moveToDraft(config).subscribe(response => {
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter(elem => elem?.formId != data?.formId);
          setTimeout(() => {
            let moduleUrl = this.$auth.getModuleName();
            this.router.navigateByUrl(moduleUrl + `/draft`);
          }, 1000);
        }
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  formId;
  claimId;
  viewHistory(formId: any, claimId: any = null): void {
    this.formId = formId;
    this.claimId = claimId || null;
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
  }

  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

}


