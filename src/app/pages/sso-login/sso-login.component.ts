import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as crypto from 'crypto-js';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-sso-login',
    templateUrl: './sso-login.component.html',
    styleUrls: ['./sso-login.component.scss'],
    standalone: false
})
export class SsoLoginComponent implements OnInit {

  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    private router: Router,
  ) { }


  disableBtn: boolean = false;
  config;
  userIdDetails;

  ngOnInit(): void {
    this.getSsoJwtToken();
    // this.checkSession();
  }

  ssoResponse;
  getSsoJwtToken() {
    this.$common.showLoader();
    const url = new URL(window.location.href);
    const jwtToken = url.searchParams.get("jwtToken");
    if (jwtToken) {
      try {
        let config = {
          headers: {
            "jwtToken": jwtToken,
          }
        };
        this.$auth.ssoLogin(config).subscribe((response) => { 
          this.$common.hideLoader(); 
          if (response?.status === true) {
            this.ssoResponse = response?.object; 
            this.login();
          }
        }, (err) => {
          this.$common.hideLoader(); 
          this.$common.showMessage(`${err.status} : ${err.statusText}`); 
        });
      } catch (error) {
        this.$common.hideLoader();
        console.error(error.message); 
      }
    } else {
      this.$common.hideLoader();
      console.error("JWT Token is missing from URL");
    }
  }

  login() {
    var params = new HttpParams();
    let username = this.ssoResponse.username;
    let password = this.ssoResponse.password;

    const runtimeModuleId = this.$auth.getRuntimeModuleId();
    params = params.append('username', username + '---' + password + '---' + runtimeModuleId);
    params = params.append('password', password);
    params = params.append('grant_type', 'password');
    params = params.append('is_login', '1');
    this.$auth.login(params).subscribe((response) => {
      this.$common.hideLoader();
      // this.$common.showMessage(`Login Successfully`);
      this.$auth.createSession(response, 'LOGIN');
    }, (err) => {
      this.$common.hideLoader();
      console.log(err);
      if (err.status == 401) {
        console.log("That's not the right password or Username. Please try again.");
      } else {
        console.log(err.error.error_description);
      }
    }
    );
  }

  checkSession() {
    if (this.$auth.getUserDetails() === null) {
      return;
    }
    this.router.navigateByUrl(this.$auth.getPostLoginLandingUrl());
  }

}

