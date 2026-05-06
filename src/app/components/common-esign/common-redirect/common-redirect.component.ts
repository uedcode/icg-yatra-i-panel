import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { FormService } from 'src/app/service/form.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-redirect',
    templateUrl: './common-redirect.component.html',
    styleUrls: ['./common-redirect.component.scss'],
    standalone: false
})
export class CommonRedirectComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $common: CommonService,
    public $auth: AuthService,
    private $form: FormService,
  ) { }

  fileUrl = environment.fileUrl;
  config;
  transaction: any = {};
  txnId;
  userIdDetails;
  codeRoleType;

  seconds: any;
  timeInt;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleType = this.$auth?.codeRoleType();
    this.route.queryParams.subscribe((params) => {
      this.txnId = params?.txnId;
      if (this.txnId) {
        this.getSingleForm();

        this.seconds = 60;
        this.getTime();
        setTimeout(() => {
          this.redirectToNextPage();
        }, this.seconds * 1000);
      }
    });
  }

  getSingleForm() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          txnId: this.txnId,
        },
      };

      this.$form.getTxnDetails(this.config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.transaction = response?.object;
          }
        },
        (err) => {
          console.log(err);
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  redirectToNextPage() {
    let moduleUrl = this.$auth.getModuleName();
    if (this.userIdDetails?.roleTypeId == this.codeRoleType.creator) {
      this.router.navigateByUrl(moduleUrl + `/new`);
    }
    else if (this.userIdDetails?.roleTypeId == this.codeRoleType.approver||this.userIdDetails?.roleTypeId == this.codeRoleType.verifier) {
      this.router.navigateByUrl(moduleUrl + `/inbox`);
    }
  }

  getTime() {
    clearInterval(this.timeInt);
    this.timeInt = setInterval(() => {
      if (this.seconds === 0) {
        clearInterval(this.timeInt);
      } else { this.seconds = this.seconds - 1; }
    }, 1000);
    return () => clearInterval(this.timeInt);
  }

  ngOnDestroy() {
    if (this.timeInt) {
      clearInterval(this.timeInt);
    }
  }

}
