import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { FormStateApiService } from 'src/app/service/api/form/form-state-api.service';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';
declare var $: any;

@Component({
    selector: 'app-common-change-status-action',
    templateUrl: './common-change-status-action.component.html',
    styleUrls: ['./common-change-status-action.component.css'],
    standalone: false
})
export class CommonChangeStatusActionComponent implements OnInit {
  @Input() isSignRequired: any;
  @Input() claimAmt: any;
  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    public $formState: FormStateApiService,
    private route: ActivatedRoute,
    private $roleApi: RoleApiService,
    private router: Router
  ) { }

  @Output() hideChangeStatusBtn = new EventEmitter();

  formObj: any = {};
  codeStatus;
  userIdDetails;
  codeRoleList;
  formId;
  actionBtnShow: any = true;
  tempFormObj: any;

  isVerifier1Role(): boolean {
    return this.userIdDetails?.roleTypeId == this.codeRoleList?.verifier1;
  }

  isApprovingRole(): boolean {
    return (
      this.userIdDetails?.roleTypeId == this.codeRoleList?.verifier2 ||
      this.userIdDetails?.roleTypeId == this.codeRoleList?.approver
    );
  }

  ngOnInit() {
    this.codeStatus = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();

    this.formObj.billAmount = this.claimAmt;
    this.route.queryParams.subscribe((params) => {
      this.formId = params?.id;
    });
    this.getReturnUserList();
    this.getForwardToList();
  }

  state;
  actionType;
  sureForChangeStatus(state, actionType) {
    this.actionType = actionType;
    this.state = state;
    // if (this.userIdDetails?.isSign && this.actionType == this.codeRoleList?.approver) {
    //   this.tempFormObj = { id: this.formId };
    //   return;
    // }
    if (actionType == 'AP') {
      this.formObj.remark = 'Approved'
    }

    else if (actionType == 'VE') {
      this.formObj.remark = 'Verified'
    }
    else if (actionType == 'RT') {
      this.formObj.remark = 'Returned'
    }
    else if (actionType == 'RJ') {
      this.formObj.remark = 'Rejected'
    }
    else if (actionType == 'FW') {
      this.formObj.remark = 'Forwarded'
    }
    $('#form_change_status_modal').modal('show');
  }

  handelChangeStatus() {

    if (this.codeRoleList?.ihqStaff == this.userIdDetails?.roleTypeId) {
      this.changeConfirmByIhq();
    } else {
      if (this.isSignRequired == '1' && (this.state == 'OB' || this.state == 'AP')) {
        this.tempFormObj = { id: this.formId };
        this.tempFormObj.formRemarks = this.formObj?.remark;
        this.tempFormObj.status = this.state;
        //this.tempFormObj.recommendedAmount = this.formObj?.recommendedAmount;
        this.tempFormObj.billAmount = this.formObj?.billAmount;
        this.tempFormObj.balanceAmount = this.formObj?.balanceAmount;
        this.tempFormObj.allotedBudget = this.formObj?.allotedBudget;
        this.tempFormObj.progressiveExpenditureAmt = this.formObj?.progressiveExpenditureAmt;
        this.tempFormObj.balance = this.formObj?.balance;
        // this.changeConfirm();
      } else {
        this.changeConfirm();
      }
    }
  }

  changeConfirm() {
    try {
      let req = {
        roleTypeId: this.userIdDetails?.roleTypeId,
        desigId: this.userIdDetails?.desigId,
        status: this.state,
        unitId: this.userIdDetails?.unitId,
        formId: this.formId,
        remark: this.formObj?.remark,
        recommendedAmount: this.formObj?.recommendedAmount,
        allotedBudget: this.formObj?.allotedBudget,
        balanceAmt: this.formObj?.balanceAmount,
        roleDesigId: this.formObj?.roleDesigId,
        progressiveExpenditureAmt: this.formObj?.progressiveExpenditureAmt,
        billAmt: this.formObj?.billAmount,
      };

      this.$formState.changeStatusById(req).subscribe(
        (response) => {
          if (response.status === true) {

            this.$common.showMessage(`${response.message}`);
            $('#form_change_status_modal').modal('hide');
            this.hideChangeStatusBtn.emit(false);
            this.actionBtnShow = false;

            if (this.actionType == 'VE' || this.actionType == 'RT') {
              let moduleUrl = this.$auth.getModuleName();
              this.router.navigateByUrl(moduleUrl + `/inbox`);
              // } else if (this.actionType == 'AP') {
              //   let moduleUrl = this.$auth.getModuleName();
              //   this.router.navigateByUrl(moduleUrl + `/approved`);
            } else if (this.actionType == 'RJ') {
              let moduleUrl = this.$auth.getModuleName();
              this.router.navigateByUrl(moduleUrl + `/rejected`);
            } else if (this.actionType == 'AP') {
              let moduleUrl = this.$auth.getModuleName();
              this.router.navigateByUrl(moduleUrl + `/approved`);
            }

            this.actionType = '';
          }
        },
        (err) => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }


  changeConfirmByIhq() {
    try {

      console.log(this.userIdDetails);
      let req = {
        formId: this.formId,
        status: this.state,
        recommendedAmount: this.formObj?.amount,
        userId: this.userIdDetails?.userId,
        remark: this.formObj?.remark,
        // roleTypeId: this.userIdDetails?.roleTypeId,
        // unitId: this.userIdDetails?.unitId,
        // codeFormId: this.userIdDetails?.formId,
      };
      if (this.state == 'RT') req.status = 'NA';
      this.$formState.changeStatusByIhq(req).subscribe(
        (response) => {
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            $('#form_change_status_modal').modal('hide');
            this.hideChangeStatusBtn.emit(false);
            this.actionBtnShow = false;

            // let moduleUrl = this.$auth.getModuleName();
            // this.router.navigateByUrl(moduleUrl + `/inbox`);
            if (this.isSignRequired == '1' && (this.state == 'OB' || this.state == 'AP')) {
              this.tempFormObj = { id: this.formId };
              this.tempFormObj.formRemarks = this.formObj?.remark;
              this.tempFormObj.status = this.state;
              this.tempFormObj.recommendedAmount = this.formObj?.recommendedAmount;
              this.tempFormObj.allotedBudget = this.formObj?.allotedBudget;
              this.tempFormObj.progressiveExpenditureAmt = this.formObj?.progressiveExpenditureAmt;
              this.tempFormObj.billAmt = this.formObj?.billAmount;
              this.tempFormObj.balance = this.formObj?.balance;
              this.tempFormObj.balanceAmt = this.formObj?.balanceAmount;
            }
            this.actionType = '';
          }
        },
        (err) => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  returnUserList: any = [];
  getReturnUserList() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {
          formId: this.formId,
          roleTypeId: this.userIdDetails.roleTypeId,
          desigId: this.userIdDetails.desigId
        },
      };
      this.$formState.getReturnUsers(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.returnUserList = response.object;
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

  forwardToList: any = [];
  getForwardToList() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {
          // formId: this.formId,
          roleTypeId: this.userIdDetails.roleTypeId,
          desigId: this.userIdDetails.desigId,
          userId: this.userIdDetails.userId
        },
      };
      this.$roleApi.getRolesByUser(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            
            this.forwardToList = response.object;
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

  calculateBalance() {
    if (this.formObj.balanceAmount !== null && this.formObj.billAmount !== null) {
      let balance = this.formObj.balanceAmount - this.formObj.billAmount;
      if (balance > 0) {
        this.formObj.balance = balance;
      } else {
        this.formObj.balance = 0;
      }
    }
  }

}

