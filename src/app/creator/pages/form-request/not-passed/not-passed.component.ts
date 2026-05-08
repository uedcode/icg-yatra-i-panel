import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { FormManageService } from 'src/app/service/formManage.service';
import { FormStateService } from 'src/app/service/formState.service';
import { ClaimService } from 'src/app/service/claim.service';
declare var $: any;

@Component({
    selector: 'app-not-passed',
    templateUrl: './not-passed.component.html',
    styleUrls: ['./not-passed.component.scss'],
    standalone: false
})
export class NotPassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; notPassed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    public $formManage: FormManageService,
    public $formState: FormStateService,
    private $claim: ClaimService,
    private router: Router,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  resubmitLoadingMap: { [key: string]: boolean } = {};
  saveAsDraftLoadingMap: { [key: string]: boolean } = {};

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  filterDataObj;
  getState() {
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.notPassed,
      },
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  private getCreatorClaimRoute(subFormId: string | null, detail = false): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'P') return detail ? 'form-pmt-detail' : 'form-pmt';
    if (id === 'T') return detail ? 'form-tyduty-detail' : 'form-tyduty';
    if (id === 'F') return detail ? 'form-fte-detail' : 'form-fte';
    if (id === 'L') return detail ? 'form-ltc-detail' : 'form-ltc';
    return null;
  }

  viewForm(data) {
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
          `/${route}?claimId=${claimId}&subFormId=${subFormId}&state=${this.codeStatus?.notPassed}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    const queryParams = [`id=${data.formId}`, `state=${this.codeStatus?.notPassed}`];

    if (data?.subFormId) {
      queryParams.push(`subFormId=${data.subFormId}`);
    }

    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?${queryParams.join('&')}`
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

  formId;
  claimId;
  viewHistory(formId: any, claimId: any = null): void {
    this.formId = formId;
    this.claimId = claimId || null;
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
  }

  /*
  resubmitForm(data: any) {
  if (!data?.formId) return;

  // prevent double click
  if (this.resubmitLoadingMap[data.formId]) return;
  this.resubmitLoadingMap[data.formId] = true;

  this.config = {
    headers: {
      id: data.formId,
      userId:this.userIdDetails?.userId || '',
      roleId:this.userIdDetails?.roleId || '',
      desigId:this.userIdDetails.desigId || '',
      unitId:this.userIdDetails.unitId || '',
    },
  };
 
  this.$form.resubmit(this.config).subscribe({
    next: (res: any) => {
      this.resubmitLoadingMap[data.formId] = false;

      if (res?.status && res?.object?.length) {
        const newForm = res.object[0];

        // Option-1: open new form in edit/view page
        // If backend returns new id: newForm.id
        let moduleUrl = this.$auth.getModuleName();

        // aapke project me viewUrl is list item ka hota hai, but resubmit ke baad
        // normally edit form page open karna better hota hai.
        // If you have editUrl return from backend, use that. Else reuse existing viewUrl.
        const redirectUrl = data?.formUrl;

        if (redirectUrl) {
          this.router.navigateByUrl(
            moduleUrl + `/${redirectUrl}?id=${newForm.id}`
          );
        } else {
          // fallback: just reload list
          this.getState();
        }

        // Optional toast
        this.$common?.showMessage?.('Form resubmitted successfully.');
      } else {
        this.$common?.showMessage?.(res?.message || 'Resubmit failed.');
      }
    },
    error: (err) => {
      this.resubmitLoadingMap[data.formId] = false;
      this.$common?.showMessage?.('Something went wrong while resubmitting.');
      console.error(err);
    },
  });
}
  */

  saveAsDraft(data: any) {
    const draftKey = data?.yatClaimDTO?.claimId || data?.claimId || data?.formId;
    if (!draftKey || this.saveAsDraftLoadingMap[draftKey]) {
      return;
    }

    this.saveAsDraftLoadingMap[draftKey] = true;

    const claimId = data?.yatClaimDTO?.claimId || data?.claimId;
    if (claimId) {
      const moveToDraftConfig: any = {
        headers: {
          id: claimId,
        },
      };

      this.$claim.editClaim(moveToDraftConfig).subscribe({
        next: (res: any) => {
          this.saveAsDraftLoadingMap[draftKey] = false;

          if (!res?.status) {
            this.$common?.showMessage?.(res?.message || 'Save as draft failed.');
            return;
          }

          this.dataList = this.dataList.filter(
            (elem: any) =>
              (elem?.yatClaimDTO?.claimId || elem?.claimId || elem?.formId) != claimId
          );

          this.$common?.showMessage?.(res?.message || 'Form saved to draft successfully.');
          this.router.navigateByUrl(this.$auth.getModuleName() + `/draft`);
        },
        error: (err) => {
          this.saveAsDraftLoadingMap[draftKey] = false;
          this.$common?.showMessage?.('Something went wrong while moving the form to draft.');
          console.error(err);
        },
      });
      return;
    }

    const moveToDraftConfig: any = {
      headers: {
        formId: data.formId,
      },
    };

    this.$formState.saveAsDraft(moveToDraftConfig).subscribe({
      next: (res: any) => {
        this.saveAsDraftLoadingMap[draftKey] = false;

        if (!res?.status) {
          this.$common?.showMessage?.(res?.message || 'Save as draft failed.');
          return;
        }

        const movedForm = res?.object?.[0] || data;
        const editUrl = this.$auth.getFormEditUrl(movedForm, {
          formId: movedForm?.id || data?.formId,
          formUrl:
            movedForm?.formUrl ||
            movedForm?.codeSubFormDTO?.formUrl ||
            data?.formUrl,
          subFormId:
            movedForm?.subFormId ||
            movedForm?.codeSubFormDTO?.subFormId ||
            data?.subFormId,
        });

        this.dataList = this.dataList.filter(elem => elem?.formId != data?.formId);

        if (!editUrl) {
          this.$common?.showMessage?.(
            'Form saved to draft successfully, but edit page could not be opened.'
          );
          this.router.navigateByUrl(this.$auth.getModuleName() + `/draft`);
          return;
        }

        this.$common?.showMessage?.(res?.message || 'Form saved to draft successfully.');
        this.router.navigateByUrl(editUrl);
      },
      error: (err) => {
        this.saveAsDraftLoadingMap[draftKey] = false;
        this.$common?.showMessage?.('Something went wrong while moving the form to draft.');
        console.error(err);
      },
    });
  }

}
