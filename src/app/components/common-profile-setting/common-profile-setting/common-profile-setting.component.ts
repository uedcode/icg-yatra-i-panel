import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { TotpApiService } from 'src/app/service/api/security/totp-api.service';
declare var $: any;

@Component({
    selector: 'app-common-profile-setting',
    templateUrl: './common-profile-setting.component.html',
    styleUrls: ['./common-profile-setting.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommonProfileSettingComponent implements OnInit {

  constructor(
    private $common: CommonService,
    private $auth: AuthService,
    private $totp: TotpApiService,
  ) { }

  formObj: any = {};

  totpStatusText;
  config;
  hitApi: boolean = false;
  codeRoleList;
  userIdDetails;
  ngOnInit() {
    this.codeRoleList = this.$auth.codeRoleType();
    this.userIdDetails = this.$auth.getUserDetails();
    this.userIdDetails = this.$auth?.getUserDetails();
    this.getDetail();
  }

  getDetail() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          "userId": this.userIdDetails?.userId,
        }
      }
      this.$totp.checkTOtp(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          if (response?.object == 'DA') {
            this.totpStatusText = 'Enable';
          }
          if (response?.object == 'AC') {
            this.totpStatusText = 'Disable';
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

  disableTOtp(data) {
    try {
      
      this.$common.showLoader();
      this.config = {
        headers: {
          "userId": this.userIdDetails?.userId,
        }
      }
      
      this.$totp.disableTOtp(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          $("#delete_modal").modal("hide");
          this.totpStatusText = 'Enable';
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

  manageTotpStatusText(outputData) {
    this.totpStatusText = outputData;
  }

  openProfileModal() {
    if (this.totpStatusText == 'Enable') {
      this.hitApi = true;
      $("#enableTotpModal").modal('show');
    }
    if (this.totpStatusText == 'Disable') {
      // $("#delete_modal").modal('show');
      this.disableTOtp(null);
    }
  }
  openDeviceModal() {
    $("#manage_device_modal").modal('show');
  }
}


