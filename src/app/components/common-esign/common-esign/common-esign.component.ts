import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-esign',
    templateUrl: './common-esign.component.html',
    styleUrls: ['./common-esign.component.scss'],
    standalone: false
})
export class CommonEsignComponent implements OnInit {

  constructor(
    private router: Router,
    public $auth: AuthService,
    private $common: CommonService
  ) { }

  gateway: string | null;
  isSubmitting = false;
  handoffUrl = environment.esignConfig.authUrl;
  private readonly gatewayStorageKey = environment.esignConfig.gatewayStorageKey;

  ngOnInit() {
    this.gateway = localStorage.getItem(this.gatewayStorageKey);

    if (this.gateway) {
      setTimeout(() => {
        this.submitForm();
      }, 0);
    } else {
      this.$common.showMessage('eSign session could not be started. Please retry from the claim page.', 'danger');
    }
  }

  submitForm() {
    if (!this.gateway || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;

    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.handoffUrl;

    // Create hidden input for gateway value (txnref)
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'txnref';
    input.value = this.gateway;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  backToModule() {
    const moduleUrl = this.$auth.getModuleName() || '';
    this.router.navigateByUrl(moduleUrl ? `${moduleUrl}/new` : '/login');
  }
}

