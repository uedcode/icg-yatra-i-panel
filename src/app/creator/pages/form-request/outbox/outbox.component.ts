import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { ClaimService } from 'src/app/service/claim.service';
declare var $: any;

@Component({
    selector: 'app-outbox',
    templateUrl: './outbox.component.html',
    styleUrls: ['./outbox.component.scss'],
    standalone: false
})
export class OutboxComponent implements OnInit {
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    private datePipe: DatePipe,
    public $formManage: FormManageService,
    private $codeSubForm: CodeSubFormService,
    private $claim: ClaimService
  ) {}

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  filterObj: any = {};

  noOfPage: any = 10;
  p = 1;
  searchObj;
  toggleFilter: any = false;
  formList;
  today;

  ngOnInit() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
    this.getForm();
  }

  getForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.userIdDetails?.formId,
        },
      };
      this.$codeSubForm.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.formList = response?.object;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  filterDataObj;
  getState() {
    const config = {
      headers: {
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
        gxUnitId: this.userIdDetails?.unitId,
        claimState: this.codeStatus?.outbox,
      },
    };
    this.$claim.getClaimStates(config).subscribe((res: any) => {
      const claimStates = Array.isArray(res?.object) ? res.object : [];
      this.dataList = claimStates.filter((item: any) => this.matchesDateFilter(item));
    });
  }

  private matchesDateFilter(item: any): boolean {
    const createdOn = item?.yatClaimDTO?.createdOn || item?.createdOn;
    const createdAt = createdOn ? new Date(createdOn).getTime() : null;
    const fromDate = this.filterObj?.fromDate ? new Date(this.filterObj.fromDate).getTime() : null;
    const toDate = this.filterObj?.toDate
      ? new Date(this.filterObj.toDate).setHours(23, 59, 59, 999)
      : null;

    if (!createdAt) {
      return !fromDate && !toDate;
    }

    if (fromDate && createdAt < fromDate) {
      return false;
    }

    if (toDate && createdAt > toDate) {
      return false;
    }

    return true;
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
    const route = this.getCreatorClaimRoute(subFormId, true);

    if (claimId && route) {
      this.router.navigateByUrl(
        this.$auth.getModuleName() +
          `/${route}?claimId=${claimId}&subFormId=${subFormId}`
      );
      return;
    }

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?id=${data.formId}`
    );
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
  reset() {
    this.filterObj = {};
    this.getState();
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}
