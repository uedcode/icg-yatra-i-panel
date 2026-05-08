import { AuthService } from 'src/app/service/auth.service';
import { Component, Inject, OnInit, DOCUMENT } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { CommonService } from 'src/app/service/common.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { HttpParams } from '@angular/common/http';
//import { Location } from '@angular/common';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  private readonly storageKeys = environment.authConfig.storageKeys;

  constructor(private $common: CommonService, public $auth: AuthService, private $user: UserService, private route: Router, private router: Router, @Inject(DOCUMENT) document: any) { }

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
      if (this.userIdDetails?.formId) {
        this.config.headers.formId = this.userIdDetails?.formId;
      }
      this.$user.roles(this.config).subscribe((response: any) => {
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
      const designation = dataObj?.aclCodeDesignationDTO;
      const roleType = dataObj?.aclCodeRoleTypeDTO;
      this.config = {
        headers: {
          moduleId:'PIL'
        }
      }
      
      if (designation?.id) {
        this.config.headers.desigId = designation.id;
      }
      if (roleType?.id) {
        this.config.headers.roleTypeId= roleType.id;
      }
      // if (dataObj?.userGroupDTO?.id) {
      //   this.config.headers.userGroupId = dataObj?.userGroupDTO?.id;
      // }
      if (this.userIdDetails?.userId) {
        this.config.headers.userId = this.userIdDetails?.userId;
      }
      if (this.getRoleId(dataObj)) {
        this.config.headers.roleId = this.getRoleId(dataObj);
      }
      // if (this.userIdDetails?.formId) {
      //   this.config.headers.formId = this.userIdDetails?.formId;
      // }
      this.$user.roleSwitch(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        
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
      params = params.append('is_login', '0');
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

}
