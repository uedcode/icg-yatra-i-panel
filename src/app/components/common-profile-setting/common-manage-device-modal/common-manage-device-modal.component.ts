import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { DevicetService } from 'src/app/service/device.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
    selector: 'app-common-manage-device-modal',
    templateUrl: './common-manage-device-modal.component.html',
    styleUrls: ['./common-manage-device-modal.component.scss'],
    standalone: false
})
export class CommonManageDeviceModalComponent implements OnInit {
  private readonly storageKeys = environment.authConfig.storageKeys;

  constructor(
    private $common: CommonService,
    private $device: DevicetService,
    private $auth: AuthService,
  ) { }

  id: any;
  dataList: any = [];
  config;
  userIdDetails;

  ngOnInit() {
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
      this.$device.get(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          let list = response.object;
          this.dataList = list;

          let deviceId = localStorage.getItem(this.storageKeys.deviceId);
          this.dataList?.map((item) => {
            if (deviceId == item?.deviceId) item.isDisabled = true;
            else item.isDisabled = false;
          })
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

  // delete start
  deleteList(id) {

    try {
      this.$common.showLoader();
      var config = {
        headers: {
          "ids": id,
        }
      }
      this.$device.delete(config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(response.message);
          this.dataList = this.dataList.filter(elem => elem.id != id)
          $("#delete_modal").modal("hide");
        }
      }, error => {
        this.$common.hideLoader();
        console.log(error);
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  // delete end

}
