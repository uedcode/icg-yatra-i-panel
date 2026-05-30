import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { NgOtpInputComponent } from 'ng-otp-input';
import { OtpService } from 'src/app/service/otp.service';
import * as crypto from 'crypto-js';
declare var $: any;

@Component({
    selector: 'app-verify-otp-modal',
    templateUrl: './verify-otp-modal.component.html',
    styleUrls: ['./verify-otp-modal.component.css'],
    standalone: false
})
export class VerifyOtpModalComponent implements OnInit {

  constructor(private $common: CommonService,
    public $auth: AuthService,
    public $otp: OtpService,) {
  }

  @Input() record: any;
  @Output() setRecordData = new EventEmitter();
  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  formObj: any = {};
  config;

  seconds: any = 60;
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
      let userIdEncrypted = encodeURIComponent(crypto.AES.encrypt(this.record?.userId, "otpUserId").toString());
      let userOtpEncrypted = encodeURIComponent(crypto.AES.encrypt(otp, "otp").toString());
      let req = {
        "userId": userIdEncrypted,
        "otp": userOtpEncrypted,
        "type": this.record?.name
      }
      this.$otp.verifyOtp(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          var object = response.object;
          let requestUserId = this.record?.userId;
          let responseUserId = crypto.AES.decrypt(object.userId, "otpUserId").toString(crypto.enc.Utf8);
          if (requestUserId != responseUserId) {
            return this.$common.showMessage("Security key Missing", 'danger');
          }
          let requestOtp = crypto.AES.decrypt(decodeURIComponent(userOtpEncrypted), "otp").toString(crypto.enc.Utf8);
          let responseOtp = crypto.AES.decrypt(object.otp, "otp").toString(crypto.enc.Utf8);
          if (requestOtp != responseOtp) {
            return this.$common.showMessage("Security key Missing", 'danger');
          }
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

  recordObj;
  resendOtp() {
    try {
      this.$common.showLoader();
      let userIdEncrypted = encodeURIComponent(crypto.AES.encrypt(this.record?.userId, "otpUserId").toString());
      let req = {
        "userId": userIdEncrypted,
        "type": 'L',
      }
      this.$otp.sendOtp(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.seconds = 60;
          this.getTime();

          this.recordObj = response?.object[0];
          if (this.recordObj?.otp) {
            let otp = crypto.AES.decrypt(this.recordObj?.otp, "otp").toString(crypto.enc.Utf8);
            this.$common.showMessage(otp);
            this.record = { ...this.record, otp: otp };
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
      this.seconds = 60;
      this.getTime();
    }
  }

  onOtpChange(otp) {
    if (otp.length === 4) {
      this.verifyOtp(otp);
    }
  }

  captchaGenerate() {
    this.captcha = "";
  }

  closeModal() {
    this.ngOtpInput.setValue("");
    this.formObj = {};
    $("#verify_otp_modal").modal("hide");
  }

}

