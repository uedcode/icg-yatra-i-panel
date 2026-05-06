import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { FaqService } from 'src/app/service/faq.service';
declare var $: any;

@Component({
    selector: 'app-common-faq',
    templateUrl: './common-faq.component.html',
    styleUrls: ['./common-faq.component.css'],
    standalone: false
})
export class CommonFaqComponent implements OnInit {

  constructor(private $common: CommonService, private $auth: AuthService, private $faq: FaqService) { }

  dataList: any = [];

  ngOnInit() {
    this.getDetails();
  }

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
          let list = response.object;
          list?.map((item) => {
            item.isActive = false;
          })
          list[0].isActive = true;
          this.dataList = list;
        }
      }, err => {
        this.$common.hideLoader();
      })
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  closeSidebar() {
    $(".sidebar-gone").addClass("sidenav-toggled");
  }

  showAnswer(faqId) {
    
    this.dataList?.map((item) => {
      if (item?.faqId == faqId) {
        item.isActive = true;
      }
      else {
        item.isActive = false;
      }
    })
  }

}
