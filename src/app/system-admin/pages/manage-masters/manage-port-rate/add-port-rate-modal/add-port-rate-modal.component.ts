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
import { PortRateApiService } from 'src/app/service/api/masters/port-rate-api.service';

declare var $: any;

@Component({
  selector: 'app-add-port-rate-modal',
  templateUrl: './add-port-rate-modal.component.html',
  styleUrls: ['./add-port-rate-modal.component.scss'],
  standalone: false,
})
export class AddPortRateModalComponent implements OnInit {
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @Output() setRecordData = new EventEmitter();
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;

  formObj: any = {};
  disableBtn = false;
  stationList: Array<any> = [];

  constructor(
    private $common: CommonService,
    private $portRate: PortRateApiService
  ) {}

  ngOnInit() {
    this.getStations();
  }

  getStations() {
    try {
      this.$common.showLoader();
      this.$portRate.getPortRateStations().subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.stationList = Array.isArray(response.object) ? response.object : [];
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

  saveRecord() {
    if (!this.formObj.from) {
      this.$common.showMessage('Please Select From Station');
      return;
    }
    if (!this.formObj.to) {
      this.$common.showMessage('Please Select To Station');
      return;
    }
    if (this.formObj.from === this.formObj.to) {
      this.$common.showMessage("From Station and To station can't be same");
      return;
    }

    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$portRate.createOrUpdate({ ...this.formObj }).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          this.disableBtn = false;
          if (response.status === true) {
            const object = response.object?.[0] || {};
            this.$common.showMessage(`${response.message}`);
            $('#addportrate').modal('hide');
            if (!this.formObj.yatPortRateId) {
              this.dataList.push(object);
            } else {
              const index = this.dataList.findIndex(
                (elem) => elem.yatPortRateId == object.yatPortRateId
              );
              if (index > -1) {
                this.dataList[index] = object;
              }
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
    this.mainForm.resetForm(this.formObj);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.record?.currentValue) {
      this.formObj = { ...changes.record.currentValue };
    } else if (changes?.record) {
      this.formObj = {};
    }
  }
}
