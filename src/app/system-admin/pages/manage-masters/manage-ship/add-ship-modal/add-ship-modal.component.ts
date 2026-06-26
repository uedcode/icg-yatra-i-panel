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
import { MasterShipApiService } from 'src/app/service/api/masters/master-ship-api.service';

@Component({
    selector: 'app-add-ship-modal',
    templateUrl: './add-ship-modal.component.html',
    styleUrls: ['./add-ship-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddShipModalComponent implements OnInit {

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
    private $ship: MasterShipApiService,
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
      codeUnitDTO: {
        unit: this.formObj.unit,
      },
    };
    try {
      this.$common.showLoader();
      let config = {
        headers: {},
      };
      this.$ship.createOrUpdate(obj).subscribe(
        (response) => {
          this.$common.hideLoader();
          
          if (response.status === true) {
            let object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#addship').modal('hide');
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

  // get list of forms
  getUnitDetails() {
    try {
      
      this.$common.showLoader();
      this.config = {
        headers: {
        },
      };
      this.$ship.getUnit(this.config).subscribe(
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
      codeUnitDTO: {},
    };
    this.mainForm.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.getUnitDetails();
      this.formObj = changes.record.currentValue;
      this.formObj.unit = this.formObj?.codeUnitDTO?.unit;
    }
  }
}

