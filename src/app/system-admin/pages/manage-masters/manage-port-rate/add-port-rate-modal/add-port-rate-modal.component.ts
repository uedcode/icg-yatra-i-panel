import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
declare var $: any;
import { NgForm } from '@angular/forms';
import { DocumentService } from 'src/app/service/form/document.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { MasterPortService } from 'src/app/service/master/master-port.service';
import { MasterPortRateService } from 'src/app/service/master/master-port-rate.service';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'app-add-port-rate-modal',
    templateUrl: './add-port-rate-modal.component.html',
    styleUrls: ['./add-port-rate-modal.component.scss'],
    standalone: false
})
export class AddPortRateModalComponent implements OnInit {

  @Input() record: any;
   @Input() dataList: Array<any> = [];
   @ViewChild('mainForm', { static: true }) mainForm: NgForm;
   @Output() setRecordData = new EventEmitter();
 
   formObj: any = {
     isRequired: "No",
     visibilityIndicator: '1',
   };
   config;
 
   constructor(
     private $common: CommonService,
     private $port: MasterPortService,
     private datePipe: DatePipe,
     private $portRate: MasterPortRateService,
     private $codeSubForm: CodeSubFormService,
     public $auth: AuthService
   ) { }
 
   dropdownList: any = [];
   userIdDetails;
 
   ngOnInit() {
     this.userIdDetails = this.$auth.getUserDetails();
     this.getPortName();
     
   }
 
   saveRecord() {
     let obj = {
       ...this.formObj,
     };
     if (this.formObj.portId) {
      obj.masterPortDTO = { id: this.formObj.portId };
    }
    if(this.formObj.effectiveDate){
      obj.effectiveDate = new Date(this.formObj.effectiveDate).getTime();
    }
    
    if (this.formObj.parentId) {
      obj.parentMasterPortDTO = { id: this.formObj.parentId };
    }else{
      obj.parentMasterPortDTO=null;
    }
     try {
       this.$common.showLoader();
       let config = {
         headers: {},
       };
       this.$portRate.createOrUpdate(obj).subscribe(
         (response) => {
           this.$common.hideLoader();
           
           if (response.status === true) {
             let object = response.object[0];
             this.$common.showMessage(`${response.message}`);
             $('#addportrate').modal('hide');
             if(this.formObj?.portId){
              let tempObj = this.dropdownList.find((e) => e.id === this.formObj?.portId);
              object.masterPortDTO=tempObj
             }
             if(this.formObj?.parentId){
              let tempObj = this.dropdownList.find((e) => e.id === this.formObj?.parentId);
              object.parentMasterPortDTO=tempObj
             }
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
  getPortName() {
    try {
      
      this.$common.showLoader();
      this.config = {
        headers: {
        },
      };
      this.$port.get(this.config).subscribe(
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
     };
     this.mainForm.resetForm();
   }
 
   ngOnChanges(changes: SimpleChanges) {
 
     if (!changes) return;
     if (changes.record && changes.record.currentValue) {
       this.formObj = changes.record.currentValue;
       this.formObj.portId = this.formObj?.masterPortDTO?.id;
       this.formObj.parentId = this.formObj?.parentMasterPortDTO?.id;
       this.formObj.effectiveDate = this.datePipe.transform(this.formObj.effectiveDate, 'yyyy-MM-dd');
     }
   }
 }
 
