import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
declare var $: any;
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';

@Component({
    selector: 'app-add-documents-modal',
    templateUrl: './add-documents-modal.component.html',
    styleUrls: ['./add-documents-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddDocumentsModalComponent implements OnInit {
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Output() setRecordData = new EventEmitter();

  formObj: any = {
    ltcClaim: '0',
    pmtClaim: '0',
    tyClaim: '0',
  };
  disableBtn = false;
  config;

  constructor(
    private $common: CommonService,
    private $codeDocInfoApi: CodeDocInfoApiService,
    public $auth: AuthService
  ) { }

  userIdDetails;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
  }


  saveRecord() {
    
    const obj = { ...this.formObj };
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$codeDocInfoApi.createOrUpdate(obj).subscribe(
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

  reset() {
    this.formObj = {
      ltcClaim: '0',
      pmtClaim: '0',
      tyClaim: '0',
    };
    this.mainForm.resetForm(this.formObj);
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.formObj = changes.record.currentValue;
    } else if (changes.record) {
      this.formObj = {
        ltcClaim: '0',
        pmtClaim: '0',
        tyClaim: '0',
      };
    }
  }
}

