import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';

@Component({
  selector: 'app-unit-admin-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  key = 'pno';
  reverse = false;

  constructor(
    private location: Location,
    public $auth: AuthService,
    public $common: CommonService,
    private $roleApi: RoleApiService
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
          verAppIndicator: '1',
          isArchive: '1',
        },
      };
      this.$roleApi.getAllRoles(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          this.dataList = response?.status === true && Array.isArray(response?.object) ? response.object : [];
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

  openChangeStatusModal(data: any): void {
    this.tempObj = { ...data, isArchive: '0' };
  }

  changeStatusArchive(tempObj = this.tempObj): void {
    try {
      const roleId = this.getRoleId(tempObj);
      const config = {
        headers: {
          ids: roleId,
          isArchive: tempObj?.isArchive || '0',
        },
      };
      this.$roleApi.changeRoleArchiveStatus(config).subscribe(
        (response: any) => {
          if (response?.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.filter(
              (row: any) => this.getRoleId(row) !== roleId
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

  getUserName(dataObj: any): string {
    return dataObj?.aclUserDTO?.name || dataObj?.name || dataObj?.nameDescr || dataObj?.nameShort || '';
  }

  getUserPno(dataObj: any): string {
    const nested = dataObj?.aclUserDTO?.pno;
    if (nested) return nested;
    if (dataObj?.pno && dataObj?.suf) return `${dataObj.pno}-${dataObj.suf}`;
    return dataObj?.pno || dataObj?.pNo || '';
  }

  getUserPhone(dataObj: any): string {
    return dataObj?.aclUserDTO?.phone || dataObj?.phone || dataObj?.mobileNo || '';
  }

  getUserRank(dataObj: any): string {
    return dataObj?.aclUserDTO?.rank || dataObj?.rank || dataObj?.rankDescr || '';
  }

  getStatusLabel(dataObj: any): string {
    const statusId = dataObj?.aclCodeStatusDTO?.statusId;
    if (statusId === this.codeStatusList?.activate) return 'Activated';
    if (statusId === this.codeStatusList?.deactivate) return 'Deactivated';
    return '-';
  }

  viewAuthDoc(dataObj: any) {
    const url = dataObj?.authDocUrl;
    if (url) {
      this.$auth.viewFile(url);
    }
  }
}
