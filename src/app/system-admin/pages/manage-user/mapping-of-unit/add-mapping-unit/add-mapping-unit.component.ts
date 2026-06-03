import {Component, Input, OnInit, Output, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MappingService } from 'src/app/service/admin/mapping.service';

declare var $: any;

@Component({
    selector: 'app-add-mapping-unit',
    templateUrl: './add-mapping-unit.component.html',
    styleUrls: ['./add-mapping-unit.component.scss'],
    standalone: false
})
export class AddMappingUnitComponent implements OnInit {
  @Input() record: any;
  @Input() dataList: Array<any> = [];
  @ViewChild('mainForm', { static: true }) mainForm: NgForm;
  @Output() setRecordData = new EventEmitter();

  formObj: any = {};

  constructor(
    private $common: CommonService,
    private $mapping: MappingService,
    private datePipe: DatePipe
  ) { }
  unitList: any = [];
  mappingTypeList: any = [
    {
      id: 'ST',
      descr: 'Station HQ'
    },
    {
      id: 'RHQ',
      descr: 'RHQ'
    },
    {
      id: 'DHQ',
      descr: 'DHQ'
    },
  ];
  ngOnInit() {
    this.getUnitList();
  }

  saveRecord() {
    try {
      this.$common.showLoader();
      let formObj = {
        ...this.formObj,
        codeUnitDTO: {
          unit: this.formObj.codeHrUnitId
        },
        mappedUnitDTO: {
          unit: this.formObj.parentHrUnitId
        }
      }
      this.$mapping.createOrUpdate(formObj).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            $('#unitMapping').modal('hide');
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
          }else{
            this.$common.showMessage(`${response.message}`);
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
  getUnitList() {
    try {
      this.$common.showLoader();
      let config = {
        headers: {},
      };
      this.$mapping.getUnit(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.unitList = response.object;
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
    this.formObj = {};
    this.mainForm.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.record && changes.record.currentValue) {
      this.formObj = changes.record.currentValue;
    }
  }
}

