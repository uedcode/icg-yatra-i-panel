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
import { CommonService } from 'src/app/service/common.service';
import { MessageService } from 'src/app/service/master/message.service';

declare var $: any;

@Component({
  selector: 'app-add-message-modal',
  templateUrl: './add-message-modal.component.html',
  styleUrls: ['./add-message-modal.component.scss'],
  standalone: false,
})
export class AddMessageModalComponent implements OnInit {
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @Output() setRecordData = new EventEmitter();

  formObj: any = {};
  disableBtn = false;

  constructor(
    private $common: CommonService,
    private $message: MessageService
  ) {}

  ngOnInit() {}

  saveRecord() {
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$message.createOrUpdate(this.formObj).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          if (response.status === true) {
            const object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#addMessage').modal('hide');
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

