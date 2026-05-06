import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
declare var $: any;

@Component({
    selector: 'app-outbox',
    templateUrl: './outbox.component.html',
    styleUrls: ['./outbox.component.scss'],
    standalone: false
})
export class OutboxComponent implements OnInit {
  codeStatus;
  userIdDetails: any;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $form: FormService,
    private router: Router,
    private datePipe: DatePipe,
    public $formManage: FormManageService,
    private $codeSubForm: CodeSubFormService
  ) {}

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  id: any;
  pageType: any;
  config: any;
  filterObj: any = {};

  noOfPage: any = 10;
  p = 1;
  searchObj;
  toggleFilter: any = false;
  formList;
  today;

  ngOnInit() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeStatus = this.$auth.codeStatus();
    this.getState();
    this.getForm();
  }

  getForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: this.userIdDetails?.formId,
        },
      };
      this.$codeSubForm.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.formList = response?.object;
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
  filterDataObj;
  getState() {
    this.filterDataObj = {
      formName: this.filterObj?.formName,
      fromDate: new Date(this.filterObj?.fromDate).getTime(),
      toDate: new Date(this.filterObj?.toDate).getTime(),
    };
    this.$formManage?.getState(this.codeStatus?.outbox);
    this.$formManage?.formStateList.subscribe((res) => {
      if (res) {
        this.dataList = res;
      }
    });
  }

  viewForm(data) {
    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.viewUrl}?id=${data.formId}`
    );
  }
 formId;
  viewHistory(formId: any): void {
    
    this.formId = formId; // just set formId
    setTimeout(() => {
      $('#viewHistoryModal').modal('show');
    }, 0);
  }
  reset() {
    this.filterObj = {};
    this.getState();
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}
