import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { ApproverService } from 'src/app/service/approver.service';
import * as crypto from 'crypto-js';

declare var $: any;

@Component({
    selector: 'app-manage-approver',
    templateUrl: './manage-approver.component.html',
    styleUrls: ['./manage-approver.component.scss'],
    standalone: false
})
export class ManageApproverComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $approver: ApproverService,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  p: any = 1;
  pageName: any;
  searchObj: any;
  noOfPage: any = 10;

  config: any;
  formObj: any = {};

  userIdDetails;
  codeRoleList;
  codeStatusList;

  showPassword = false;

  ngOnInit(): void {

    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();

    this.initialStrongPassword();
    this.getAll();
  }

  saveRecord() {
    try {
      if (this.strongPasswordObj.isDisabled) {
        return this.$common.showMessage("Password is not complex", 'danger');
      }
      this.$common.showLoader();
      let formObj = {
        ...this.formObj,
        roleId: 'IHQAP',
        // userId:this.userIdDetails.userId,
        // unitId:this.userIdDetails.unitId,
        // unitName: this.userIdDetails.unitName,
      }

      let passwordHelp = formObj.passwordHelp;
      let passwordEncrypted = encodeURIComponent(crypto.AES.encrypt(formObj.passwordHelp, "password").toString());
      formObj.passwordHelp = passwordEncrypted;
      this.$approver.createOrUpdate(formObj).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            
            let object = response.object[0];
            object.passwordHelp = passwordHelp;
            this.dataList.push(object);
            this.reset();
          }
        },
        (err) => {
          console.log(err);
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          roleTypeId: this.userIdDetails.roleTypeId,
        },
      };
      this.$approver.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;

            this.dataList = list?.map((item) => {
              if (item?.passwordHelp) {
                let plainPassword = crypto.AES.decrypt(item?.passwordHelp, "password").toString(crypto.enc.Utf8);
                item.passwordHelp = plainPassword;
              }
              return item;
            });
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

  reset() {
    this.formObj = {};
    this.requiredForm.resetForm();

    this.initialStrongPassword();
  }
  goBack() {
    if (window.history.length > 1) {
     this.reset();
      this.location.back();
    } else {
      window.close();
    }
  }
  // data shorting starts
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting ends

  tempObj;
  openChangeStatusModal(data, statusCode) {
    this.tempObj = { ...data };
    this.tempObj.currentStatus = statusCode;
  }

  changeStatus(tempObj) {
    try {
      if (tempObj?.id == this.userIdDetails?.roleId) {
        return this.$common.showMessage("You can't Deactivate yourself.", 'danger');
      }
      var config = {
        headers: {
          "userId": tempObj.userId,
          "statusId": tempObj.currentStatus
        }
      }
      this.$approver.changeStatus(config).subscribe(response => {
        if (response.status === true) {
          tempObj.codeStatusDTO.id = tempObj.currentStatus;
          this.$common.showMessage(`${response.message}`);
        }
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  // Strong password validation start

  strongPasswordObj: any = {};
  initialStrongPassword() {
    this.strongPasswordObj = {
      checkSmall: 0,
      checkCaptial: 0,
      checkNumber: 0,
      checkSpecial: 0,
      checkLength: 0,
      isDisabled: true,
    }
  }

  handleNewPassword() {
    let password = this.formObj?.passwordHelp;
    if (password?.match(/[a-z]/) != null) this.strongPasswordObj.checkSamll = true;
    else this.strongPasswordObj.checkSamll = false;

    if (password?.match(/[A-Z]/) != null) this.strongPasswordObj.checkCaptial = true;
    else this.strongPasswordObj.checkCaptial = false;

    if (password?.match(/[0-9]/) != null) this.strongPasswordObj.checkNumber = true;
    else this.strongPasswordObj.checkNumber = false;

    if (password?.match(/[!@#$%^&*]/) != null) this.strongPasswordObj.checkSpecial = true;
    else this.strongPasswordObj.checkSpecial = false;

    if (password?.match(/[!@#$%^&*]/) != null) this.strongPasswordObj.checkSpecial = true;
    else this.strongPasswordObj.checkSpecial = false;

    if (password?.length >= 8) this.strongPasswordObj.checkLength = true;
    else this.strongPasswordObj.checkLength = false;

    if (password?.match(/[a-z]/) && password?.match(/[A-Z]/) && password?.match(/[0-9]/) && password?.match(/[!@#$%^&*]/) && password?.length > 7 && password != null) {
      this.strongPasswordObj.isDisabled = false;
    }
    else this.strongPasswordObj.isDisabled = true;
  }
  // Strong password validation end
}
