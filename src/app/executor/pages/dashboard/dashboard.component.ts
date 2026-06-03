import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';
import { buildLegacyStateCountHeaders } from 'src/app/shared/utils/legacy-api.util';
import { normalizeSidebarCounts } from 'src/app/shared/utils/sidebar-count.util';

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
  codeRoleList: any = {};

  constructor(
    public $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
    this.getCount();
  }

  getCount() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: buildLegacyStateCountHeaders(this.userIdDetails, this.codeRoleList),
      };
      this.$claim.getStatusCount(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.countObj = normalizeSidebarCounts(response.object);
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
