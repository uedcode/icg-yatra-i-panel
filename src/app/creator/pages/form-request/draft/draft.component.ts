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
    selector: 'app-draft',
    templateUrl: './draft.component.html',
    styleUrls: ['./draft.component.scss'],
    standalone: false
})
export class DraftComponent implements OnInit {
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    public $formManage: FormManageService,
    private $claim: ClaimService,
  ) { }

  @Input() dataList: Array<any> = [];
  // @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  formObj: any = {};
  rowId: any;
  noOfPage: any = 10;
  p = 1;
  searchObj;


  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  filterDataObj
  getState() {
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.draft,
      },
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  deleteRow(id) {
    const claimId = this.rowId;
    if (claimId) {
      const config = {
        headers: {
          ids: [claimId],
        },
      };

      this.$claim.deleteClaim(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.filter(
              (elem: any) =>
                (elem?.yatClaimDTO?.claimId || elem?.claimId || elem?.formId || elem?.id) != claimId
            );
          }
          this.rowId = null;
          $('#delete_modal').modal('hide');
        },
        () => {
          this.$common.hideLoader();
        }
      );
      return;
    }

    let config = {
      headers: {
        ids: id,
      },
    };

    this.$form.delete(config).subscribe(
      (response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter((elem) => elem.formId != id);
        }
        $('#delete_modal').modal('hide');
      },
      (err) => {
        this.$common.hideLoader();
      }
    );

  }

  reset() {
    this.formObj = {};
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  // data shorting start
  key: string = 'updatedOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  private getCreatorClaimRoute(subFormId: string | null): string | null {
    const id = (subFormId || '').toUpperCase();
    if (id === 'P') return 'form-pmt';
    if (id === 'T') return 'form-tyduty';
    if (id === 'F') return 'form-fte';
    if (id === 'L') return 'form-ltc';
    return null;
  }

  actionPage(data) {
    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    const subFormId =
      claim?.codeSubFormDTO?.subFormId ||
      data?.subFormId ||
      data?.codeSubFormDTO?.subFormId;
    const route = this.getCreatorClaimRoute(subFormId);

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() + `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl +
      `/${data?.formUrl}?id=${data.formId}&subFormId=${data.subFormId}`
    );
  }

  setDeleteTarget(data: any) {
    this.id = data?.formId || data?.id;
    this.rowId = data?.yatClaimDTO?.claimId || data?.claimId || null;
  }
}
