import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { FormStateService } from 'src/app/service/formState.service';

declare var $: any;

@Component({
    selector: 'app-common-pilotage-detail',
    templateUrl: './common-pilotage-detail.component.html',
    styleUrls: ['./common-pilotage-detail.component.scss'],
    standalone: false
})
export class CommonPilotageDetailComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $form: FormService,
    private $common: CommonService,
    private route: ActivatedRoute,
    public $formManage: FormManageService,
    public $formState: FormStateService,
    private router: Router,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  formObj: any = {};
  noOfPage: any;
  pageType: any;
  searchObj: any;
  p: any;
  isSignRequired: any;
  id: any;
  config: any;
  formId: any;
  currentState: any;
  saveAsDraftLoading: boolean = false;

  desigId;
  codeRoleList;
  userIdDetails;
  codeStatus;
  downloadLink;
  formDocsDTOs;
  buttonVisibility: any;
  fileUrl = environment.fileUrl;
  supplementryClaim;
  numberWords = [
    'Zero','One','Two','Three','Four',
    'Five','Six','Seven','Eight','Nine'
  ];
  
  ngOnInit() {

    this.codeRoleList = this.$auth.codeRoleType();
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.route.queryParams.subscribe(params => {
      this.formId = params?.id;
      this.currentState = params?.state;
      this.getFormDetails();
    });
  }
  claimAmt;
  getFormDetails() {
    
    this.$formManage?.getSingleForm();
    this.$formManage?.formDetail.subscribe(res => {
      if (res) {
        this.formObj = res;
        if (this.formObj.refSupClaimId !== null && this.formObj.refSupClaimId !== undefined) {
          this.supplementryClaim = 'Supplementary ';
        }
        this.formDocsDTOs = this.formObj?.formDocsDTOs
        this.claimAmt=this.formObj?.claimAmt;
        this.isSignRequired = this.formObj?.signRequired;
        this.buttonVisibility = this.formObj?.visibilityIndicator;
      }
    })
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
    return this.codeRoleList?.creator == this.userIdDetails?.roleTypeId &&
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
          formUrl: this.formObj?.codeSubFormDTO?.formUrl || this.formObj?.formUrl,
          subFormId: this.formObj?.codeSubFormDTO?.subFormId,
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
        }, {
          formUrl: this.formObj?.codeSubFormDTO?.formUrl || this.formObj?.formUrl,
          subFormId: this.formObj?.codeSubFormDTO?.subFormId,
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

  // getFormDownloadLink(){

  //   this.$formManage?.getDownloadLink(this.formId)
  //   this.$formManage?.downloadUrl.subscribe(res => {
  //     if (res) {
  //       this.downloadLink = res[0];
  //       window.open(`${this.fileUrl}${this.downloadLink?.url}`);
  //     }
  //   })
  // }
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

  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end
}

