import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { SystemAdminService } from 'src/app/service/systemAdmin.service';
import { MappingService } from 'src/app/service/mapping.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/service/user.service';

declare var $: any;

@Component({
    selector: 'app-manage-unit-admin',
    templateUrl: './manage-unit-admin.component.html',
    styleUrls: ['./manage-unit-admin.component.scss'],
    standalone: false
})
export class ManageUnitAdminComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $systemAdmin: SystemAdminService,
    private $mapping: MappingService,
    private route: ActivatedRoute,
    private $user: UserService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageName: any;
  searchObj: any;

  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  disableBtn: boolean = true;

  userIdDetails;
  codeRoleList;
  codeStatusList;
  advSearchObj: any = {};
  unitList: any = [];

  formId;
  ngOnInit(): void {
    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();

    this.getUnitList();
    this.route.queryParams.subscribe(params => {
      this.reset();
      this.formId = params?.formId;
      // if (this.formId == 'INBA') {
      //   this.pageName = "INBA";
      // } else {
      //   this.pageName = "NGIF";
      // }

      this.getAll();
    });

  }

  getDetails(formObj = null) {
    try {
      if (!formObj?.codeHrUnitId) {
        return this.$common.showMessage('Please select Unit', 'danger');
      } else if (!formObj?.pno) {
        return this.$common.showMessage('Please enter PNO', 'danger');
      }
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      if (formObj) {
        if (formObj?.codeHrUnitId) {
          this.config.headers.unit = formObj?.codeHrUnitId;
        }
        if (formObj?.pno) {
          this.config.headers.pNo = formObj?.pno;
        }
      }
      this.$user.getUserByPno(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status == true) {
            this.$common.showMessage(response.message);
            this.advSearchObj = response.object[0];
            this.disableBtn = false;
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

    this.formObj = { codeHrUnitId: this.formObj.codeHrUnitId };
    // this.advSearchObj={};
  }

  // reset() {
  //   this.userObj = {
  //     nameShort: "",
  //     mobileNo: "",
  //     rankDescr: ""
  //   };
  // }

  reset() {
    this.requiredForm.resetForm();
    this.formObj = {};
    this.advSearchObj = {};
  }
  saveRecord() {
    try {
      if (!this.formObj?.pno) return;
      this.$common.showLoader();
      let req = {
        "aclCodeRoleTypeDTO": {
          "id": "UN"
        },
        "aclCodeStatusDTO": {
          "statusId": "AC"
        },
        "aclUserDTO": {
          "userId": this.advSearchObj?.pid,
        },
        name: this.advSearchObj?.nameDescr,
        rank: this.advSearchObj?.rankDescr,
        pno: this.advSearchObj?.pno + '-' + this.advSearchObj?.suf,
        "codeUnitDTO": {
          "unit": this.formObj?.codeHrUnitId
        },
      };

      this.$systemAdmin.createOrUpdate(req).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            let object = response.object[0];
            this.dataList.push(object);
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
      this.config = {
        headers: {
          roleTypeId: this.codeRoleList.unitAdmin
        },
      };
      this.$systemAdmin.getAll(this.config).subscribe(
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

  getUnitList() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {},
      };
      this.$mapping.getUnit(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.unitList = response.object;
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

  // reset() {
  //   this.requiredForm.resetForm();
  //   this.formObj={};
  //   this.advSearchObj={};
  // }
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
  // data shorting ends

  getRoleId(dataObj: any) {
    return dataObj?.roleId || dataObj?.id;
  }

  tempObj;
  openChangeStatusModal(data, statusCode) {
    this.tempObj = { ...data };
    this.tempObj.currentStatus = statusCode;
  }

  changeStatus(tempObj) {
    try {
      // if (tempObj?.id == this.userIdDetails?.roleId) {
      //   return this.$common.showMessage("You can't Deactivate yourself.", 'danger');
      // }
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
}
