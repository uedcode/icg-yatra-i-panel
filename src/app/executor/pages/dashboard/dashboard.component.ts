import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-executor-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  userIdDetails: any;
  countObj: any = {};
  config: any;

  constructor(
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.getCount();
  }

  getCount() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          desigId: this.userIdDetails?.desigId,
          unitId: this.userIdDetails?.unitId,
          roleTypeId: this.userIdDetails?.roleTypeId,
        },
      };
      this.$claim.getStatusCount(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.countObj = response.object || {};
          }
        },
        () => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
}
