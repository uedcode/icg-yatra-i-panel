import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
declare var $: any;
import * as crypto from 'crypto-js';
import { NgOtpInputComponent } from 'ng-otp-input';
import { environment } from 'src/environments/environment';
import { OtpApiService } from 'src/app/service/api/security/otp-api.service';

@Component({
    selector: 'app-forgot-password-modal',
    templateUrl: './forgot-password-modal.component.html',
    styleUrls: ['./forgot-password-modal.component.css'],
    standalone: false
})
export class ForgotPasswordModalComponent implements OnInit {

  constructor(private $common: CommonService,
    public $auth: AuthService,
    public $otp: OtpApiService,
  ) {
  }

  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  formObj: any = {};
  config;
  seconds: any = 30;
  resetPasswordObj: any = {};
  passwordObj: any = {};
  otp;
  isRecaptcha = environment.recaptcha.isEnabled;
  isTextCaptcha = environment.recaptcha.textCaptchaEnabled ?? true;
  
  showEnterPno: boolean = true;
  showEnterOtp: boolean = false;
  showResetPassword: boolean = false;

  timeInt;
  ngOnInit() {
    if (this.isTextCaptcha) {
      this.captchaGenerate();
    }
    this.initialStrongPassword();
  }

  ngOnDestroy() {
    if (this.timeInt) {
      clearInterval(this.timeInt);
    }
    this.getTime();
  }

  getTime() {
    clearInterval(this.timeInt);
    this.timeInt = setInterval(() => {
      if (this.seconds === 0) {
        clearInterval(this.timeInt);
      } else { this.seconds = this.seconds - 1; }
    }, 1000);
    return () => clearInterval(this.timeInt);
  }


  async forgotPassword() {
    // return this.resetPasswordObj={otp:12345}
    try {
      if (this.isTextCaptcha && this.yourCaptcha != this.formObj?.captcha) {
        this.captchaGenerate();
        return this.$common.showMessage("Please enter a valid captcha", 'danger');
      }
      const recaptchaToken = this.formObj?.captcha || '';
      if (this.isRecaptcha && recaptchaToken?.length === 0) {
        return this.$common.showMessage("Please enter a valid captcha", 'danger');
      }
      this.$common.showLoader();
      let clientIp;
      try {
        clientIp = await this.$common.getClientIp();
      } catch (error) {
        console.log(error);
        clientIp = error?.error?.text;
      }
      let req = {
        "pNo": encodeURIComponent(crypto.AES.encrypt(this.formObj?.pNo, "pNo").toString()),
        "recaptchaToken": encodeURIComponent(crypto.AES.encrypt(recaptchaToken, "recaptchaToken").toString()),
        "clientIp": encodeURIComponent(crypto.AES.encrypt(clientIp, "clientIp").toString()),
      }
      
      this.$otp.sendOtpByNumber(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.resetPasswordObj = response?.object[0];
          if (this.resetPasswordObj?.otp) {
            let otp = crypto.AES.decrypt(this.resetPasswordObj?.otp, "otp").toString(crypto.enc.Utf8);
            this.$common.showMessage(otp);
          }
          if (this.resetPasswordObj.phone) {
            this.resetPasswordObj.phone = crypto.AES.decrypt(this.resetPasswordObj.phone, "phoneNo").toString(crypto.enc.Utf8);
          }
          this.seconds = 30;
          this.getTime();
          // this.formObj = {};

          this.showEnterPno = false;
          this.showEnterOtp = true;
          this.captchaGenerate();
        }
      }, err => {
        this.$common.hideLoader();
        console.log(err);
        this.captchaGenerate();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
      this.captchaGenerate();
    }
  }

