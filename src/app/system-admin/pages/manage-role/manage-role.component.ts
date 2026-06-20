import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';

import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { CodeUnitApiService } from 'src/app/service/api/code-unit/code-unit-api.service';
import { DesignationApiService } from 'src/app/service/api/designation/designation-api.service';
import { RoleApiService } from 'src/app/service/api/role/role-api.service';
import { UserApiService } from 'src/app/service/api/user/user-api.service';

@Component({
  selector: 'app-manage-role',
  standalone: false,
  templateUrl: './manage-role.component.html',
  styleUrls: ['./manage-role.component.css']
})
export class ManageRoleComponent implements OnInit {
  private readonly allowedUnitId = '000225';
  private readonly allowedRoleMap = {
    verifier: 'JDOPS',
    approver: 'PDOPS'
  };

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $roleApi: RoleApiService,
    private $codeUnitApi: CodeUnitApiService,
    private $designationApi: DesignationApiService,
    private $user: UserApiService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  searchObj: any;
  config: any;
  userObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  disableBtn = true;

  userIdDetails;
  codeStatusList;
  formObj: any = {};
  roleList: any = [];
  desigList: any = [];
  unitList: any = [];

  ngOnInit(): void {
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();
    this.reset();
    this.getUnitList();
  }

  onUnitChange() {
    this.formObj.role = null;
    this.formObj.desig = null;
    this.roleList = [];
    this.desigList = [];
    this.userObj = {};
    this.disableBtn = true;
    this.dataList = [];
    this.roleList = [
      { id: 'VE', roleType: 'Verifier' },
      { id: 'AP', roleType: 'Approver' },
    ]
    if (this.formObj?.unitId) {
      this.getAll();
    }
  }

  getDetails(formObj = null) {
    try {
      if (!formObj?.unitId) {
        return this.$common.showMessage('Please select Unit', 'danger');
      }
      if (!formObj?.pno) {
        return this.$common.showMessage('Please Enter PNO', 'danger');
      }
      this.$common.showLoader();
      this.config = {
        headers: {
          unit: formObj?.unitId,
          pNo: formObj?.pno
        },
      };

      this.$user.getUserByPno(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status == true) {
            this.$common.showMessage(response.message);
            this.userObj = response.object[0];
            this.disableBtn = false;
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

  doSearch() {
    this.getDetails(this.formObj);
  }

  pnoReset() {
    this.formObj = {
      unitId: this.formObj?.unitId,
      role: this.formObj?.role,
      desig: this.formObj?.desig
    };
    this.userObj = {};
    this.disableBtn = true;
  }

  saveRecord() {
    try {
      this.$common.showLoader();
      const req = {
        aclCodeRoleTypeDTO: {
          id: this.formObj.role
        },
        aclCodeDesignationDTO: {
          id: this.formObj.desig
        },
        aclCodeStatusDTO: {
          statusId: 'AC'
        },
        aclUserDTO: {
          userId: this.userObj?.pid
        },
        codeUnitDTO: {
          unit: this.formObj?.unitId
        },
        name: this.userObj?.nameDescr,
        rank: this.userObj?.rankDescr,
        pno: this.userObj?.pno + '-' + this.userObj?.suf,
      };

      this.$roleApi.createOrUpdateRole(req).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.disableBtn = true;
            this.userObj = {};
            this.formObj.pno = null;
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
      if (!this.formObj?.unitId) {
        this.dataList = [];
        return;
      }

      this.$common.showLoader();
      this.config = {
        headers: {
          unitId: this.formObj?.unitId,
        },
      };
      this.$roleApi.getAllRoles(this.config).subscribe(
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
      const config = {
        headers: {
          roleId: this.getRoleId(tempObj),
          statusId: tempObj.currentStatus
        }
      };
      this.$roleApi.changeRoleStatus(config).subscribe(response => {
        if (response.status === true) {
          tempObj.aclCodeStatusDTO.statusId = tempObj.currentStatus;
          this.$common.showMessage(`${response.message}`);
        }
      }, () => {
        this.$common.hideLoader();
      });
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getUnitList() {
    try {
      this.$common.showLoader();
      this.$codeUnitApi.getAllUnits({ headers: {} }).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.unitList = (response.object || []).filter((item) => item?.unit === this.allowedUnitId);
            if (this.unitList.length) {
              this.formObj.unitId = this.unitList[0].unit;
              this.onUnitChange();
            }
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

  // getRoleTypeList() {
  //   try {
  //     this.$common.showLoader();
  //     this.config = {
  //       headers: {
  //         visibilityIndicator: '1',
  //         unitId: this.formObj?.unitId
  //       },
  //     };
  //     this.$dropdown.getCodeRoleType(this.config).subscribe(
  //       (response: any) => {
  //         this.$common.hideLoader();
  //         if (response.status === true) {
  //           this.roleList = (response.object || []).filter((item) => this.isAllowedRole(item?.roleType));
  //         }
  //       },
  //       (err) => {
  //         this.$common.hideLoader();
  //         console.log(err);
  //       }
  //     );
  //   } catch (error) {
  //     this.$common.hideLoader();
  //     console.log(error);
  //   }
  // }

  getDesignationList() {
    try {
      this.formObj.desig = null;
      this.desigList = [];
      if (!this.formObj?.role || !this.formObj?.unitId) {
        return;
      }

      this.$common.showLoader();
      this.config = {
        headers: {
          visibilityIndicator: '1',
          roleTypeId: this.formObj?.role
        },
      };
      this.$designationApi.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {

            this.desigList = (response.object);
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
    this.requiredForm.resetForm();
    this.formObj = {};
    this.userObj = {};
    this.dataList = [];
    this.roleList = [];
    this.desigList = [];
    this.disableBtn = true;
  }

  goBack() {
    if (window.history.length > 1) {
      this.reset();
      this.location.back();
    } else {
      window.close();
    }
  }

  key = 'descr';
  reverse = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  getRoleId(dataObj: any) {
    return dataObj?.roleId || dataObj?.id;
  }

}

