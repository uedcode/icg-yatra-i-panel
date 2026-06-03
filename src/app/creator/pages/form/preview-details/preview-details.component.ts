import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form/form.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { FormStateService } from 'src/app/service/form/formState.service';
import { DatePipe } from '@angular/common';
import { DropdownManageService } from 'src/app/service/form/dropdown-manage.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
import stateJson from 'src/app/creator/json/stateList.json';
import martialStatusJson from 'src/app/creator/json/martialStatus.json';
import relationJson from 'src/app/creator/json/relationLIst.json';
import genderJson from 'src/app/creator/json/genderList.json';
import shipJson from 'src/app/creator/json/shipList.json';
import catListJson from 'src/app/creator/json/categoryList.json';
import * as crypto from 'crypto-js';
import { MasterShipService } from 'src/app/service/master/master-ship.service';

declare var $: any;

@Component({
    selector: 'app-preview-details',
    templateUrl: './preview-details.component.html',
    styleUrls: ['./preview-details.component.css'],
    standalone: false
})
export class PreviewDetailsComponent implements OnInit {
  today: any;
  constructor(
    private location: Location,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private $common: CommonService,
    public $auth: AuthService,
    public $form: FormService,
    public $formManage: FormManageService,
    public $formState: FormStateService,
    private $dropdownManage: DropdownManageService,
    private $codeDocInfo: CodeDocInfoService,
    private $ship: MasterShipService,
    private router: Router,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any;
  p: any;
  dataObj: any = {};
  supplementryClaim;
  portList = [];
  parentId;
  userIdDetails;

  codeStatus;
  formId: any;
  tempFormObj: any;
  subFormId: any;
  documentDtos: any = [];
  currentState: any;
  saveAsDraftLoading: boolean = false;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.codeStatus = this.$auth?.codeStatus();

    this.route.queryParams.subscribe((params) => {
      this.formId = params?.id;
      this.subFormId = params?.subFormId;
      this.currentState = params?.state;
      this.getGrtNo();
      this.getShipName();
    });

    this.getAll();
    this.getFormDetails();
    // this.getPortDetails();
  }
  formChildMovementDTOs: any = [];
  formdate: any;
  // Get single start
  getFormDetails() {
    this.$formManage?.getSingleForm();
    this.$formManage?.formDetail.subscribe((res) => {
      if (res) {
        this.formObj = res;
        if (this.formObj.refSupClaimId !== null) {
          this.supplementryClaim = 'Supplementary ';
        }
        this.onSelectClaimTypeDefault();
        this.documentDtos = this.formObj?.formDocsDTOs;
        this.formChildMovementDTOs = this.formObj?.formChildPilotageDTOs;
      }
    });
  }

  private getCurrentStatusId() {
    return this.currentState ||
      this.formObj?.formStateOutputDTO?.statusId ||
      this.formObj?.formStateOutputDTO?.status ||
      this.formObj?.formStateInputDTO?.status ||
      this.formObj?.aclCodeStatusDTO?.statusId ||
      this.formObj?.codeStatusDTO?.statusId ||
      this.formObj?.statusId;
  }

  canSaveAsDraft() {
    return this.$auth.codeRoleType()?.creator == this.userIdDetails?.roleTypeId &&
      this.getCurrentStatusId() == this.codeStatus?.notPassed;
  }

  /*
  resubmitForm() {
    if (!this.formId || this.resubmitLoading) {
      return;
    }

    this.resubmitLoading = true;
    this.config = {
      headers: {
        id: this.formId,
        userId: this.userIdDetails?.userId || '',
        roleId: this.userIdDetails?.roleId || '',
        desigId: this.userIdDetails?.desigId || '',
        unitId: this.userIdDetails?.unitId || '',
      },
    };

    this.$form.resubmit(this.config).subscribe({
      next: (response: any) => {
        this.resubmitLoading = false;

        if (!(response?.status && response?.object?.length)) {
          this.$common.showMessage(response?.message || 'Resubmit failed.');
          return;
        }

        const editUrl = this.$auth.getFormEditUrl(response.object[0], {
          formUrl: this.formObj?.codeSubFormDTO?.formUrl || this.dataObj?.formUrl,
          subFormId: this.formObj?.codeSubFormDTO?.subFormId || this.subFormId,
        });

        if (!editUrl) {
          this.$common.showMessage(
            'Form resubmitted successfully, but edit page could not be opened.'
          );
          return;
        }

        this.$common.showMessage('Form resubmitted successfully.');
        this.router.navigateByUrl(editUrl);
      },
      error: (err) => {
        this.resubmitLoading = false;
        this.$common.showMessage('Something went wrong while resubmitting.');
        console.error(err);
      }
    });
  }
  */

