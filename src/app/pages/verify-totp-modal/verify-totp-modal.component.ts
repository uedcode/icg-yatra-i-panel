import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import * as crypto from 'crypto-js';
import { NgOtpInputComponent } from 'ng-otp-input';
import { OtpApiService } from 'src/app/service/api/security/otp-api.service';

declare var $: any;

@Component({
    selector: 'app-verify-totp-modal',
    templateUrl: './verify-totp-modal.component.html',
    styleUrls: ['./verify-totp-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VerifyTotpModalComponent implements OnInit {

  constructor(private $common: CommonService,
    public $auth: AuthService,
    public $otp: OtpApiService,) {
  }

  @Input() record: any;
  @Output() setRecordData = new EventEmitter();
  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  formObj: any = {};
  config;

  seconds: any = 30;
  timeInt;

  captchaError: boolean = false;

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.timeInt) {
      clearInterval(this.timeInt);
    }
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

  captcha = "";
  verifyOtp(otp) {
    try {
      const recaptchaToken = this.captcha;
      // if (recaptchaToken?.length === 0) {
      //   this.captchaError = true;
      //   return this.$common.showMessage("Please enter a valid captcha", 'danger');
      // }
      this.$common.showLoader();
      let username = encodeURIComponent(crypto.AES.encrypt(this.record?.username, "username").toString());
      let password = encodeURIComponent(crypto.AES.encrypt(this.record?.password, "password").toString());
      otp = encodeURIComponent(crypto.AES.encrypt(otp, "otp").toString())
      let req = {
        "username": username,
        "password": password,
        "otp": otp,
      }
      
      this.$otp.verifyTOtp(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.setRecordData.emit(recaptchaToken);
          this.closeModal();
        }
        this.captchaGenerate();
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


  resendOtp() {
    try {
      this.$common.showLoader();
      let req = {
        "userId": encodeURIComponent(this.record?.userId),
        "type": 'L',
      }
      this.$otp.sendOtp(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.seconds = 30;
          this.getTime();
          if (response?.object?.otp) {
            this.$common.showMessage(response?.object?.otp);
            this.record = { ...this.record, otp: response?.object?.otp };
            this.ngOtpInput.setValue("");
          }
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

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.seconds = 30;
      this.getTime();
    }
  }

  onOtpChange(otp) {
    if (otp.length === 6) {
      this.verifyOtp(otp);
    }
  }

  captchaGenerate() {
    this.captcha = "";
  }

  closeModal() {
    this.ngOtpInput.setValue("");
    this.formObj = {};
    $("#verify_totp_modal").modal("hide");
  }

}

