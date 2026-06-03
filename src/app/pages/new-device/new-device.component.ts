import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SecurityService } from 'src/app/service/auth/security.service';
import { utilDeviceService } from 'src/app/service/core/util-device.service';
import { Router } from '@angular/router';
import { DeviceService } from 'src/app/service/acl/device.service';

@Component({
    selector: 'app-new-device',
    templateUrl: './new-device.component.html',
    styleUrls: ['./new-device.component.scss'],
    standalone: false
})
export class NewDeviceComponent implements OnInit {

  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    public $device: utilDeviceService,
    private deviceDetectorService: DeviceDetectorService,
    private deviceService: DeviceService,
    private router: Router,
  ) { }

  deviceName;
  config;
  deviceInfo = null;
  userIdDetails;
  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
  }

  getDeviceDetails() {
    try {
      this.$common.showLoader();
      this.deviceInfo = this.deviceDetectorService.getDeviceInfo();
      // let browserId = this.deviceInfo?.browser_version;
      let browserId = this.deviceService.generateBrowserId();
      let req = {
        deviceId: browserId,
        browserName: this.deviceInfo?.browser,
        userId: this.userIdDetails?.userId,
        descr: this.deviceName,
      }

        this.$device.createOrUpdate(req).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          // Device key is managed centrally in auth/storage flow.
          this.router.navigate(['/switch-module']);
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

}