  saveAsDraft() {
    if (!this.formId || this.saveAsDraftLoading) {
      return;
    }

    this.saveAsDraftLoading = true;
    this.config = {
      headers: {
        formId: this.formId,
      },
    };

    this.$formState.moveToDraft(this.config).subscribe({
      next: (response: any) => {
        this.saveAsDraftLoading = false;

        if (!response?.status) {
          this.$common.showMessage(response?.message || 'Save as draft failed.');
          return;
        }

        const editUrl = this.$auth.getFormEditUrl({
          ...this.formObj,
          formId: this.formId,
          formUrl: this.dataObj?.formUrl,
        }, {
          formUrl: this.formObj?.codeSubFormDTO?.formUrl || this.dataObj?.formUrl,
          subFormId: this.formObj?.codeSubFormDTO?.subFormId || this.subFormId,
        });

        if (!editUrl) {
          this.$common.showMessage(
            'Form saved to draft successfully, but edit page could not be opened.'
          );
          this.router.navigateByUrl(this.$auth.getModuleName() + `/draft`);
          return;
        }

        this.$common.showMessage(response?.message || 'Form saved to draft successfully.');
        this.router.navigateByUrl(editUrl);
      },
      error: (err) => {
        this.saveAsDraftLoading = false;
        this.$common.showMessage('Something went wrong while moving the form to draft.');
        console.error(err);
      }
    });
  }

  /** Download Report Starts */
  setFileName() {
    let currentTime = this.$common.getCurrentTimeStamp();
    let fileName = "";
    fileName = "FAQ_" + currentTime;
    return fileName;
  }

  downloadReport() {
    this.p = 1;
    this.noOfPage = 100000;
    let fileName = this.setFileName();
    setTimeout(() => {
      $("#exportData").table2excel({
        // exclude CSS class
        exclude: ".noExl",
        name: fileName,
        filename: fileName, //do not include extension
        fileext: ".xls" // file extension
      });
      this.noOfPage = 10;
    }, 1000);
  }
  /** Download Report Ends */
  // Get single end
  onSelectClaimTypeDefault() {
    if (this.userIdDetails.desigId == 'CO') {
      this.formObj.claimType = 'Commanding officer';
    } else if (this.userIdDetails.desigId == 'NO') {
      this.formObj.claimType = 'Navigating officer';
    }
  }

  getAll() {
    try {
      // this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.formId
        },
      };

      this.$form.getSingleForm(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object[0];
            this.dataList = response.object[0]?.formChildPilotageDTOs;
            this.formChildMovementDTOs = response.object[0]?.formChildPilotageDTOs;
            this.dataObj = list;
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
  selecteGrtList = [];
  getGrtNo(grtNo?: any) {
    try {
      this.$common.showLoader();
      let config = {
        headers: {
          unitGrtNo: grtNo
        },
      };

      // if (this.formObj.unitGrtNo) {
      //   this.config.headers.unitGrtNo = grtNo;
      // }
      this.$ship.get(config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.selecteGrtList = response.object;
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
  selecteShipList = [];
  getShipName() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {

        },
      };

      // if (this.formObj.unitGrtNo) {
      //   this.config.headers.unitGrtNo = grtNo;
      // }
      this.$ship.get(config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.selecteShipList = response.object;
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
  getFormDownloadLink() {
    try {
      this.$common.showLoader();
      this.$form?.getFormDownloadLink(this.formId).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$form.downloadFormFromResponse(response?.object);
          }
        },
        (err) => {
          console.error(err);
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.error(error);
    }
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }


}

