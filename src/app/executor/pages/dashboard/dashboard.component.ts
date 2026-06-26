import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';
import { buildLegacyStateCountHeaders } from 'src/app/shared/utils/legacy-api.util';

@Component({
  selector: 'app-executor-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DashboardComponent implements OnInit {
  userIdDetails: any;
  countObj: any = {};
  config: any;
  codeRoleList: any = {};

  constructor(
    public $auth: AuthService,
    private $claimStateApi: ClaimStateApiService,
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
      this.$claimStateApi.getStatusCount(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.countObj = Array.isArray(response.object) ? response.object[0] || {} : response.object || {};
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

