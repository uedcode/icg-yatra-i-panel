import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { ClaimService } from 'src/app/service/claim.service';
declare var $: any;

@Component({
    selector: 'app-passed',
    templateUrl: './passed.component.html',
    styleUrls: ['./passed.component.scss'],
    standalone: false
})
export class PassedComponent implements OnInit {

  codeStatus: { activate: string; deactivate: string; pending: string; passed: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    public $formManage: FormManageService,
    private router: Router,
    private $claim: ClaimService,
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
        claimState: this.codeStatus?.passed,
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

  createSupplementry(data) {
    const claim = data?.yatClaimDTO || {};
    const subFormId =
      claim?.codeSubFormDTO?.subFormId ||
      data?.subFormId ||
      data?.codeSubFormDTO?.subFormId;
    const claimId = claim?.claimId || data?.claimId || data?.formId;

    if (subFormId && subFormId.toUpperCase() !== 'PL') {
      this.$common.showMessage('Supplementary flow is only available for Pilotage records right now.', 'danger');
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      `${moduleUrl}/form-pilotage?subFormId=${subFormId || data.subFormId}&supId=${claimId || data.formId}`
    );
  }
  viewForm(data) {
    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    const subFormId =
      claim?.codeSubFormDTO?.subFormId ||
      data?.subFormId ||
      data?.codeSubFormDTO?.subFormId;
    const route = this.getCreatorClaimRoute(subFormId, true);

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?id=${data.formId}`
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

}
