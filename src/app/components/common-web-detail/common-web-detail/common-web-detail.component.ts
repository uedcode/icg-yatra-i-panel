import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-common-web-detail',
    templateUrl: './common-web-detail.component.html',
    styleUrls: ['./common-web-detail.component.scss'],
    standalone: false
})
export class CommonWebDetailComponent implements OnInit {

  constructor(private $auth: AuthService, private router: Router) { }

  ngOnInit() {
  }

  openUserManualModal() {
    $("#user_manual_modal").modal('show');
  }

  openContactDetail() {
    $("#contact_detail_modal").modal('show');
  }

  openFaqModal() {
    let moduleUrl = this.$auth.getModuleName();
    this.router.navigateByUrl(moduleUrl + `/faq`);
  }
}
