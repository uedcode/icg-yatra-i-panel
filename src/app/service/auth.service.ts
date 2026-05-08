import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import userJson from 'src/app/service/json/userDetails.json';
import { UserTokenService } from './userToken.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUserId: any;
  private readonly storageKeys = environment.authConfig.storageKeys;
  constructor(
    private http: HttpClient,
    private route: Router,
    private $common: CommonService,
    private $userToken: UserTokenService,
    private datePipe: DatePipe
  ) {}

  config;

  login(data) {
    return this.http.post<any>(`oauth/token`, data).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  refresh(data) {
    return this.http.post<any>(`oauth/token`, data).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  changePassword(data) {
    return this.http.post<any>(`userDetail/changePassword`, data).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  faq() {
    return this.http.get<any>(`service/exposed/faq`).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  get(config) {
    return this.http.get<any>(`config/get`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response.object;
      })
    );
  }

  userTokenUpdate(config) {
    return this.http
      .post<any>(`service/userToken/createOrUpdate`, null, config)
      .pipe(
        map((response: any) => {
          this.$common.parseResponse(response);
          return response.object;
        })
      );
  }

  ssoLogin(config) {
    return this.http.get<any>(`sso/login`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  userIdDetails: any;
  getDashboardDetails(isDashboard, dateFilter) {
    this.userIdDetails = this.getUserDetails();
    let config = {
      headers: {
        userId: this.userIdDetails?.userId,
        roleId: this.userIdDetails?.roleTypeId,
        unitId: this.userIdDetails?.unitId ? this.userIdDetails.unitId : '',
        groupTypeId: this.userIdDetails?.groupTypeId
          ? this.userIdDetails.groupTypeId
          : '',
        isDashboard: isDashboard,
        dateFilter: dateFilter,
      },
    };
    return this.http.get<any>(`dashboard/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getAuthorizationHeader() {
    return this.getTokenDetails().accessToken;
  }

  getAuthorizationRefresh() {
    return this.getTokenDetails().refreshToken;
  }

  // userToken update start
  async updateUserToken(data) {
    this.config = {
      headers: {
        userId: data?.userId,
        token: data?.access_token,
        type: 'WEB',
      },
    };
    this.$userToken.userTokenUpdate(this.config).subscribe(
      (response) => {
        console.log(response);
      },
      (err) => {
        console.log(err);
        this.$common.showMessage(err.error.error_description, 'danger');
      }
    );
  }
  // userToken update end

  // userToken delete start
  async deleteUserToken() {
    let userDetails = this.getUserDetails();
    let token = this.getAccessToken();
    this.config = {
      headers: {
        // userId: userDetails?.userId,
        ids: token,
        type: 'WEB',
      },
    };
    this.$userToken.userTokenDelete(this.config).subscribe(
      (response) => {
        console.log(response);
      },
      (err) => {
        console.log(err);
        this.$common.showMessage(err.error.error_description, 'danger');
      }
    );
  }
  // userToken delete end

  createSession(data, redirectType) {
    // this.updateUserToken(data);

    let moduleUrlOld = this.getModuleName();
    localStorage.setItem(this.storageKeys.accessToken, data.access_token);
    localStorage.setItem(this.storageKeys.refreshToken, data.refresh_token);
    localStorage.setItem(this.storageKeys.expiresIn, data.expires_in);
    // if (isLogin) {
    localStorage.setItem(this.storageKeys.isDashboard, '1');
    localStorage.setItem(this.storageKeys.accessCount, '0');
    // }

    let accessData = {
      userId: data.userId,
      unitId: data.unitId,
      unitName: data.unitName,
      roleId: data.roleId,
      roleTypeId: data.roleTypeId,
      desigId: data.desigId,
      roleName: data.roleName,
      personName: data.personName,
      formId: data.formId,
      moduleId: data.moduleId,
      formName: data.formName,
      cadre: data.cadre,
      isSign: data.isSign,
      // "sessionTime": data.sessionTime,
      // "permissionChangeDt": data.permissionChangeDt,
      userPermission: '',
    };

    let userDetailsArray = [];
    userDetailsArray.push(accessData);
    localStorage.setItem(
      this.storageKeys.userDetails,
      JSON.stringify(userDetailsArray)
    );
    if (redirectType) {
      let moduleUrl = this.getModuleName();
      if (redirectType == 'NONE') {
      } else if (redirectType == 'LOGIN') {
        this.route.navigateByUrl(moduleUrl + '/dashboard');
      } else if (redirectType == 'REFRESH') {
        if (moduleUrl == moduleUrlOld) {
          location.reload();
        } else {
          sessionStorage.setItem('isReload', '1');
          this.route.navigateByUrl(moduleUrl + '/dashboard');
        }
      }
    } else {
      location.reload();
    }
  }

  destroySession(isLogout = '') {
    //this.deleteUserToken();
    if (isLogout === '1') {
      this.$common.showMessage(`Logout Successfully`);
    } else if (isLogout === '2') {
      this.$common.showMessage(
        `Sorry you were accessing an UnAuthorized Page.`,
        'danger'
      );
    } else if (isLogout === '3') {
      this.$common.showMessage(`Session Expired`, 'danger');
    } else if (isLogout === '4') {
      this.$common.showMessage(`Session updated kindly Login again`, 'danger');
    }
    this.$common.showLoader();
    localStorage.removeItem(this.storageKeys.accessToken);
    localStorage.removeItem(this.storageKeys.refreshToken);
    localStorage.removeItem(this.storageKeys.expiresIn);
    localStorage.removeItem(this.storageKeys.accessCount);
    localStorage.removeItem(this.storageKeys.userDetails);
    localStorage.removeItem(this.storageKeys.deviceId);
    setTimeout(() => {
      this.$common.hideLoader();
      location.href = 'login';
    }, 1500);
  }

  getTokenDetails() {
    var localObject = {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
    return localObject;
  }

  getAccessToken() {
    return localStorage.getItem(this.storageKeys.accessToken) || '';
  }

  getRefreshToken() {
    return localStorage.getItem(this.storageKeys.refreshToken) || '';
  }

  getDeviceFingerprint() {
    return localStorage.getItem(this.storageKeys.deviceId) || '';
  }

  getUserDetails() {
    if (localStorage.getItem(this.storageKeys.userDetails) === null) {
      return null;
    }
    let userDetailsArray = JSON.parse(
      localStorage.getItem(this.storageKeys.userDetails)
    );
    let userDetails = userDetailsArray[userDetailsArray.length - 1];
    if (userDetails?.userPermission) {
      userDetails.userPermission = JSON.parse(userDetails.userPermission);
    }
    return userDetails;
  }

  getModuleName() {
    this.userIdDetails = this.getUserDetails();
    if (!this.userIdDetails) {
      return '';
    }
    let codeRoleList = this.codeRoleType();
    let roleTypeId = this.userIdDetails.roleTypeId;

    // let codeGroupList = this.codeGroupType();
    // let groupTypeId = this.userIdDetails.groupTypeId;
    if (roleTypeId == codeRoleList.superAdmin) {
      return '/super-admin';
    } else if (roleTypeId == codeRoleList.systemAdmin) {
      return '/system-admin';
    } else if (roleTypeId == codeRoleList.unitAdmin) {
      return '/unit-admin';
    } else if (roleTypeId == codeRoleList.creator) {
      return '/creator';
    } else if (roleTypeId == codeRoleList.ihqStaff) {
      return '/ihq-staff';
    } else if (
      roleTypeId == codeRoleList.verifier ||
      roleTypeId == codeRoleList.approver
    ) {
      return '/approver';
    } else {
      return '/';
    }
  }

  openPageInNewTab() {
    let url = '';
    // Check if the current URL contains test.aptimyst.com
    if (window.location.hostname.includes('test.aptimyst.com')) {
      url = '/pilotage';
    }
    return url;
  }

  codeStatus() {
    return {
      activate: 'AC',
      deactivate: 'DA',
      pending: 'PE',
      outbox: 'OB',
      approved: 'AP',
      returned: 'RT',
      rejected: 'RJ',
      success: 'SU',
      processing: 'PRO',
      cancel: 'CA',
      draft: 'DR',
      manualDraft: 'MD',
      inbox: 'IB',
      passed: 'PS',
      notPassed: 'NP',
      exported: 'EX',
      imported: 'IM',
      forward: 'FW',
    };
  }

  codeRoleType() {
    return {
      superAdmin: 'SAD',
      admin: 'AD',

      systemAdmin: 'SY',
      unitAdmin: 'UN',
      creator: 'CR',
      verifier: 'VE',
      approver: 'AP',
      ihqStaff: 'IHQAP',
    };
  }

  codeState() {
    return {
      inbox: 'IB',
      outbox: 'OB',
      approved: 'AP',
      rejected: 'RJ',
    };
  }

  closeSidebar() {
    $('.sidebar-gone').addClass('sidenav-toggled');
  }

  setStatusColor(data) {
    let status = this.codeStatus();
    let statusId = data?.id;
    if (status.success == statusId) {
      return 'badge-success';
    } else if (status.pending == statusId) {
      return 'badge-dark';
    } else if (status.processing == statusId) {
      return 'badge-warning';
    } else if (status.cancel == statusId) {
      return 'badge-warning';
    } else if (status.approved == statusId) {
      return 'badge-success';
    } else if (status.rejected == statusId) {
      return 'badge-danger';
    }
  }

  setStatusColorRow(data) {
    let status = this.codeStatus();
    let statusId = data?.id;
    // if (status.success == statusId) {
    //   return "badge-success";
    // }
    // else if (status.pending == statusId) {
    //   return "badge-dark";
    // }
    // else if (status.processing == statusId) {
    //   return "badge-warning";
    // }
    // else if (status.cancel == statusId) {
    //   return "badge-warning";
    // }
    // else if (status.approved == statusId) {
    //   return "badge-success";
    // }
    if (status.rejected == statusId) {
      return 'strikeout';
    }
  }
  openLink(path, queryParams = null) {
    let href = window.location.href;
    let arr = window.location.href.split('/');
    if (href.includes('test.aptimyst.com')) {
      path = arr[3] + '/' + path;
    } else if (href.includes('icg.net.in')) {
      path = 'pilotage' + '/' + path;
    }
    let url = this.route.serializeUrl(this.route.createUrlTree([`/${path}`]));
    if (queryParams) {
      url = url + '?' + queryParams;
    }
    window.open(url, '_blank');
  }

  openDownloadLink(path) {
    const url =
      'https://adresults.com/wp-content/themes/adresults-theme/tools/ajax/download.php?url=' +
      path;
    window.open(url, '_blank');
  }

  setRoleName(data) {
    let codeRoleList = this.codeRoleType();
    let roleTypeId = data;

    if (roleTypeId == codeRoleList.superAdmin) {
      return 'Super Admin';
    } else if (roleTypeId == codeRoleList.systemAdmin) {
      return 'System Admin';
    } else if (roleTypeId == codeRoleList.unitAdmin) {
      return 'Unit Admin';
    } else if (roleTypeId == codeRoleList.creator) {
      return 'Creator';
    } else if (roleTypeId == codeRoleList.approver) {
      return 'Approver';
    }
    return '-';
  }

  // login with localStorage starts here
  // private readonly USER_KEY = 'pilotageUserDetails';
  // private readonly usersData = userJson;
  // login(username: string, password: string): boolean {

  //   // Perform authentication logic here (e.g., call an API to check credentials).
  //   // For the sake of example, let's assume the user "admin" with password "admin" can login.
  //   const data = this.usersData.find(u => u.username === username && u.password === password);
  //   if (data) {
  //     const userData = {
  //       "userId": data.userId,
  //       "username": data.username,
  //       "name": data.name,

  //       "roleId": data.roleId,
  //       "roleTypeId": data.roleTypeId,
  //       "roleName": data.roleName,

  //       "unitId": data.unitId,
  //       "userGroupName": data.userGroupName,
  //       "groupTypeId": data.groupTypeId,
  //       "groupName": data.groupName,getFormDetails

  //       "parentUserId": data.parentUserId,
  //       "sessionTime": data.sessionTime,

  //       "permissionChangeDt": data.permissionChangeDt,
  //       "userPermission": ""
  //     };

  //     let userDetailsArray = [];
  //     userDetailsArray.push(userData);
  //     localStorage.setItem("pilotageUserDetails", JSON.stringify(userDetailsArray));
  //     return true;
  //   }
  //   return false;
  // }

  // logout(): void {
  //   localStorage.removeItem(this.USER_KEY);
  // }
  // login with localStorage ends here

  getFormDetails(subFormId, actionType) {
    this.userIdDetails = this.getUserDetails();
    let req = {
      codeSubFormDTO: {
        subFormId: subFormId,
      },
      aclUserDTO: {
        userId: this.userIdDetails?.userId,
      },
      codeUnitDTO: {
        unit: this.userIdDetails?.unitId,
      },
      formStateInputDTO: {
        roleTypeId: 'CR',
        status: actionType,
        unitId: this.userIdDetails?.unitId,
        desigId: this.userIdDetails?.desigId,
        remark: 'Submit',
        codeFormId: this.userIdDetails?.formId,
      },
    };
    return req;
  }

  getFormEditUrl(formData: any, fallbackData: any = {}) {
    const moduleUrl = this.getModuleName();
    const rawFormUrl =
      formData?.formUrl ||
      formData?.codeSubFormDTO?.formUrl ||
      fallbackData?.formUrl;
    const formUrl = rawFormUrl ? String(rawFormUrl).replace(/^\/+/, '') : '';
    const formId = formData?.id || formData?.formId || fallbackData?.formId;
    const subFormId =
      formData?.subFormId ||
      formData?.codeSubFormDTO?.subFormId ||
      fallbackData?.subFormId;

    if (!moduleUrl || !formUrl || !formId) {
      return null;
    }

    const queryParams = [`id=${formId}`];
    if (subFormId) {
      queryParams.push(`subFormId=${subFormId}`);
    }

    return `${moduleUrl}/${formUrl}?${queryParams.join('&')}`;
  }

  getParameter(param) {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var params = url.searchParams.get(param);
    return params;
  }

  isNullOrEmpty(object) {
    if (
      object != undefined &&
      object != 'undefined' &&
      object != null &&
      object != 'null' &&
      object != ''
    ) {
      return false;
    }
    return true;
  }
  //  Barch detail end

  fileUrl = environment.fileUrl;
  viewFile(url) {
    const normalizedUrl = this.normalizeFileUrl(url);
    if (!normalizedUrl) {
      this.$common.showMessage('File URL is not available.', 'danger');
      return;
    }

    const viewerPath = this.route.serializeUrl(
      this.route.createUrlTree(['/view-file', btoa(normalizedUrl)])
    );
    window.open(viewerPath, '_blank');
  }

  private normalizeFileUrl(url: any): string {
    if (this.isNullOrEmpty(url)) {
      return '';
    }

    const rawUrl = String(url).trim();
    const baseUrl = this.fileUrl.endsWith('/') ? this.fileUrl : `${this.fileUrl}/`;
    const absoluteUrl = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : new URL(rawUrl.replace(/^\/+/, ''), baseUrl).toString();

    const separator = absoluteUrl.includes('?') ? '&' : '?';
    return `${absoluteUrl}${separator}t=${Date.now()}`;
  }

  formatEntryDate(entryDate: Date, entryTime: string): string {
    if (!entryDate || !entryTime) return;
    // Time ko HH:mm format me split karna
    const hours = parseInt(entryTime.substring(0, 2), 10);
    const minutes = parseInt(entryTime.substring(2, 4), 10);

    // Date of completion movement ke sath Time ko set karna
    let dateObj = new Date(entryDate);
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);

    // Required format me convert karna
    return this.datePipe.transform(dateObj, 'ddHHmm/MMM yy') || '';
  }

  formatOperation(operationType: string, operationTime: string): string {
    if (!operationType || !operationTime) {
      return ''; // Agar koi value missing hai to empty string return karo
    }
    return `<br> <b>(${operationType} - ${operationTime} Hrs)</b>`;
  }
}
