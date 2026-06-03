import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { UserService } from 'src/app/service/admin/user.service';
import { HttpParams } from '@angular/common/http';
import * as crypto from 'crypto-js';

declare var $: any;

@Component({
    selector: 'app-common-change-password',
    templateUrl: './common-change-password.component.html',
    styleUrls: ['./common-change-password.component.css'],
    standalone: false
})
export class CommonChangePasswordComponent implements OnInit {

  constructor(private $user: UserService, private $common: CommonService, public $auth: AuthService) { }
  @ViewChild('f', { static: true }) changepasswordform: NgForm;
  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.initialStrongPassword();
  }
  passwordObj: any = {};
  disableBtn: boolean = false;
  userIdDetails;
  savePassword() {
    try {
      if (this.passwordObj.nPassword != this.passwordObj.cPassword) {
        return this.$common.showMessage("Password not match", 'danger');
      }
      if(this.strongPasswordObj.isDisabled){
        return this.$common.showMessage("Password is not complex", 'danger');
      }
      this.$common.showLoader();
      this.disableBtn = true;

      let password = this.passwordObj.password;
      let nPassword = this.passwordObj.nPassword;
      
      let oldPass = encodeURIComponent(crypto.AES.encrypt(password, "password").toString());
      let newPass = encodeURIComponent(crypto.AES.encrypt(nPassword, "newpassword").toString());
      let config = {
        headers : {
          "userId": this.userIdDetails.userId,
          "oldPass": oldPass,
          "newPass": newPass
        } 
      }
      this.$user.changePassword(config).subscribe(response => {
        this.$common.hideLoader();
        this.disableBtn = false;
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.changepasswordform.resetForm();
          this.initialStrongPassword();
          // this.refreshToken();
        }
      }, err => {
        this.$common.hideLoader();
        this.disableBtn = false;
      })
    } catch (error) {
      this.$common.hideLoader();
      this.disableBtn = false;
    }
  }

  reset() {
    this.passwordObj = {};
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
    let nPassword = this.passwordObj?.nPassword;

    if (nPassword.match(/[a-z]/) != null) this.strongPasswordObj.checkSamll = true;
    else this.strongPasswordObj.checkSamll = false;

    if (nPassword.match(/[A-Z]/) != null) this.strongPasswordObj.checkCaptial = true;
    else this.strongPasswordObj.checkCaptial = false;

    if (nPassword.match(/[0-9]/) != null) this.strongPasswordObj.checkNumber = true;
    else this.strongPasswordObj.checkNumber = false;

    if (nPassword.match(/[!@#$%^&*]/) != null) this.strongPasswordObj.checkSpecial = true;
    else this.strongPasswordObj.checkSpecial = false;

    if (nPassword.match(/[!@#$%^&*]/) != null) this.strongPasswordObj.checkSpecial = true;
    else this.strongPasswordObj.checkSpecial = false;

    if (nPassword.length >= 8) this.strongPasswordObj.checkLength = true;
    else this.strongPasswordObj.checkLength = false;

    if (nPassword.match(/[a-z]/) && nPassword.match(/[A-Z]/) && nPassword.match(/[0-9]/) && nPassword.match(/[!@#$%^&*]/) && nPassword.length > 7 && nPassword != null) {
      this.strongPasswordObj.isDisabled = false;
    }
    else this.strongPasswordObj.isDisabled = true;
  }
  // Strong password validation end


  refreshToken() {
    try {
      this.$common.showLoader();
      var tokenObject = this.$auth.getTokenDetails();
      var params = new HttpParams();
      params = params.append('refresh_token', tokenObject.refreshToken);
      params = params.append('grant_type', 'refresh_token');
      params = params.append('is_login', '0');
      this.$auth.refresh(params).subscribe((response) => {
        this.$auth.createSession(response, 'REFRESH');
        this.$common.hideLoader();
      }, (err) => {
        console.log(err);
        this.$common.hideLoader();
      });
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

}
