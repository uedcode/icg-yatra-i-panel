import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
declare var $: any;

@Component({
    selector: 'app-creator-profile',
    templateUrl: './creator-profile.component.html',
    styleUrls: ['./creator-profile.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CreatorProfileComponent implements OnInit {
  @Input() dataList: Array<any> = []


  constructor() { }
  
  formObj: any = {};
  formId: any;
  today: any;

  id: any;
  dataObj: any = {
  };
  noOfPage: any = 10;
  pageType: any;
  p = 1;
  searchObj;

  ngOnInit() {
  }
  saveRecord() {

  }
}

