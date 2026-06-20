import { AuthService } from 'src/app/service/auth/auth.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { FaqApiService } from 'src/app/service/api/masters/faq-api.service';
declare var $: any;

@Component({
    selector: 'app-common-manage-faq',
    templateUrl: './common-manage-faq.component.html',
    styleUrls: ['./common-manage-faq.component.css'],
    standalone: false
})
export class CommonManageFaqComponent implements OnInit {

  constructor(private $common: CommonService, private $faq: FaqApiService, public $auth: AuthService) { }
  @Output() setRecordData = new EventEmitter();
  @Input() dataList: Array<any> = []
  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.getDetails();
  }

  searchObj;
  noOfPage = 1000;
  p = 1;
  primaryId: any;
  userIdDetails;
  recordObj;
  getDetails() {
    try {
      var config = {
        headers: {
        }
      }
      this.$common.showLoader();
      this.$faq.get(config).subscribe((response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.dataList = response.object;
          this.dataList = [...this.dataList];
          this.setRecordData.emit(this.dataList);
        }
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  openAddModal() {
    this.recordObj = {};
    $("#manage_faq").modal('show');
  }

  editRecord(object) {
    $("#manage_faq").modal('show');
    this.recordObj = { ...object };
  }

  deleteRecord(primaryId) {
    var config = {
      headers: {
        "ids": primaryId,
      }
    }
    this.$common.showLoader();
    this.$faq.delete(config).subscribe((response: any) => {
      this.$common.hideLoader();
      if (response.status === true) {
        this.$common.showMessage(`${response.message}`);
        this.dataList = this.dataList.filter(elem => elem.faqId != primaryId)
      }
    }, err => {
      this.$common.hideLoader();
    })
  }

  /** Download Report Starts */
  setFileName() {
    let currentTime = this.$common.getCurrentTimeStamp();
    let fileName = "";
    fileName = "FAQ_" + currentTime;
    return fileName;
  }

  downloadReport() {
    this.p = 1;
    this.noOfPage = 100000;
    let fileName = this.setFileName();
    setTimeout(() => {
      $("#exportData").table2excel({
        // exclude CSS class
        exclude: ".noExl",
        name: fileName,
        filename: fileName, //do not include extension
        fileext: ".xls" // file extension
      });
      this.noOfPage = 10;
    }, 1000);
  }
  /** Download Report Ends */

  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end

  closeSidebar() {
    $(".sidebar-gone").addClass("sidenav-toggled");
  }

}

