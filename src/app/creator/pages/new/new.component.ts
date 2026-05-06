import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
declare var $: any;

@Component({
    selector: 'app-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss'],
    standalone: false
})
export class NewComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private router: Router,
    private $common: CommonService,
    private $codeSubForm: CodeSubFormService,
  ) { }

  dataList: any = [];
  config: any;
  userIdDetails;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.getForm();
  }


  getForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          formId: 'PIL'
        }
      }
      this.$codeSubForm.get(this.config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.dataList = response?.object;
        }
      }, err => {
        this.$common.hideLoader();
        console.log(err);
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  actionPage(data) {
    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(
      moduleUrl + `/${data?.formUrl}?subFormId=${data.subFormId}`
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
  // data shorting end
}



