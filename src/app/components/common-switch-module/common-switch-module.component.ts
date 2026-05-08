import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { UserService } from 'src/app/service/user.service';
import * as crypto from 'crypto-js';
import { HttpParams } from '@angular/common/http';
import { DeviceService } from 'src/app/service/acl/device.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
    selector: 'app-common-switch-module',
    templateUrl: './common-switch-module.component.html',
    styleUrls: ['./common-switch-module.component.scss'],
    standalone: false
})
export class CommonSwitchModuleComponent implements OnInit {
  private readonly storageKeys = environment.authConfig.storageKeys;

  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    public $user: UserService,
    private deviceService: DeviceService,
  ) { }

  userIdDetails;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    $('#information_modal').modal('show');
  }


  switchModule(moduleType) {
    try {
      this.$common.showLoader();
      let userIdEncrypted = encodeURIComponent(crypto.AES.encrypt(this.userIdDetails?.userId, "userId").toString());
      let formIdEncrypted = encodeURIComponent(crypto.AES.encrypt(moduleType, "formId").toString());
      let config = {
        headers: {
          userId: userIdEncrypted,
          formId: formIdEncrypted,
        }
      }
      this.$user.moduleSwitch(config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.refreshToken();
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

  refreshToken() {
    try {
      this.$common.showLoader();
      var tokenObject = this.$auth.getTokenDetails();
      var params = new HttpParams();
      params = params.append('refresh_token', tokenObject.refreshToken);
      params = params.append('grant_type', 'refresh_token');
      params = params.append('is_login', '0');
      this.$auth.refresh(params).subscribe((response) => {
        this.$auth.createSession(response, 'LOGIN');

        let browserId = this.deviceService.generateBrowserId();
        localStorage.setItem(this.storageKeys.deviceId, browserId);
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
