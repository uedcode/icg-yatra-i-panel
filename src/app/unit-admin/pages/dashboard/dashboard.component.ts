import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';

declare var $: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

    constructor(private $common: CommonService, public $auth: AuthService,
        private route: Router) { }

    /**Contants */
    userIdDetails: any;
    codeRoleList: any = [];

    dashboardObj: any = {};

    timeInt;

    ngOnInit(): void {
        try {
            if (sessionStorage.getItem("isReload")) {
                setTimeout(() => {
                    sessionStorage.removeItem("isReload");
                    location.reload();
                }, 100);
            } else {
                this.$common.showLoader();
                this.userIdDetails = this.$auth.getUserDetails();
                this.codeRoleList = this.$auth.codeRoleType();
                this.initDashboardService("-1");
            }
        } catch (error) {
            this.$common.hideLoader();
            console.log(error);
        }
    }

    initDashboardService(dateFilter) {
        clearInterval(this.timeInt);

        // this.getDetails(dateFilter);
        // this.timeInt = setInterval(() => {
        //     this.getDetails(dateFilter);
        // }, 30000); // 30 Seconds
    }

    ngOnDestroy() {
        if (this.timeInt) {
            clearInterval(this.timeInt);
        }
    }

    getDetails(dateFilter = "1") {
        try {
            this.$auth.getDashboardDetails("1", dateFilter).subscribe((response: any) => {
                this.$common.hideLoader();
                if (response.status === true) {
                    this.dashboardObj = response.object;
                    localStorage.removeItem("isDashboard");
                }
            }, err => {
                console.log(err);
                this.$common.hideLoader();
            })
        } catch (error) {
            this.$common.hideLoader();
            console.log(error);
        }
    }
}