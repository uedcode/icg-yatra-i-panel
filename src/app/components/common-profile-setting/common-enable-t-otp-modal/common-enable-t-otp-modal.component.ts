import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { TotpService } from 'src/app/service/auth/totp.service';
import * as crypto from 'crypto-js';
declare var $: any;

@Component({
    selector: 'app-common-enable-t-otp-modal',
    templateUrl: './common-enable-t-otp-modal.component.html',
    styleUrls: ['./common-enable-t-otp-modal.component.css'],
    standalone: false
})
export class CommonEnableTOtpModalComponent implements OnInit {

  constructor(
    private $common: CommonService,
    private $auth: AuthService,
    private $totp: TotpService,
  ) { }

  @Input() hitApi: any;
  @Output() totpStatusTextChange = new EventEmitter();

  formObj: any = {};
  userIdDetails;
  config;
  qrCodeSrc;

  ngOnInit() {
    this.userIdDetails = this.$auth?.getUserDetails();
  }
  submit() {
  }

  setupQrCode() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          "userId": this.userIdDetails?.userId,
        }
      }
      this.$totp.setupQrCode(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.qrCodeSrc = "data:image/jpeg;base64," + response.object;
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

  enableTOtp() {
    try {
      this.$common.showLoader();
      let code = encodeURIComponent(crypto.AES.encrypt(this.formObj?.otp, "code").toString())
      this.config = {
        headers: {
          "userId": this.userIdDetails?.userId,
          "code": code,
        }
      }
      this.$totp.enableTOtp(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          $("#enableTotpModal").modal("hide");
          this.totpStatusTextChange.emit('Disable');
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
    if (changes.hitApi && changes.hitApi.currentValue) {
      let hitApi = changes.hitApi.currentValue;
      if (hitApi) this.setupQrCode();
    }
  }

}
