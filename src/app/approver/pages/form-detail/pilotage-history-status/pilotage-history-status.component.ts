import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { PilotageHistoryService } from 'src/app/service/pilotage-history.service';
declare var $: any;

@Component({
    selector: 'app-pilotage-history-status',
    templateUrl: './pilotage-history-status.component.html',
    styleUrls: ['./pilotage-history-status.component.css'],
    standalone: false
})
export class PilotageHistoryStatusComponent implements OnInit {

codeStatus: { activate: string; deactivate: string; pending: string; approved: string; rejected: string; success: string; processing: string; cancel: string; outbox: string; draft: string; inbox: string; };
  userIdDetails: any;
  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $pilotageService: PilotageHistoryService,
    public $formManage: FormManageService,
    private router: Router,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  pilotageHistoryChildDTOs: any = [];
  noOfPage: any = 10;
  p: any = 1;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
  }

  filterDataObj;
  getState() {
    this.$common.showLoader();
    try {
      this.config = {
        headers: {
        unitId:this.userIdDetails.unitId
      }
    }
      
      this.$pilotageService.getHistory(this.config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let object = response.object;
            this.dataList=object;
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


  changeStatusObj: any = {};
  changeStatusWithApprover(statusId, requestType) {
    
    if (requestType == 'Approve') {
      this.changeStatusObj.requestType = 'Approve';
    } else {
      this.changeStatusObj.requestType = 'Reject';
    }
    this.changeStatusObj.statusId = statusId;
    $('#change_status_approver_modal').modal('show');
  }
  openModal(list) {
    
    this.pilotageHistoryChildDTOs = list;
    $("#view_pilotage_details").modal('show');
  }

  viewForm(data) {

    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?id=${data.formId}`
    );
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  actionPage(url) {
    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${url}`
    );
  }

}