  async resetPassword() {
    try {
      if (this.otp.length != 4) {
        return this.$common.showMessage('Please enter correct OTP', "danger");
      }
      const recaptchaToken = this.passwordObj?.captcha || '';
      if (this.isRecaptcha && recaptchaToken?.length === 0) {
        return this.$common.showMessage("Please enter a valid captcha", 'danger');
      }
      if (this.passwordObj.password != this.passwordObj.cPassword) {
        return this.$common.showMessage("Password not match", 'danger');
      }
      if(this.strongPasswordObj.isDisabled){
        return this.$common.showMessage("Password is not complex", 'danger');
      }
      this.$common.showLoader();
      let clientIp;
      try {
        clientIp = await this.$common.getClientIp();
      } catch (error) {
        console.log(error);
        clientIp = error?.error?.text;
      }
      let userOtpEncrypted = encodeURIComponent(crypto.AES.encrypt(this.otp, "otp").toString());
      let type = this.resetPasswordObj?.name ? this.resetPasswordObj?.name : '';
      let req = {
        "userId": encodeURIComponent(this.resetPasswordObj?.userId),
        "newPass": encodeURIComponent(crypto.AES.encrypt(this.passwordObj?.password, "newpassword").toString()),
        "otp": userOtpEncrypted,
        "type": type,
        // "recaptchaToken": encodeURIComponent(crypto.AES.encrypt(recaptchaToken, "recaptchaToken").toString()),
        // "clientIp": encodeURIComponent(crypto.AES.encrypt(clientIp, "clientIp").toString()),
      }
      
      this.$otp.resetUserPassword(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(response?.message);
          this.closeModal();
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

  resendOtp() {
    try {
      this.$common.showLoader();
      let req = {
        "pNo": encodeURIComponent(crypto.AES.encrypt(this.formObj?.pNo, "pNo").toString()),
        // "recaptchaToken": encodeURIComponent(crypto.AES.encrypt(recaptchaToken, "recaptchaToken").toString()),
        // "clientIp": encodeURIComponent(crypto.AES.encrypt(clientIp, "clientIp").toString()),
      }
      this.$otp.sendOtpByNumber(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.resetPasswordObj = response?.object[0];
          if(this.resetPasswordObj?.otp){
            let otp = crypto.AES.decrypt(this.resetPasswordObj?.otp, "otp").toString(crypto.enc.Utf8);
            this.$common.showMessage(otp);
          }
          if (this.resetPasswordObj.phone) {
            this.resetPasswordObj.phone = crypto.AES.decrypt(this.resetPasswordObj.phone, "phoneNo").toString(crypto.enc.Utf8);
          }
          this.seconds = 30;
          this.getTime();
          // this.formObj = {};
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

  captcha = "";
  verifyOtp(otp) {
    try {
      this.$common.showLoader();
      let userIdEncrypted = encodeURIComponent(this.resetPasswordObj?.userId);
      let userOtpEncrypted = encodeURIComponent(crypto.AES.encrypt(otp, "otp").toString());
      let type = this.resetPasswordObj?.name ? this.resetPasswordObj?.name : '';
      let req = {
        "userId": userIdEncrypted,
        "otp": userOtpEncrypted,
        "type": type
      }
      this.$otp.verifyOtp(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          var object = response.object;
          let requestUserId = crypto.AES.decrypt(this.resetPasswordObj?.userId, "otpUserId").toString(crypto.enc.Utf8);;
          let responseUserId = crypto.AES.decrypt(object.userId, "otpUserId").toString(crypto.enc.Utf8);
          if (requestUserId != responseUserId) {
            return this.$common.showMessage("Security key Missing", 'danger');
          }
          let requestOtp = crypto.AES.decrypt(decodeURIComponent(userOtpEncrypted), "otp").toString(crypto.enc.Utf8);
          let responseOtp = crypto.AES.decrypt(object.otp, "otp").toString(crypto.enc.Utf8);
          if (requestOtp != responseOtp) {
            return this.$common.showMessage("Security key Missing", 'danger');
          }

          this.showEnterOtp = false;
          this.showResetPassword = true;
          this.$common.showMessage(response?.message);
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

  onOtpChange(getOtp) {
    if (getOtp.length === 4) {
      this.otp = getOtp;
      this.verifyOtp(getOtp);
    }
    else {
      this.otp = "";
    }
  }

  closeModal() {
    this.showEnterPno = true;
    this.showEnterOtp = false;
    this.showResetPassword = false;

    this.resetPasswordObj = {};
    this.passwordObj = {};
    this.initialStrongPassword();
    this.formObj = {};
    this.otp = "";

    $("#forgotPasswordModal").modal("hide");
    this.ngOtpInput.setValue("");
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
    let password = this.passwordObj?.password;
    if (password.match(/[a-z]/) != null) this.strongPasswordObj.checkSamll = true;
    else this.strongPasswordObj.checkSamll = false;

    if (password.match(/[A-Z]/) != null) this.strongPasswordObj.checkCaptial = true;
    else this.strongPasswordObj.checkCaptial = false;

    if (password.match(/[0-9]/) != null) this.strongPasswordObj.checkNumber = true;
    else this.strongPasswordObj.checkNumber = false;

    if (password.match(/[!@#$%^&*]/) != null) this.strongPasswordObj.checkSpecial = true;
    else this.strongPasswordObj.checkSpecial = false;

    if (password.match(/[!@#$%^&*]/) != null) this.strongPasswordObj.checkSpecial = true;
    else this.strongPasswordObj.checkSpecial = false;

    if (password.length >= 8) this.strongPasswordObj.checkLength = true;
    else this.strongPasswordObj.checkLength = false;

    if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[!@#$%^&*]/) && password.length > 7 && password != null) {
      this.strongPasswordObj.isDisabled = false;
    }
    else this.strongPasswordObj.isDisabled = true;
  }
  // Strong password validation end

  yourCaptcha;
  captchaGenerate() {
    if(this.formObj) this.formObj.captcha = "";
    let alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'
      , 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
      'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '+'];
    let numeric = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '$', '%', '^', '&', '*', '+'];
    let a = alphabet[Math.floor(Math.random() * 61)];
    let b = alphabet[Math.floor(Math.random() * 61)];
    let c = numeric[Math.floor(Math.random() * 19)];
    let d = alphabet[Math.floor(Math.random() * 61)];
    let e = numeric[Math.floor(Math.random() * 19)];
    let f = alphabet[Math.floor(Math.random() * 61)];
    let captcha = a + b + c + d + e + f;
    this.yourCaptcha = captcha;
  }

  onPaste(event: ClipboardEvent): void {
    if(environment.production){
      event.preventDefault();
    }
  }

}

