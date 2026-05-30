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
  dashboardRoute = '/login';

  ngOnInit() {
    this.dashboardRoute = this.getDashboardRoute();
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
          const list = Array.isArray(response.object) ? response.object : [];
          list.map((item) => {
            item.isActive = false;
          });
          if (list.length > 0) {
            list[0].isActive = true;
          }
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

  private getDashboardRoute(): string {
    const moduleUrl = this.$auth.getModuleName();
    if (moduleUrl) {
      return `${moduleUrl}/dashboard`;
    }
    return '/login';
  }

}

