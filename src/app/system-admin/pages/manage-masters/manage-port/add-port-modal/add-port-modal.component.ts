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
import { MasterPortService } from 'src/app/service/master/master-port.service';

@Component({
    selector: 'app-add-port-modal',
    templateUrl: './add-port-modal.component.html',
    styleUrls: ['./add-port-modal.component.css'],
    standalone: false
})
export class AddPortModalComponent implements OnInit {
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Output() setRecordData = new EventEmitter();

  formObj: any = {
    isRequired: "No",
  };
  config;

  constructor(
    private $common: CommonService,
    private $port: MasterPortService,
    private $codeSubForm: CodeSubFormService,
    public $auth: AuthService
  ) { }

  dropdownList: any = [];
  userIdDetails;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    
  }

  saveRecord() {
    let obj = {
      ...this.formObj,
    };
    try {
      this.$common.showLoader();
      let config = {
        headers: {},
      };
      this.$port.createOrUpdate(obj).subscribe(
        (response) => {
          this.$common.hideLoader();
          
          if (response.status === true) {
            let object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#addport').modal('hide');
            if (!this.formObj.id) {
              this.dataList.push(object);
            } else {
              var index = this.dataList.findIndex(
                (elem) => elem.id == object.id
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
          console.log(error);
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
    };
    this.mainForm.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.formObj = changes.record.currentValue;
    }
  }
}
