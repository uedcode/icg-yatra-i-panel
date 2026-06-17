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
import { PayLevelService } from 'src/app/service/master/pay-level.service';

declare var $: any;

@Component({
  selector: 'app-add-pay-level-modal',
  templateUrl: './add-pay-level-modal.component.html',
  styleUrls: ['./add-pay-level-modal.component.scss'],
  standalone: false,
})
export class AddPayLevelModalComponent implements OnInit {
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @Output() setRecordData = new EventEmitter();

  formObj: any = {
    tyAccommodation: 0,
    tyTravel: 0,
    tyFood: 0,
    pmtKg: 0,
    pmtPerKg: 0,
    availedCategory: 0,
  };
  disableBtn = false;

  constructor(
    private $common: CommonService,
    private $payLevel: PayLevelService
  ) {}

  ngOnInit() {}

  saveRecord() {
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$payLevel.createOrUpdate(this.formObj).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          if (response.status === true) {
            const object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#addPayLevel').modal('hide');
            const index = this.dataList.findIndex(
              (elem) => elem.payLevel == object.payLevel
            );
            if (index > -1) this.dataList[index] = object;
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
      tyAccommodation: 0,
      tyTravel: 0,
      tyFood: 0,
      pmtKg: 0,
      pmtPerKg: 0,
      availedCategory: 0,
    };
    this.mainForm.resetForm(this.formObj);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.formObj = {
        tyAccommodation: 0,
        tyTravel: 0,
        tyFood: 0,
        pmtKg: 0,
        pmtPerKg: 0,
        availedCategory: 0,
        ...changes.record.currentValue,
      };
    }
  }
}


