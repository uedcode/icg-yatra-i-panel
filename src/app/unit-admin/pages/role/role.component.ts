import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemAdminService } from 'src/app/service/admin/systemAdmin.service';
import { MappingService } from 'src/app/service/admin/mapping.service';
import { UserService } from 'src/app/service/admin/user.service';
import { DropdownService } from 'src/app/service/form/dropdown.service';
declare var $: any;

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.css'],
    standalone: false
})
export class RoleComponent implements OnInit {
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $systemAdmin: SystemAdminService,
    private $dropdown: DropdownService,
    private $user: UserService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  userObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  disableBtn: boolean = true;

  userGroupId: any;
  userIdDetails;
  codeRoleList;
  roleType;
  formObj: any = {};
  codeStatusList;
  roleList: any = [];
  desigList: any = [];

  ngOnInit(): void {

    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();
    this.reset();
    this.getAll();
    this.getRoleTypeList();
    this.getDesignationList();
  }

  getDetails(formObj = null) {
    try {
      // if (!this.formObj?.role) {
      //   return this.$common.showMessage('Please select Role', 'danger');
      // } 
      if (!this.formObj?.pno) {
        return this.$common.showMessage('Please Enter PNO', 'danger');
      }
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      if (formObj) {
        // if (formObj?.codeHrUnit) {
        //   this.config.headers.unit = formObj?.codeHrUnit;
        // }
        if (formObj?.pno) {
          this.config.headers.pNo = formObj?.pno;
        }
      }
      this.$user.getUserByPno(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status == true) {
            this.$common.showMessage(response.message);
            this.userObj = response.object[0];
            this.disableBtn = false;
            // this.getAll();
          }
        },
        (err) => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  doSearch() {
    this.getDetails(this.formObj);
  }
  pnoReset() {
    this.formObj = {}
    // this.userObj = {}
  }

  saveRecord() {
    try {
      this.$common.showLoader();
      let req = {
        "aclCodeRoleTypeDTO": {
          "id": this.formObj.role
        },
        "aclCodeDesignationDTO": {
          "id": this.formObj.desig
        },
        "aclCodeStatusDTO": {
          "statusId": "AC"
        },
        "aclUserDTO": {
          "userId": this.userObj?.pid
        },
        "codeUnitDTO": {
          "unit": this.userIdDetails?.unitId
        },
        name: this.userObj?.nameDescr,
        rank: this.userObj?.rankDescr,
        pno: this.userObj?.pno + '-' + this.userObj?.suf,
      };

      this.$systemAdmin.createOrUpdate(req).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            let object = response.object[0];
            this.dataList.push(object);
            this.disableBtn = true;
            this.reset();
            this.getAll();
          }
        },
        (err) => {
          console.log(err);
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getAll() {
    try {
      this.$common.showLoader();
      if (this.formObj.role) {
        this.roleType = this.formObj.role;
      }
      else {
        this.roleType = this.userIdDetails?.roleTypeId;
      }
      this.config = {
        headers: {
          unitId: this.userIdDetails?.unitId,
        },
      };
      this.$systemAdmin.getUnitAdminRoles(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.dataList = response.object;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  tempObj;
  openChangeStatusModal(data, statusCode) {

    this.tempObj = { ...data };
    this.tempObj.currentStatus = statusCode;
  }

  changeStatus(tempObj) {

    try {
      if (this.getRoleId(tempObj) == this.userIdDetails?.roleId) {
        return this.$common.showMessage("You can't Deactivate yourself.", 'danger');
      }
      var config = {
        headers: {
          "roleId": this.getRoleId(tempObj),
          "statusId": tempObj.currentStatus
        }
      }
      this.$systemAdmin.changeStatus(config).subscribe(response => {
        if (response.status === true) {
          tempObj.aclCodeStatusDTO.statusId = tempObj.currentStatus;
          this.$common.showMessage(`${response.message}`);
        }
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  // get list of code role type
  getRoleTypeList() {
    try {

      this.$common.showLoader();
      this.config = {
        headers: {
          visibilityIndicator: '1',
          unitId: this.userIdDetails?.unitId
        },
      };
      this.$dropdown.getCodeRoleType(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;
            this.roleList = list;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  // get list of code designation type
  getDesignationList() {
    try {


      this.$common.showLoader();
      this.config = {
        headers: {
          visibilityIndicator: '1',
          roleTypeId: this.formObj?.role
        },
      };
      this.$dropdown.getCodeDesignation(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;
            this.desigList = list;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }


  reset() {
    this.userObj = {}

  }
  goBack() {
    if (window.history.length > 1) {
      this.reset();
      this.location.back();
    } else {
      window.close();
    }
  }
  // data shorting starts
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  getRoleId(dataObj: any) {
    return dataObj?.roleId || dataObj?.id;
  }
  // data shorting ends
}

