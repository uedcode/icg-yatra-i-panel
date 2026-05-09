import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { SystemAdminService } from 'src/app/service/systemAdmin.service';

@Component({
  selector: 'app-unit-admin-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
  standalone: false,
})
export class ArchiveComponent implements OnInit {
  dataList: any[] = [];
  tempObj: any;
  userIdDetails: any;
  codeStatusList: any;
  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  key: string = 'pno';
  reverse = false;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $systemAdmin: SystemAdminService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatusList = this.$auth.codeStatus();
    this.getAll();
  }

  getAll(): void {
    try {
      this.$common.showLoader();
      const config = {
        headers: {
          unitId: this.userIdDetails?.unitId,
        },
      };
      this.$systemAdmin.getUnitAdminRoles(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          const allRows = Array.isArray(response?.object) ? response.object : [];
          this.dataList = allRows.filter(
            (row: any) => row?.aclCodeStatusDTO?.statusId === this.codeStatusList?.deactivate
          );
        },
        () => {
          this.$common.hideLoader();
          this.dataList = [];
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  openChangeStatusModal(data: any, statusCode: string): void {
    this.tempObj = { ...data };
    this.tempObj.currentStatus = statusCode;
  }

  changeStatus(tempObj: any): void {
    try {
      const config = {
        headers: {
          roleId: this.getRoleId(tempObj),
          statusId: tempObj.currentStatus,
        },
      };
      this.$systemAdmin.changeStatus(config).subscribe(
        (response: any) => {
          if (response?.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.filter(
              (row: any) => this.getRoleId(row) !== this.getRoleId(tempObj)
            );
          }
        },
        () => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }

  getRoleId(dataObj: any): any {
    return dataObj?.roleId || dataObj?.id;
  }
}
