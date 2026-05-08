import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { FormService } from './form.service';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { MisService } from './mis.service';
import { CodeDocInfoService } from './master/codeDocInfo.service';
import { ActivatedRoute } from '@angular/router';
import { FormStateService } from './formState.service';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class FormManageService {

  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    private $mis: MisService,
    private $codeDocInfo: CodeDocInfoService,
    private route: ActivatedRoute,
    public $form: FormService,
    public $formState: FormStateService) {
    this.userIdDetails = this.$auth?.getUserDetails();
    this.route.queryParams.subscribe((params) => {
      this.formId = params?.id;
      this.subFormId = params?.subFormId;
      this.supplementryId = params?.supId;
    });
  }

  config;
  userIdDetails;
  formId;
  subFormId;
  supplementryId;
  formSubmitStatus = new Subject<any>();
  docFileUrlDeleted = new Subject<boolean>();
  formDetail = new Subject<[]>();
  formStateList = new Subject<[]>();
  formStateObj = new Subject<{}>();
  documentList = new Subject<[]>();
  docFileUrl = new Subject();
  downloadUrl = new Subject();

  docList = [];
  documentListTemp = [];

  private getUploadedDocInfo(uploadedDoc: any) {
    return uploadedDoc?.codeDocInfoDTO || null;
  }

  // Form submit start
  handleSubmit(req) {
    try {
      req.cadre = this.userIdDetails.cadre;
      if (req?.formStateInputDTO?.status == 'OB') {
        if (this.documentListTemp.length > 0) {
          let requiredDocList = [... this.documentListTemp]
          // let pendingDocumentList = requiredDocList.filter(doc => doc.isRequired == "Yes" && !this.docList.find(upDoc => upDoc.codeDocInfoDTO?.id === doc.id))
          //   .map(doc => doc.docName);

          let pendingDocumentList = requiredDocList.filter(doc => doc.isRequired === "Yes" && !this.docList.find(upDoc => this.getUploadedDocInfo(upDoc)?.id === doc.id || this.getUploadedDocInfo(upDoc)?.docName?.toLowerCase() === doc.docName?.toLowerCase()))
            .map(doc => doc.docName);
          if (pendingDocumentList.length > 0) {
            let pendingDocName = pendingDocumentList.join(', ');
            return this.$common.showMessage(`Please Upload Required Document - ${pendingDocName}`, 'danger');
          }
        }
      }
      this.$common.showLoader();
      if (this.docList?.length > 0) {
        req = { ...req, formDocsDTOs: this.docList };
      }
      this.$form.createOrUpdate(req).subscribe((response) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          let obj = {
            ...response?.object[0],
            formStateInputDTO: req?.formStateInputDTO
          }
          this.formSubmitStatus.next(
            { obj: obj }
          );
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
  // Form submit end

  // Get document list start
  setDocumentSubscribe() {
    this.$codeDocInfo.documentDtos.subscribe((data) => {
      this.docList = data;
    });
  }
  // Form single get start
  getSingleForm() {
    try {
      this.$common.showLoader();
      this.setDocumentSubscribe();
      this.config = {
        headers: {
          roleTypeId: this.userIdDetails?.roleTypeId,
          desigId: this.userIdDetails?.desigId,
          roleId: this.userIdDetails?.roleId,
        },
      };
      if (this.formId) {
        this.config.headers.formId = this.formId;
      }
      if (this.supplementryId) {
        this.config.headers.formId = this.supplementryId;
      }
      if (this.subFormId) {
        this.config.headers.codeSubFormId = this.subFormId;
      }
      if (this.userIdDetails?.roleTypeId == 'CR') {
        this.config.headers.userId = this.userIdDetails?.userId;
      }

      this.$form.getSingleForm(this.config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.formDetail.next(response?.object[0]);
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
  // Form single get end

  // Stage get start
  getState(state) {

    this.$common.showLoader();
    try {
      let userIdDetails = this.$auth.getUserDetails();
      let codeRoleType = this.$auth.codeRoleType();
      this.config = {
        headers: {
          roleTypeId: userIdDetails.roleTypeId,
          desigId: userIdDetails.desigId,
          status: state
        },
      };
      if (userIdDetails?.roleTypeId == codeRoleType?.creator) {
        this.config.headers.userId = userIdDetails?.userId;
      }
      if (userIdDetails?.roleTypeId != codeRoleType?.creator) {
        this.config.headers.unitId = this.$auth.getUserDetails()?.unitId;
      }
      this.$formState.getState(this.config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.formStateList.next(response?.object);
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
  // Stage get end

  // Image upload start
  uploadImg(event) {
    this.$common.showLoader();
    try {
      let form_data = new FormData();
      form_data.append('docFile', event.currentTarget.files[0]);
      form_data.append('SupportDocDTO', '{}');
      this.$common.showLoader();

      this.$mis.saveFileUrl(form_data).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.docFileUrl.next(response.object[0]?.docFileUrl);
          } else {
            this.docFileUrl.next(null);
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

  // Image delet start
  deleteByUrl(docFileUrl) {
    if (!docFileUrl) {
      this.docFileUrlDeleted.next(true);
      return this.$common.showMessage("Missing file path", 'danger');
    }
    if (docFileUrl && docFileUrl.includes('fakepath')) {
      this.docFileUrlDeleted.next(true);
      return this.$common.showMessage("File deleted successfully.");
    }
    try {
      this.$common.showLoader();
      var config = {
        headers: {
          url: docFileUrl,
        },
      };
      this.$mis.deleteByUrl(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.docFileUrlDeleted.next(true);
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

  // Get document start
  getDocument(subFormId) {
    this.$common.showLoader();
    try {
      const flags = this.getDocumentClaimFlags(subFormId);
      var config = {
        headers: {
          ...flags,
        },
      };
      this.$codeDocInfo.getDocument(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.documentList.next(response?.object);
            this.documentListTemp = response.object;
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

  private getDocumentClaimFlags(subFormId: string) {
    const flags: any = {
      tyClaim: '',
      pmtClaim: '',
      ltcClaim: '',
      resettleClm: '',
      fteClaim: '',
    };

    if (!subFormId) {
      return flags;
    }

    if (subFormId === 'T' || subFormId === 'TYD') {
      flags.tyClaim = '1';
    } else if (subFormId === 'P' || subFormId === 'PMT') {
      flags.pmtClaim = '1';
    } else if (subFormId === 'L' || subFormId === 'LTC') {
      flags.ltcClaim = '1';
    } else if (subFormId === 'RS') {
      flags.resettleClm = '1';
    } else if (subFormId === 'F' || subFormId === 'FTE') {
      flags.fteClaim = '1';
    }

    return flags;
  }

  // form download API
  getDownloadLink(formId) {

    this.$common.showLoader();
    try {
      this.$form.getSignedFormDownloadLink(formId).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.downloadUrl.next(response.object);
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
}
