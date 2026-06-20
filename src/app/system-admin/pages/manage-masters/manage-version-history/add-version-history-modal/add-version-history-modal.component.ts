import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from 'src/app/service/core/common.service';
import { VersionHistoryApiService } from 'src/app/service/api/masters/version-history-api.service';

declare var $: any;

@Component({
    selector: 'app-add-version-history-modal',
    templateUrl: './add-version-history-modal.component.html',
    styleUrls: ['./add-version-history-modal.component.scss'],
    standalone: false
})
export class AddVersionHistoryModalComponent implements OnInit {
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @Output() setRecordData = new EventEmitter();
  formObj: any = {};
  disableBtn = false;

  constructor(
    private $common: CommonService,
    private $versionhistory: VersionHistoryApiService
  ) {}

  ngOnInit() {}

  saveRecord() {
    
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$versionhistory.createOrUpdate(this.formObj).subscribe(
        (response) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          if (response.status === true) {
            let object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#addVersion').modal('hide');
            if (!this.formObj.verHisId) {
              this.dataList.push(object);
            } else {
              var index = this.dataList.findIndex(
                (elem) => elem.verHisId == object.verHisId
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
    this.formObj = {};
    this.mainForm.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.formObj = changes.record.currentValue;
    } else if (changes.record) {
      this.formObj = {};
    }
  }
}

