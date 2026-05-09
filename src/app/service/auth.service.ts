import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
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
  private readonly legacyStorageKeys = {
    accessToken: 'pilotageAccessToken',
    refreshToken: 'pilotageRefreshToken',
    expiresIn: 'pilotageExpiresIn',
    accessCount: 'pilotageAccessCount',
    userDetails: 'pilotageUserDetails',
    deviceId: 'pilotageDeviceId',
  };
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
    localStorage.setItem(this.legacyStorageKeys.accessToken, data.access_token);
    localStorage.setItem(this.legacyStorageKeys.refreshToken, data.refresh_token);
    localStorage.setItem(this.legacyStorageKeys.expiresIn, data.expires_in);
    // if (isLogin) {
    localStorage.setItem(this.storageKeys.isDashboard, '1');
    localStorage.setItem(this.storageKeys.accessCount, '0');
    localStorage.setItem(this.legacyStorageKeys.accessCount, '0');
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
    localStorage.setItem(
      this.legacyStorageKeys.userDetails,
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
    localStorage.removeItem(this.legacyStorageKeys.accessToken);
    localStorage.removeItem(this.legacyStorageKeys.refreshToken);
    localStorage.removeItem(this.legacyStorageKeys.expiresIn);
    localStorage.removeItem(this.legacyStorageKeys.accessCount);
    localStorage.removeItem(this.legacyStorageKeys.userDetails);
    localStorage.removeItem(this.legacyStorageKeys.deviceId);
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
    return (
      localStorage.getItem(this.storageKeys.accessToken) ||
      localStorage.getItem(this.legacyStorageKeys.accessToken) ||
      ''
    );
  }

  getRefreshToken() {
    return (
      localStorage.getItem(this.storageKeys.refreshToken) ||
      localStorage.getItem(this.legacyStorageKeys.refreshToken) ||
      ''
    );
  }

  getDeviceFingerprint() {
    return (
      localStorage.getItem(this.storageKeys.deviceId) ||
      localStorage.getItem(this.legacyStorageKeys.deviceId) ||
      ''
    );
  }

  getUserDetails() {
    const userDetailsText =
      localStorage.getItem(this.storageKeys.userDetails) ||
      localStorage.getItem(this.legacyStorageKeys.userDetails);
    if (userDetailsText === null) {
      return null;
    }
    let userDetailsArray = JSON.parse(userDetailsText);
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
    } else if (roleTypeId == codeRoleList.executor) {
      return '/executor';
    } else if (
      roleTypeId == codeRoleList.verifier ||
      roleTypeId == codeRoleList.verifier1 ||
      roleTypeId == codeRoleList.verifier2 ||
      roleTypeId == codeRoleList.approver
    ) {
      return '/approver';
    } else {
      return '/';
    }
  }

  openPageInNewTab() {
    if (window.location.hostname.includes('test.aptimyst.com')) {
      return this.getBasePathPrefix();
    }
    return '';
  }

  codeStatus() {
    return {
      activate: 'AC',
      deactivate: 'DA',
      pending: 'PE',
      outbox: 'OB',
      approved: 'AP',
      notApproved: 'NA',
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
      executor: 'EX',
      verifier: 'VE1',
      verifier1: 'VE1',
      verifier2: 'VE2',
      approver: 'AP',
      ihqStaff: 'IHQAP',
    };
  }

  codeState() {
    return {
      inbox: 'IB',
      outbox: 'OB',
      approved: 'AP',
      notApproved: 'NA',
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
    } else if (status.rejected == statusId || status.notApproved == statusId) {
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
    if (status.rejected == statusId || status.notApproved == statusId) {
      return 'strikeout';
    }
  }
  openLink(path, queryParams = null) {
    let href = window.location.href;
    let arr = window.location.href.split('/');
    if (href.includes('test.aptimyst.com')) {
      path = arr[3] + '/' + path;
    } else if (href.includes('icg.net.in')) {
      const basePrefix = this.getBasePathPrefix().replace(/^\/+/, '');
      path = (basePrefix ? basePrefix + '/' : '') + path;
    }
    let url = this.route.serializeUrl(this.route.createUrlTree([`/${path}`]));
    if (queryParams) {
      url = url + '?' + queryParams;
    }
    window.open(url, '_blank');
  }

  private getBasePathPrefix(): string {
    const baseHref = (environment.baseHref || '/').trim();
    if (!baseHref || baseHref === '/') {
      return '';
    }
    return '/' + baseHref.replace(/^\/+|\/+$/g, '');
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
    } else if (roleTypeId == codeRoleList.executor) {
      return 'Executor';
    } else if (roleTypeId == codeRoleList.approver) {
      return 'Approver';
    }
    return '-';
  }

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

  getApproverWorkflowDetailUrl(
    data: any,
    defaultStatus: string,
    actionable = false
  ): string | null {
    const moduleUrl = this.getModuleName();
    if (!moduleUrl) {
      return null;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId || data?.claimId || data?.formId || data?.id;
    const formId = data?.formId || claim?.formId || claimId;
    const resolvedStatus =
      defaultStatus ||
      data?.claimState ||
      claim?.claimState ||
      data?.statusId ||
      claim?.statusId ||
      '';
    const subFormId =
      claim?.codeSubFormDTO?.subFormId ||
      data?.subFormId ||
      data?.codeSubFormDTO?.subFormId ||
      '';
    const rawViewUrl =
      data?.viewUrl ||
      claim?.codeSubFormDTO?.viewUrl ||
      data?.codeSubFormDTO?.viewUrl ||
      '';
    const viewUrl = String(rawViewUrl).replace(/^\/+/, '');

    if (this.isApproverAdvanceView(viewUrl)) {
      const queryParams = [
        `id=${encodeURIComponent(formId)}`,
        `claimId=${encodeURIComponent(claimId)}`,
        `subFormId=${encodeURIComponent(subFormId)}`,
        `statusId=${encodeURIComponent(resolvedStatus)}`,
      ];
      if (actionable) {
        queryParams.push('actionable=1');
      }
      return `${moduleUrl}/${viewUrl}?${queryParams.join('&')}`;
    }

    if (claimId && subFormId) {
      const queryParams = [
        `claimId=${encodeURIComponent(claimId)}`,
        `subFormId=${encodeURIComponent(subFormId)}`,
        `statusId=${encodeURIComponent(resolvedStatus)}`,
      ];
      if (actionable) {
        queryParams.push('actionable=1');
      }
      return `${moduleUrl}/form-claim-detail?${queryParams.join('&')}`;
    }

    if (viewUrl && formId) {
      return `${moduleUrl}/${viewUrl}?id=${encodeURIComponent(formId)}`;
    }

    return null;
  }

  private isApproverAdvanceView(viewUrl: string): boolean {
    return [
      'form-pmt-duty',
      'form-ty-duty',
      'form-fte-advance',
      'form-ltc-advance',
      'form-manual-adv',
      'form-ltc-availed-history',
    ].includes(viewUrl);
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
