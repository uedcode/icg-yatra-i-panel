
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { FormDocumentService } from 'src/app/service/core/form-document.service';
import { FormWorkflowService } from 'src/app/service/core/form-workflow.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-document',
    templateUrl: './common-document.component.html',
    styleUrls: ['./common-document.component.scss'],
    standalone: false
})
export class CommonDocumentComponent implements OnInit {
  dataForTable: any[];
  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    private route: ActivatedRoute,
    private $formDocument: FormDocumentService,
    private $formWorkflow: FormWorkflowService,
    public $codeDocInfo: CodeDocInfoApiService
  ) { }

  fileUrl = environment.fileUrl;
  tempObj;
  subFormId;
  formId;
  isEdit = false;
  supplementryId;
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.formId = params?.id;
      this.supplementryId = params?.supId;
      this.subFormId = params?.subFormId;
      if (this.formId || this.supplementryId) {
        this.getFormDetails();
      } else if (this.subFormId) {
        this.getDocument(null);
      }
    });
  }

  // for getting subFormId
  getFormDetails() {
    this.$common.showLoader();
    this.$formWorkflow
      .loadFormDetails({
        id: this.formId,
        subFormId: this.subFormId,
        supId: this.supplementryId,
      })
      .subscribe(
        (res) => {
          this.$common.hideLoader();
          if (!res) {
            return;
          }
          this.tempObj = res;

          this.documentDtos = this.clearFormDTOIfSupplementry(
            this.tempObj?.formDocsDTOs,
            this.supplementryId
          );
          this.$codeDocInfo.setDocument(this.documentDtos);
          this.subFormId = this.tempObj?.codeSubFormDTO?.subFormId;
          this.getDocument(this.documentDtos);
        },
        (error) => {
          this.$common.hideLoader();
          console.log(error);
        }
      );
  }
  clearFormDTOIfSupplementry(documents: any[], supplementryId: any): any[] {
    if (!supplementryId || !Array.isArray(documents)) {
      return documents;
    }

    return documents.map(doc => {
      return {
        ...doc,
        formDocsId: null,
        formDTO: null   // 👈 formDTO empty kar diya
      };
    });
  }

  private getDocInfo(data: any) {
    return data?.codeDocInfoDTO || null;
  }

  // Get document start
  documentList: any = [];
  tempDocumentList: any = [];

  // getDocument(list) {
  //   this.$formManage?.getDocument(this.subFormId);
  //   this.$formManage?.documentList.subscribe((res) => {
  //     if (res) {
  //       this.documentList = res;
  //       this.tempDocumentList = res;

  //       if (this.formId && list?.length > 0) {
  //         list.map((item) => {
  //           this.tempDocumentList = this.tempDocumentList.filter(
  //             (elem) => elem?.docName != item?.codeDocInfoDTO?.docName
  //           );
  //         })
  //       }

  //     }
  //   });
  // }

  getDocument(list) {
    this.$common.showLoader();
    this.$formDocument.loadRequiredDocuments(this.subFormId).subscribe(
      (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          return;
        }

        this.documentList = response?.object || [];
        this.tempDocumentList = [...this.documentList];

        // Ensure "Other" document is always available
        const otherDoc = this.documentList.find((doc) => doc?.docName === 'Other');
        if (!this.tempDocumentList.some((doc) => doc?.docName === 'Other') && otherDoc) {
          this.tempDocumentList.push(otherDoc);
        }

        if (this.formId && list?.length > 0) {
          list.map((item) => {
            this.tempDocumentList = this.tempDocumentList.filter(
              (elem) => elem?.docName.toLowerCase() != this.getDocInfo(item)?.docName?.toLowerCase()
            );
          });

          // Re-add "Other" document after filtering
          if (!this.tempDocumentList.some((doc) => doc?.docName === 'Other') && otherDoc) {
            this.tempDocumentList.push(otherDoc);
          }
        }
      },
      (error) => {
        this.$common.hideLoader();
        console.log(error);
      }
    );
  }

  // Get document end

  // Image upload and delet start
  uploadImg(event, fileName) {
    let isValidExtension = this.$common.checkForValidFile(event);
    if (!isValidExtension) {
      return (this.documentObj.url = null);
    }
    const file = event?.currentTarget?.files?.[0];
    if (!file) {
      return;
    }

    this.$common.showLoader();
    this.$formDocument.uploadSupportDoc(file).subscribe(
      (res) => {
        this.$common.hideLoader();
        if (fileName == 'url') this.documentObj.url = res;
      },
      (error) => {
        this.$common.hideLoader();
        console.log(error);
      }
    );
  }


  deleteDoc(fileName) {
    if (fileName !== 'url') {
      return;
    }

    if (!this.documentObj.url) {
      this.documentObj.url = null;
      return this.$common.showMessage("Missing file path", 'danger');
    }

    this.$common.showLoader();
    this.$formDocument.deleteSupportDocByUrl(this.documentObj.url).subscribe(
      (deleted) => {
        this.$common.hideLoader();
        if (deleted) {
          this.documentObj.url = null;
        }
      },
      (error) => {
        this.$common.hideLoader();
        console.log(error);
      }
    );
  }
  // Image upload and delet end

  // Document add start
  documentObj: any = {};
  @Input() documentDtos: any = [];
  docIndex: any = null;
  isOtherDoc: any = false;

  documentChange() {
    let tempDocObj = this.tempDocumentList.find(
      (e) => e?.docName === this.documentObj?.docName
    );
    ;
    if (tempDocObj?.docName === 'Other') {
      this.isOtherDoc = true;
    } else {
      this.isOtherDoc = false;
      this.documentObj.otherDocName = '';
    }
  }


  // addDocument() {

  //   if(!this.documentObj?.docName){
  //     return this.$common.showMessage("Please select Document Name", 'danger');
  //   }
  //   if(!this.documentObj?.url){
  //     return this.$common.showMessage("Please choose Document", 'danger');
  //   }
  //   let tempDocObj = this.tempDocumentList.find(
  //     (e) => e?.docName === this.documentObj?.docName
  //   );
  //   this.documentDtos= this.documentDtos.filter(
  //     (e) => this.documentObj?.docName !== e?.codeDocInfoDTO?.docName
  //   );
  //   let obj = {
  //     ...this.documentObj,
  //     codeDocInfoDTO: {
  //       id: tempDocObj?.id,
  //       docName: tempDocObj?.docName,
  //     },
  //   };
  //   if (obj) {
  //     this.documentDtos.push(obj);
  //   }
  //   // if (this.docIndex == null && obj) {
  //   //   this.documentDtos.push(obj);
  //   // } else {
  //   //   this.documentDtos[this.docIndex] = obj;
  //   // }
  //   if (tempDocObj?.docName != 'Other') {
  //     this.tempDocumentList = this.tempDocumentList.filter(
  //       (e) => e?.docName != this.documentObj?.docName
  //     );
  //   }
  //   this.$codeDocInfo.setDocument(this.documentDtos);
  //   this.resetDocument();
  // }

  addDocument() {

    // Validation
    if (!this.documentObj?.docName) {
      this.$common.showMessage("Please select a document name.", 'danger');
      return;
    }
    if (!this.documentObj?.url) {
      this.$common.showMessage("Please upload the document before adding.", 'danger');
      return;
    }

    const tempDocObj = this.tempDocumentList.find(
      (e) => e?.docName === this.documentObj?.docName
    );

    if (!tempDocObj) {
      this.$common.showMessage("Invalid document selection.", 'danger');
      return;
    }

    const normalizedOtherDocName = (this.documentObj?.otherDocName || '').trim();
    if (tempDocObj?.docName === 'Other' && !normalizedOtherDocName) {
      this.$common.showMessage("Please enter the other document name.", 'danger');
      return;
    }

    const newObj = {
      ...this.documentObj,
      otherDocName: normalizedOtherDocName,
      descr: normalizedOtherDocName,
      codeDocInfoDTO: {
        id: tempDocObj?.id,
        docName: tempDocObj?.docName,
      },
    };

    // Check for duplicates
    const isDuplicate = this.documentDtos.some((doc) => {
      if (newObj.codeDocInfoDTO?.docName === "Other") {
        return (
          String(doc.otherDocName || doc.descr || '').trim().toLowerCase() ===
          newObj.otherDocName.toLowerCase()
        );
      }
      return (
        String(this.getDocInfo(doc)?.docName || '').trim().toLowerCase() ===
        newObj.codeDocInfoDTO?.docName?.toLowerCase()
      );
    });
    if (!this.isEdit) {
      if (isDuplicate) {
        this.$common.showMessage("Document already added.", 'warning');
        return;
      }
    }

    // Add or update document
    if (this.docIndex !== null) {
      this.documentDtos[this.docIndex] = newObj;
      this.docIndex = null;
    } else {
      this.documentDtos.push(newObj);
      if (tempDocObj.docName !== "Other") {
        this.tempDocumentList = this.tempDocumentList.filter(
          (e) => e?.docName !== tempDocObj?.docName
        );
      }
    }

    if (this.isEdit) {
      this.isEdit = false;
    }
    // Update the document list and reset the form
    this.$codeDocInfo.setDocument(this.documentDtos);
    this.resetDocument();
  }




  editDocument(data, i) {
    const tempDocObj = this.documentList.find(
      (e) => e?.id === this.getDocInfo(data)?.id
    );
    if (tempDocObj?.docName !== 'Other' && tempDocObj) {
      if (!this.tempDocumentList.some((e) => e?.id === tempDocObj?.id)) {
        this.tempDocumentList.push(tempDocObj);
      }
      this.isOtherDoc = false;
    } else if ((tempDocObj?.docName || this.getDocInfo(data)?.docName) === 'Other') {
      this.isOtherDoc = true;
    }
    this.documentObj = {
      docName: tempDocObj?.docName || this.getDocInfo(data)?.docName,
      otherDocName: data?.otherDocName || data?.descr || '',
      url: data?.url || '',
    };
    this.docIndex = i;
    this.isEdit = true;
  }


  deleteDocument(data, i) {

    let tempDocObj = this.documentList.find(
      (e) => e?.id === this.getDocInfo(data)?.id
    );
    if (tempDocObj?.docName != 'Other' && tempDocObj) {
      this.tempDocumentList?.push(tempDocObj);
    }
    this.documentDtos.splice(i, 1);
    this.$codeDocInfo.setDocument(this.documentDtos);
    if (this.docIndex === i) {
      this.resetDocument();
      this.isEdit = false;
    }
  }

  resetDocument() {

    this.documentObj = {};
    this.docIndex = null;
    this.isOtherDoc = false;
  }
  // Document add end
}

