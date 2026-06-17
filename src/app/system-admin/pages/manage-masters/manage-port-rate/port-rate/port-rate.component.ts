import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { MasterPortRateService } from 'src/app/service/master/master-port-rate.service';
declare var $: any;

@Component({
    selector: 'app-port-rate',
    templateUrl: './port-rate.component.html',
    styleUrls: ['./port-rate.component.scss'],
    standalone: false
})
export class PortRateComponent implements OnInit {

  constructor(
      private $common: CommonService,
      private $portRate: MasterPortRateService,
      public $auth: AuthService
    ) {}
  
    @Input() dataList: Array<any> = [];
  
    id: any;
    dataObj: any = {};
    noOfPage: any = 10;
    p = 1;
    searchObj;
    userIdDetails;
  
    ngOnInit() {
      this.userIdDetails = this.$auth.getUserDetails();
      this.getAll();
    }
  
    config: any;
   
    getAll() {
      
      try {
        this.$common.showLoader();
        this.config = {
          headers: {
            
          },
        };
        
        this.$portRate.get(this.config).subscribe(
          (response: any) => {
            this.$common.hideLoader();
            if (response.status === true) {
              this.dataList = Array.isArray(response.object) ? response.object : [];
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
  
    // edit start
    editRecord(obj) {
      
      $('#addportrate').modal('show');
      this.dataObj = { ...obj };
    }
    // edit end
  
    // delete start
    deleteList(id) {
      try {
        this.$common.showLoader();
        var config = {
          headers: {
            ids: id,
          },
        };
        this.$portRate.delete(config).subscribe(
          (response: any) => {
            this.$common.hideLoader();
            if (response.status === true) {
              this.$common.showMessage(response.message);
              this.dataList = this.dataList.filter((elem) => elem.yatPortRateId != id);
              $('#delete_modal').modal('hide');
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
    // delete end
  
   
    // data shorting start
    key: string = 'yatPortRateId';
    reverse: boolean = false;
    sort(key) {
      this.key = key;
      this.reverse = !this.reverse;
    }
    // data shorting end

  
  }
  
