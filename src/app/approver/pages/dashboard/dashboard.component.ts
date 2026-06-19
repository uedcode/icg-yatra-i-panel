import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { buildLegacyStateCountHeaders } from 'src/app/shared/utils/legacy-api.util';

declare var $: any;
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

    constructor(private $common: CommonService, public $auth: AuthService, private $claim: ClaimService,
        private route: Router) { }

    /**Contants */
    userIdDetails: any;
    codeRoleList: any = [];
    config;
    countObj: any = {};
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
                this.getCount();
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

    // getDetails(dateFilter = "1") {
    //     try {
    //         this.$auth.getDashboardDetails("1", dateFilter).subscribe((response: any) => {
    //             this.$common.hideLoader();
    //             if (response.status === true) {
    //                 this.dashboardObj = response.object;
    //                 localStorage.removeItem("isDashboard");
    //             }
    //         }, err => {
    //             console.log(err);
    //             this.$common.hideLoader();
    //         })
    //     } catch (error) {
    //         this.$common.hideLoader();
    //         console.log(error);
    //     }
    // }

    getCount() {
        try {

            this.$common.showLoader();
            this.config = {
                headers: buildLegacyStateCountHeaders(this.userIdDetails, this.codeRoleList)
            }
            this.$claim.getStatusCount(this.config).subscribe((response: any) => {
                this.$common.hideLoader();
                if (response.status === true) {
                    this.countObj = Array.isArray(response.object) ? response.object[0] || {} : response.object || {};
                }
            }, err => {
                this.$common.hideLoader();
            })
        } catch (error) {
            this.$common.hideLoader();
            console.log(error);
        }
    }

    isVerifier(): boolean {
        return this.userIdDetails?.roleTypeId === this.codeRoleList?.verifier;
    }

}

