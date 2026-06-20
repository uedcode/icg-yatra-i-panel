import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';

declare var $: any;
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

    constructor(
      private $common: CommonService,
      public $auth: AuthService
    ) { }

    /**Contants */
    userIdDetails: any;
    codeRoleList: any = [];

    ngOnInit(): void {
        try {
            if (sessionStorage.getItem("isReload")) {
                setTimeout(() => {
                    sessionStorage.removeItem("isReload");
                    location.reload();
                }, 100);
            } else {
                this.userIdDetails = this.$auth.getUserDetails();
                this.codeRoleList = this.$auth.codeRoleType();
                this.$common.hideLoader();
            }
        } catch (error) {
            this.$common.hideLoader();
            console.log(error);
        }
    }
}
