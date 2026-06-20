import { AuthService } from 'src/app/service/auth/auth.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { FaqApiService } from 'src/app/service/api/masters/faq-api.service';
declare var $: any;

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
    standalone: false
})
export class FaqComponent implements OnInit {
  location: any;

  constructor(
    private $common: CommonService,
    private $faq: FaqApiService,
    public $auth: AuthService
  ) {}
  @Output() setRecordData = new EventEmitter();
  @Input() dataList: Array<any> = [];

  searchObj;
  noOfPage = 10;
  p = 1;
  primaryId: any;
  userIdDetails;
  recordObj;

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.getDetails();
  }

  // Get start
  getDetails() {
    try {
      var config = {
        headers: {},
      };
      this.$common.showLoader();
      this.$faq.get(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.dataList = response.object;
            this.dataList = [...this.dataList];
            this.setRecordData.emit(this.dataList);
          }
        },
        (err) => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  // Get end

  openAddModal() {
    this.recordObj = {};
    $('#manage_faq').modal('show');
  }

  //   Edit start
  editRecord(object) {
    $('#manage_faq').modal('show');
    this.recordObj = { ...object };
  }
  //   Edit end

  // Delete start
  deleteRecord(primaryId) {
    var config = {
      headers: {
        ids: primaryId,
      },
    };
    this.$common.showLoader();
    this.$faq.delete(config).subscribe(
      (response: any) => {
        this.$common.hideLoader();
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter(
            (elem) => elem.faqId != primaryId
          );
        }
      },
      (err) => {
        this.$common.hideLoader();
      }
    );
  }
  // Delete end

  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end

  closeSidebar() {
    $('.sidebar-gone').addClass('sidenav-toggled');
  }
}
