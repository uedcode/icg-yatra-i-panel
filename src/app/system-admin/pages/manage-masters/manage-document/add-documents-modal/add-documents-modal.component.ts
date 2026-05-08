import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
declare var $: any;
import { NgForm } from '@angular/forms';
import { DocumentService } from 'src/app/service/document.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
    selector: 'app-add-documents-modal',
    templateUrl: './add-documents-modal.component.html',
    styleUrls: ['./add-documents-modal.component.scss'],
    standalone: false
})
export class AddDocumentsModalComponent implements OnInit {
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Output() setRecordData = new EventEmitter();

  formObj: any = {
    isRequired: "No",
  };
  disableBtn = false;
  config;

  constructor(
    private $common: CommonService,
    private $document: DocumentService,
    private $codeSubForm: CodeSubFormService,
    public $auth: AuthService
  ) { }

  dropdownList: any = [];
  userIdDetails;
  documentStatusList: any = [
    {
      descr: "Yes"
    },
    {
      descr: "No"
    }
  ];
  visibilityIndicatorList: any = [
    {
      "descr": "No",
      "id": "0",
    },
    {
      "descr": "Yes",
      "id":"1",
    }
  ];
  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.getCodeSubForm();
  }


  saveRecord() {
    
    let obj = {
      ...this.formObj,
      codeSubFormDTO: {
        subFormId: this.formObj.subFormId,
      },
    };
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$document.createOrUpdate(obj).subscribe(
        (response) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          if (response.status === true) {
            let object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#adddocuments').modal('hide');
            if (!this.formObj.docInfoId) {
              this.dataList.push(object);
            } else {
              var index = this.dataList.findIndex(
                (elem) => elem.docInfoId == object.docInfoId
              );
              this.dataList[index] = object;
            }
            this.dataList = [...this.dataList];
            this.setRecordData.emit(this.dataList);
            this.reset();
          }
        },
        (error) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          console.log(error);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      this.disableBtn = false;
      console.log(error);
    }
  }

  // get list of forms
  getCodeSubForm() {
    try {
      
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.userIdDetails?.moduleId,
        },
      };
      this.$codeSubForm.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;
            
            this.dropdownList = list;
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
    this.formObj = {
      isRequired: "No",
      codeSubFormDTO: {},
    };
    this.mainForm.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.formObj = changes.record.currentValue;
      this.formObj.subFormId = this.formObj?.codeSubFormDTO?.subFormId;
    } else if (changes.record) {
      this.formObj = {
        isRequired: "No",
        codeSubFormDTO: {},
      };
    }
  }
}
