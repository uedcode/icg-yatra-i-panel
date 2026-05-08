import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SystemAdminService } from 'src/app/service/systemAdmin.service';
import { UserService } from 'src/app/service/user.service';
declare var $: any;

@Component({
    selector: 'app-manage-system-admin',
    templateUrl: './manage-system-admin.component.html',
    styleUrls: ['./manage-system-admin.component.scss'],
    standalone: false
})
export class ManageSystemAdminComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $systemAdmin: SystemAdminService,
    private $user: UserService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;
  @ViewChild('searchForm', { static: true }) searchForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  disableBtn: boolean = true;

  userGroupId: any;
  userIdDetails;
  codeRoleList;
  codeStatusList;
  advSearch: any = {};

  ngOnInit(): void {
    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();

    this.reset();
    this.getAll();
  }

  getDetails(advSearch = null) {

    try {
      if (!this.advSearch?.pno) {
        return this.$common.showMessage('Please select Personal Number', 'danger');
        
      }
      this.formObj = {
        nameShort: '',
        mobileNo: '',
        rankDescr: ''
      };
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      if (advSearch) {
        if (advSearch?.pno) {
          this.config.headers.pNo = advSearch?.pno;
        }
      }
      this.$user.getUserByPno(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status == true) {
            this.$common.showMessage(response.message);
            this.formObj = response.object[0];
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
    
    this.getDetails(this.advSearch);
  }
  pnoReset() {
    this.advSearch = {};
    
  }

  saveRecord() {

    try {
      let req = {
        "aclCodeRoleTypeDTO": {
          "id": "SY"
        },
        "aclCodeStatusDTO": {
          "statusId": "AC"
        },
        aclUserDTO: {
          userId: this.formObj?.pid,
        },
        name: this.formObj?.nameDescr,
        rank: this.formObj?.rankDescr,
        pno: this.formObj?.pno + '-' + this.formObj?.suf,
      };
      
      this.$common.showLoader();
      this.$systemAdmin.createOrUpdate(req).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            let object = response.object[0];
            this.dataList.push(object);
            this.disableBtn = true;
            this.getAll()
            this.reset();
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

  primaryId: any;
  deleteRecord(primaryId) {
    
    var config = {
      headers: {
        "ids": primaryId,
      }
    }
    this.$systemAdmin.delete(config).subscribe((response: any) => {
      this.$common.hideLoader();
      if (response.status === true) {
        this.$common.showMessage(`${response.message}`);
        this.dataList = this.dataList.filter(elem => this.getRoleId(elem) != primaryId)
      }
    }, err => {
      this.$common.hideLoader();
    })
  }

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          roleTypeId: this.codeRoleList.systemAdmin,
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



  reset() {
    // Reset the form's state
    this.requiredForm.resetForm();

    this.formObj = {
      nameShort: '',
      mobileNo: '',
      rankDescr: ''
    };
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
}
