import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-redirect',
    templateUrl: './common-redirect.component.html',
    styleUrls: ['./common-redirect.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommonRedirectComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private $common: CommonService,
    public $auth: AuthService,
    private $form: FormApiService,
  ) { }

  fileUrl = environment.fileUrl;
  config;
  transaction: any = {};
  txnId;
  userIdDetails;
  codeRoleType;
  statusCode = '';
  statusMessage = '';
  redirectPath = '';
  private readonly gatewayStorageKey = environment.esignConfig?.gatewayStorageKey || 'gateway';
  private readonly redirectStorageKey = environment.esignConfig?.redirectStorageKey || 'esignRedirectPath';

  seconds: any;
  timeInt;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleType = this.$auth?.codeRoleType();
    this.route.queryParams.subscribe((params) => {
      this.txnId = params?.txnId;
      this.redirectPath = this.getRedirectPath();
      if (!this.txnId) {
        this.statusMessage = 'Transaction reference not found. Please retry the eSign flow from the claim page.';
        this.clearGateway();
        return;
      }

      this.getSingleForm();

      this.seconds = 60;
      this.getTime();
      setTimeout(() => {
        this.redirectToNextPage();
      }, this.seconds * 1000);
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
            this.statusCode = this.transaction?.trasactionStatus || '';
            this.statusMessage = this.getStatusMessage();
            this.clearGateway();
          } else {
            this.statusCode = 'ER';
            this.statusMessage = response?.message || 'Unable to fetch transaction details.';
          }
        },
        (err) => {
          console.log(err);
          this.$common.hideLoader();
          this.statusCode = 'ER';
          this.statusMessage = err?.error?.message || 'Unable to fetch transaction details.';
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  redirectToNextPage() {
    const targetPath = this.buildRedirectUrl();
    this.clearStoredRedirectPath();
    if (targetPath) {
      this.router.navigateByUrl(targetPath);
      return;
    }
    this.router.navigateByUrl('/login');
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

  private getRedirectPath(): string {
    const storedRedirectPath = this.getStoredRedirectPath();
    if (storedRedirectPath) {
      return storedRedirectPath;
    }

    const moduleUrl = this.$auth.getModuleName();
    if (!moduleUrl) {
      return '/login';
    }

    return this.$auth.getPostLoginLandingUrl();
  }

  private getStatusMessage(): string {
    if (this.statusCode === 'SC') {
      return 'eSign completed successfully.';
    }

    if (this.statusCode === 'US') {
      return this.transaction?.reason || 'Transaction failed.';
    }

    return this.transaction?.reason || 'Transaction status is still being processed or could not be determined.';
  }

  private clearGateway(): void {
    localStorage.removeItem(this.gatewayStorageKey);
  }

  private getStoredRedirectPath(): string {
    const value = localStorage.getItem(this.redirectStorageKey) || '';
    if (!value || !value.startsWith('/')) {
      return '';
    }
    return value;
  }

  private clearStoredRedirectPath(): void {
    localStorage.removeItem(this.redirectStorageKey);
  }

  private buildRedirectUrl(): string {
    if (!this.redirectPath) {
      return '';
    }

    const params: string[] = [];
    if (this.statusCode) {
      params.push(`esignStatus=${encodeURIComponent(this.statusCode)}`);
    }
    if (this.txnId) {
      params.push(`txnId=${encodeURIComponent(this.txnId)}`);
    }

    if (!params.length) {
      return this.redirectPath;
    }

    const separator = this.redirectPath.includes('?') ? '&' : '?';
    return `${this.redirectPath}${separator}${params.join('&')}`;
  }

  getSignedDocumentList(): any[] {
    return this.transaction?.eSignDocTransactionDTOs || [];
  }

}

