import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as crypto from 'crypto-js';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { OtpService } from 'src/app/service/auth/otp.service';
import { environment } from 'src/environments/environment';
import { SecurityService } from 'src/app/service/auth/security.service';

declare var $: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit {

  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    public $otp: OtpService,
    private router: Router,
    public $security: SecurityService,
  ) { }

  @ViewChild('loginValidation', { static: true }) loginValidation: NgForm;
  loginForm: any = {
    'loginType': 'SMS'
  };

  disableBtn: boolean = false;
  isRecaptcha = environment.recaptcha.isEnabled;
  isTextCaptcha = environment.recaptcha.textCaptchaEnabled ?? true;
  config;
  userIdDetails;
  buildNo = environment.appConfig.buildNo;


  ngOnInit(): void {
    setTimeout(() => {
      this.userIdDetails = this.$auth.getUserDetails();
    }, 1000);
    this.checkSession();
    if (this.isTextCaptcha) {
      this.captchaGenerate();
    }
  }

  response
  recordObj: any = {}
  login() {
    // if (this.loginForm.loginType == "TOTP") {
    //   this.recordObj = this.loginForm;
    //   $("#verify_totp_modal").modal("show");
    // } else {
    //   this.sendOtp();
    // }

    if (this.isTextCaptcha && this.yourCaptcha != this.loginForm?.captcha) {
      this.captchaGenerate();
      return this.$common.showMessage("Please enter a valid captcha", 'danger');
    }
    const recaptchaToken = this.loginForm?.captcha;
    if (this.isRecaptcha && recaptchaToken?.length === 0) {
      return this.$common.showMessage("Please enter a valid captcha", 'danger');
    }
    this.$common.showLoader();
    this.disableBtn = true;

    this.mainLogin();

  }

  async sendOtp() {
    try {
      if (this.isTextCaptcha && this.yourCaptcha != this.loginForm?.captcha) {
        this.captchaGenerate();
        return this.$common.showMessage("Please enter a valid captcha", 'danger');
      }
      const recaptchaToken = this.loginForm?.captcha;
      if (this.isRecaptcha && recaptchaToken?.length === 0) {
        return this.$common.showMessage("Please enter a valid captcha", 'danger');
      }
      this.$common.showLoader();
      this.disableBtn = true;

      let clientIp;
      try {
        clientIp = await this.$common.getClientIp();
      } catch (error) {
        console.log(error);
        clientIp = error?.error?.text;
      }

      let username = this.loginForm.username;
      let password = this.loginForm.password;
      let otpType = this.loginForm.loginType;

      let usernameEncrypted = encodeURIComponent(crypto.AES.encrypt(username, "username").toString());
      let passwordEncrypted = encodeURIComponent(crypto.AES.encrypt(password, "password").toString());
      let otpTypeEncrypted = encodeURIComponent(crypto.AES.encrypt(otpType, "otpType").toString());
      let loginIpAddressEncrypted = encodeURIComponent(crypto.AES.encrypt(clientIp, "clientIp").toString());
      let req = {
        "username": usernameEncrypted,
        "password": passwordEncrypted,
        "otpType": otpTypeEncrypted,
        "loginIPAddress": loginIpAddressEncrypted,
      }
      this.$otp.sendOtp(req).subscribe(response => {
        this.$common.hideLoader();
        this.disableBtn = false;
        if (response.status === true) {
          
          this.recordObj = response?.object[0];
          if (this.recordObj.userId) {
            this.recordObj.userId = crypto.AES.decrypt(this.recordObj.userId, "otpUserId").toString(crypto.enc.Utf8);
          }
          if (this.recordObj.phone) {
            this.recordObj.phone = crypto.AES.decrypt(this.recordObj.phone, "phoneNo").toString(crypto.enc.Utf8);
          }
          if (this.recordObj.email) {
            this.recordObj.email = crypto.AES.decrypt(this.recordObj.email, "email").toString(crypto.enc.Utf8);
          }
          if (this.recordObj?.otp) {
            let otp = crypto.AES.decrypt(this.recordObj?.otp, "otp").toString(crypto.enc.Utf8);
            this.$common.showMessage(otp);
          }
          $("#verify_otp_modal").modal("show");
        } else {
          this.$common.showMessage(response.message, 'danger');
        }
        this.captchaGenerate();
      }, err => {
        this.$common.hideLoader();
        this.disableBtn = false;
        console.log(err);
        this.captchaGenerate();
      })
    } catch (error) {
      this.$common.hideLoader();
      this.disableBtn = false;
      console.log(error);
      this.captchaGenerate();
    }
  }

  mainLogin() {
    var params = new HttpParams();
    let username = this.loginForm.username;
    let password = this.loginForm.password;
    // let clientIp;
    // try {
    //   clientIp = await this.$common.getClientIp();
    // } catch (error) {
    //   console.log(error);
    //   clientIp = error?.error?.text;
    // }

    let usernameEncrypted = encodeURIComponent(crypto.AES.encrypt(username, "username").toString());
    let passwordEncrypted = encodeURIComponent(crypto.AES.encrypt(password, "password").toString());
    const runtimeModuleId = this.$auth.getRuntimeModuleId();
    let moduleIdEncrypted = encodeURIComponent(crypto.AES.encrypt(runtimeModuleId, "moduleId").toString());
    params = params.append(
      'username',
      usernameEncrypted + '---' + passwordEncrypted + '---' + moduleIdEncrypted
    );
    params = params.append('password', passwordEncrypted);
    params = params.append('grant_type', 'password');
    params = params.append('is_login', '1');
    this.$auth.login(params).subscribe(
      (response) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        // $("#verify_otp_modal").modal("hide");
        this.$common.showMessage(`Login Successfully`);
        this.$auth.createSession(response, 'LOGIN');
      },
      (err) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        console.log(err);
        if (err.status == 401) {
          this.$common.showMessage(
            "That's not the right password or Username. Please try again.",
            'danger'
          );
        } else {
          const errMsg = err?.error?.error_description || 'Login failed. Please try again.';
          this.$common.showMessage(errMsg, 'danger');
        }
      }
    );
  }

  checkSession() {
    if (this.$auth.getUserDetails() === null) {
      return;
    }
    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(moduleUrl + "/dashboard");
  }

  yourCaptcha;
  captchaGenerate() {
    if(this.loginForm) this.loginForm.captcha = "";
    let alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'
      , 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
      'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '+'];
    let a = alpha[Math.floor(Math.random() * 71)];
    let b = alpha[Math.floor(Math.random() * 71)];
    let c = alpha[Math.floor(Math.random() * 71)];
    let d = alpha[Math.floor(Math.random() * 71)];
    let e = alpha[Math.floor(Math.random() * 71)];
    let f = alpha[Math.floor(Math.random() * 71)];
    let captcha = a + b + c + d + e + f;
    this.yourCaptcha = captcha;
  }

  forgotPassword() {
    $("#forgotPasswordModal").modal("show");
  }
  onPaste(event: ClipboardEvent): void {
    if(environment.production){
      event.preventDefault();
    }
  }
}

