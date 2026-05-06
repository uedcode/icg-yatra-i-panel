import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { MappingApproverFormService } from 'src/app/service/mappingApproverForm.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { ApproverService } from 'src/app/service/approver.service';
declare var $: any;

@Component({
    selector: 'app-mapping-approver-form',
    templateUrl: './mapping-approver-form.component.html',
    styleUrls: ['./mapping-approver-form.component.css'],
    standalone: false
})
export class MappingApproverFormComponent implements OnInit {
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $approverForm: MappingApproverFormService,
    private $codeSubForm: CodeSubFormService,
    private $approver: ApproverService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  subFormList: any = [];
  approverList: any = [];

  id: any;
  p: any = 1;
  pageName: any;
  searchObj: any;
  noOfPage: any = 10;

  config: any;
  formObj: any = {};

  userIdDetails;
  codeRoleList;
  codeStatusList;

  cadreList: any = [
    {
      id: 'OP',
      descr: 'Officer'
    },
    {
      id: 'EP',
      descr: 'Sailor'
    },
    {
      id: 'ALL',
      descr: 'Officer/Sailor'
    },
  ];

  ngOnInit(): void {

    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();

    this.getAll();
    this.getCodeSubForm();
    this.getApproverList();
  }

  saveRecord() {
    try {
      this.$common.showLoader();
      
      this.config = {
        headers: {
          codeUserId: this.formObj?.userId,
          subFormId: this.formObj?.subFormId,
          cadre:this.formObj?.cadre
        },
      };
      this.$approverForm.createOrUpdate(this.config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            let object = response.object[0];

            if (this.formObj?.subFormId) {
              let index = this.subFormList.findIndex((elem) => elem?.subFormId == this.formObj.subFormId);
              object.codeSubFormDTO = this.subFormList[index];
            }
            if (this.formObj?.userId) {
              let index = this.approverList.findIndex((elem) => elem?.userId == this.formObj.userId);
              object.codeUserDTO = this.approverList[index];
            }
            

            this.dataList.push(object);
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

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          codeFormId: this.userIdDetails?.formId,
        },
      };
      this.$approverForm.getAll(this.config).subscribe(
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

  // delete start
  deleteList(id) {
    try {
      this.$common.showLoader();
      var config = {
        headers: {
          ids: id,
        },
      };
      this.$approverForm.delete(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(response.message);
            this.dataList = this.dataList.filter((elem) => elem.id != id);
            $('#delete_modal').modal('hide');
          }
        },
        (error) => {
          this.$common.hideLoader();
          console.log(error);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  // delete end

  // get list of subFormID
  getCodeSubForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.userIdDetails?.formId,
        },
      };
      this.$codeSubForm.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;

            this.subFormList = [];
            list.map(item => {
              if (!(item.subFormId === 'FORMONE' || item.subFormId === 'FORMFIFTEEN')) {
                this.subFormList.push(item);
              }
            });
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

  // get userList
  getApproverList() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          statusId: 'AC',
        },
      };
      this.$approver.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.approverList = response.object;
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
    this.formObj = {};
    this.requiredForm.resetForm();
  }

  // data shorting starts
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting ends
}
