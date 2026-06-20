import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from 'src/app/service/core/common.service';
import { BusinessRuleApiService } from 'src/app/service/api/masters/business-rule-api.service';

declare var $: any;

@Component({
  selector: 'app-add-business-rule-modal',
  templateUrl: './add-business-rule-modal.component.html',
  styleUrls: ['./add-business-rule-modal.component.scss'],
  standalone: false,
})
export class AddBusinessRuleModalComponent implements OnInit {
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @Output() setRecordData = new EventEmitter();

  formObj: any = {};
  disableBtn = false;

  constructor(
    private $common: CommonService,
    private $businessRule: BusinessRuleApiService
  ) {}

  ngOnInit() {}

  saveRecord() {
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$businessRule.createOrUpdate(this.formObj).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          if (response.status === true) {
            const object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#addBusinessRule').modal('hide');
            if (!this.formObj.id) {
              this.dataList.push(object);
            } else {
              const index = this.dataList.findIndex(
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

