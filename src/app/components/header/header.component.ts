import { AuthService } from 'src/app/service/auth/auth.service';
import { Component, Inject, OnInit, DOCUMENT, ChangeDetectionStrategy } from '@angular/core';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';
import { UserApiService } from 'src/app/service/api/admin/user-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';
//import { Location } from '@angular/common';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeaderComponent implements OnInit {
  private readonly storageKeys = environment.authConfig.storageKeys;

  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    private $user: UserApiService,
    private $roleApi: RoleApiService,
    @Inject(DOCUMENT) document: any
  ) { }

  userIdDetails;
  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    let accessCount = parseInt(localStorage.getItem(this.storageKeys.accessCount));
    if (accessCount == 0) {
      // this.checkAccountStatus();
    }
    this.getRoles();
  }

  
  dataList;
  config: any;
  getRoles() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {}
      }
      if (this.userIdDetails?.userId) {
        this.config.headers.userId = this.userIdDetails?.userId;
      }
      if (this.userIdDetails?.roleId) {
        this.config.headers.roleId = this.userIdDetails?.roleId;
      }
      this.config.headers.moduleId = this.$auth.getRuntimeModuleId();
      this.$roleApi.getRolesByUser(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          
          if (response.action == 'RD') {
            // this.$common.showMessage(response.message, 'danger');
            this.$auth.destroySession("4");
          } else {
            this.dataList = response.object;
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

  roleSwitch(dataObj) {
    try {
      this.$common.showLoader();
      const roleType = dataObj?.aclCodeRoleTypeDTO;
      const resolvedRoleTypeId = roleType?.roleTypeId || dataObj?.roleTypeId || roleType?.id;
      this.config = {
        headers: {
          userId: this.userIdDetails?.userId,
          roleTypeId: resolvedRoleTypeId,
          moduleId: this.$auth.getRuntimeModuleId()
        }
      }
      if (!this.config.headers.userId || !this.config.headers.roleTypeId) {
        this.$common.hideLoader();
        this.$common.showMessage('Unable to switch role: role details are incomplete.', 'danger');
        return;
      }
      this.$user.roleSwitch(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        debugger
        if (response.status === true) {
          this.refreshToken();
          // let moduleUrl = this.$auth.getModuleName();
          // this.router.navigateByUrl(moduleUrl + `/dashboard`);
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
      this.$auth.refresh(params).subscribe((response) => {
        this.$auth.createSession(response, 'REFRESH');
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

  getRoleId(dataObj: any) {
    return dataObj?.roleId || dataObj?.id;
  }

  getRoleTypeId(dataObj: any) {
    return dataObj?.aclCodeRoleTypeDTO?.roleTypeId || dataObj?.roleTypeId;
  }

  isCurrentRole(dataObj: any): boolean {
    const currentRoleTypeId = this.userIdDetails?.roleTypeId;
    const roleTypeId = this.getRoleTypeId(dataObj);
    if (currentRoleTypeId && roleTypeId) {
      return currentRoleTypeId === roleTypeId;
    }
    return this.userIdDetails?.roleId == this.getRoleId(dataObj);
  }

}

