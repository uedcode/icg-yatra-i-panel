import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/core/common.service';
import { UserTokenApiService } from 'src/app/service/api/security/user-token-api.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { RuntimeModuleService, RuntimeModuleId } from 'src/app/service/auth/runtime-module.service';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUserId: any;
  private readonly storageKeys = environment.authConfig.storageKeys;
  private readonly moduleStorageKeys = environment.authConfig.moduleStorageKeys || {};
  constructor(
    private http: HttpClient,
    private route: Router,
    private $common: CommonService,
    private $userToken: UserTokenApiService,
    private datePipe: DatePipe,
    private runtimeModuleService: RuntimeModuleService
  ) {}

  config;

  private getScopedStorageKeys(moduleId?: RuntimeModuleId): any {
    const activeModule = moduleId || this.getRuntimeModuleId();
    return this.moduleStorageKeys?.[activeModule] || {};
  }

  private setWithScopedKey(baseKeyName: string, value: string): void {
    const scoped = this.getScopedStorageKeys();
    const baseKey = this.storageKeys?.[baseKeyName];
    const scopedKey = scoped?.[baseKeyName];
    if (scopedKey) {
      localStorage.setItem(scopedKey, value);
      return;
    }
    if (baseKey) {
      localStorage.setItem(baseKey, value);
    }
  }

  private getWithScopedKey(baseKeyName: string): string {
    const scoped = this.getScopedStorageKeys();
    const baseKey = this.storageKeys?.[baseKeyName];
    const scopedKey = scoped?.[baseKeyName];
    if (scopedKey) {
      return localStorage.getItem(scopedKey) || '';
    }
    return (baseKey ? localStorage.getItem(baseKey) : null) || '';
  }

  private setModuleCompatKeys(moduleId: RuntimeModuleId, keyType: 'AccessToken' | 'RefreshToken' | 'ExpiresIn', value: string): void {
    const upperModule = String(moduleId || '').toUpperCase();
    const suffix = upperModule === 'CLM' ? 'Clm' : 'Adv';
    const otherSuffix = suffix === 'Adv' ? 'Clm' : 'Adv';
    const baseKey = `yatInt${keyType}`;
    const activeKey = `yatInt${keyType}${suffix}`;
    const inactiveKey = `yatInt${keyType}${otherSuffix}`;
    localStorage.setItem(baseKey, value);
    localStorage.setItem(activeKey, value);
    localStorage.removeItem(inactiveKey);
  }

  getRuntimeModuleId(pathname?: string): RuntimeModuleId {
    return this.runtimeModuleService.getModuleId(pathname);
  }

  isRuntimeAdv(pathname?: string): boolean {
    return this.runtimeModuleService.isAdv(pathname);
  }

  isRuntimeClm(pathname?: string): boolean {
    return this.runtimeModuleService.isClm(pathname);
  }

  enableFeatures(moduleId = ''): boolean {
    return this.runtimeModuleService.isModuleEnabled(moduleId);
  }

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
    debugger
    // this.updateUserToken(data);
    const payload = data?.object ? data.object : data;
    const activeModule = this.getRuntimeModuleId();
    let moduleUrlOld = this.getModuleName();
    const previousUser = this.getUserDetails() || {};
    const accessToken =
      payload?.access_token ??
      payload?.accessToken ??
      this.getAccessToken();
    const refreshToken =
      payload?.refresh_token ??
      payload?.refreshToken ??
      this.getRefreshToken();
    const expiresIn =
      payload?.expires_in ??
      payload?.expiresIn ??
      localStorage.getItem(this.storageKeys.expiresIn) ??
      '';
    const tokenPayload = this.decodeAccessTokenPayload(accessToken);
    const sessionSource = {
      ...(payload || {}),
      ...(tokenPayload || {}),
    };

    if (accessToken) {
      this.setWithScopedKey('accessToken', accessToken);
      this.setModuleCompatKeys(activeModule, 'AccessToken', accessToken);
    }
    if (refreshToken) {
      this.setWithScopedKey('refreshToken', refreshToken);
      this.setModuleCompatKeys(activeModule, 'RefreshToken', refreshToken);
    }
    if (expiresIn !== null && expiresIn !== undefined) {
      const expiresInText = String(expiresIn);
      this.setWithScopedKey('expiresIn', expiresInText);
      this.setModuleCompatKeys(activeModule, 'ExpiresIn', expiresInText);
    }
    // if (isLogin) {
    localStorage.setItem(this.storageKeys.isDashboard, '1');
    this.setWithScopedKey('accessCount', '0');
    // }

    let accessData = {
      userId: sessionSource?.userId ?? previousUser?.userId,
      unitId: sessionSource?.unitId ?? previousUser?.unitId,
      unitName: sessionSource?.unitName ?? previousUser?.unitName,
      gxUnitId: sessionSource?.gxUnitId ?? previousUser?.gxUnitId,
      gxUnitName: sessionSource?.gxUnitName ?? previousUser?.gxUnitName,
      roleId: sessionSource?.roleId ?? previousUser?.roleId,
      roleTypeId: sessionSource?.roleTypeId ?? previousUser?.roleTypeId,
      desigId: sessionSource?.desigId ?? previousUser?.desigId,
      roleName: sessionSource?.roleName ?? previousUser?.roleName,
      personName: sessionSource?.personName ?? previousUser?.personName,
      formId: sessionSource?.formId ?? previousUser?.formId,
      moduleId: sessionSource?.moduleId ?? previousUser?.moduleId,
      formName: sessionSource?.formName ?? previousUser?.formName,
      cadre: sessionSource?.cadre ?? previousUser?.cadre,
      isSign: sessionSource?.isSign ?? previousUser?.isSign,
      aclRoleDTOs:
        sessionSource?.aclRoleDTOs ??
        sessionSource?.aclRoles ??
        previousUser?.aclRoleDTOs ??
        previousUser?.aclRoles,
      // "sessionTime": data.sessionTime,
      // "permissionChangeDt": data.permissionChangeDt,
      userPermission:
        sessionSource?.userPermission ??
        (previousUser?.userPermission ? JSON.stringify(previousUser.userPermission) : ''),
    };

    let userDetailsArray = [];
    userDetailsArray.push(accessData);
    this.setWithScopedKey('userDetails', JSON.stringify(userDetailsArray));
    if (redirectType) {
      let moduleUrl = this.getModuleName();
      if (redirectType == 'NONE') {
      } else if (redirectType == 'LOGIN') {
        this.route.navigateByUrl(this.getPostLoginLandingUrl());
      } else if (redirectType == 'REFRESH') {
        if (moduleUrl == moduleUrlOld) {
          location.reload();
        } else {
          sessionStorage.setItem('isReload', '1');
          this.route.navigateByUrl(this.getPostLoginLandingUrl());
        }
      }
    } else {
      location.reload();
    }
  }

  private decodeAccessTokenPayload(accessToken: string): any {
    if (!accessToken || typeof accessToken !== 'string') {
      return {};
    }
    const parts = accessToken.split('.');
    if (parts.length < 2) {
      return {};
    }
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(decodeURIComponent(
        atob(padded)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      ));
    } catch {
      return {};
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
    const advKeys = this.getScopedStorageKeys('ADV');
    const clmKeys = this.getScopedStorageKeys('CLM');
    [advKeys, clmKeys].forEach((keys) => {
      if (!keys) return;
      ['accessToken', 'refreshToken', 'expiresIn', 'accessCount', 'userDetails', 'deviceId'].forEach((k) => {
        if (keys[k]) {
          localStorage.removeItem(keys[k]);
        }
      });
    });
    localStorage.removeItem('yatIntAccessToken');
    localStorage.removeItem('yatIntRefreshToken');
    localStorage.removeItem('yatIntExpiresIn');
    localStorage.removeItem('yatIntAccessTokenAdv');
    localStorage.removeItem('yatIntRefreshTokenAdv');
    localStorage.removeItem('yatIntExpiresInAdv');
    localStorage.removeItem('yatIntAccessTokenClm');
    localStorage.removeItem('yatIntRefreshTokenClm');
    localStorage.removeItem('yatIntExpiresInClm');
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
    return this.getWithScopedKey('accessToken') || '';
  }

  getRefreshToken() {
    return this.getWithScopedKey('refreshToken') || '';
  }

  getDeviceFingerprint() {
    return this.getWithScopedKey('deviceId') || '';
  }

  getUserDetails() {
    const userDetailsText = this.getWithScopedKey('userDetails');
    if (!userDetailsText || !userDetailsText.trim()) {
      return null;
    }
    let userDetailsArray: any[] = [];
    try {
      userDetailsArray = JSON.parse(userDetailsText);
    } catch (error) {
      console.warn('Invalid userDetails JSON in storage. Clearing session cache key.', error);
      this.setWithScopedKey('userDetails', '');
      return null;
    }
    if (!Array.isArray(userDetailsArray) || userDetailsArray.length === 0) {
      return null;
    }
    let userDetails = userDetailsArray[userDetailsArray.length - 1];
    if (userDetails?.userPermission && typeof userDetails.userPermission === 'string') {
      try {
        userDetails.userPermission = JSON.parse(userDetails.userPermission);
      } catch {
        userDetails.userPermission = {};
      }
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

  getPostLoginLandingUrl(pathname?: string): string {
    const userDetails = this.getUserDetails();
    const roleTypeId = userDetails?.roleTypeId;
    const codeRoleList = this.codeRoleType();
    const moduleUrl = this.getModuleName();
    const runtimeModuleId = this.getRuntimeModuleId(pathname);

    if (roleTypeId == codeRoleList.creator) {
      return runtimeModuleId === 'CLM'
        ? '/creator/movement-update-claim?statusId=0'
        : '/creator/new';
    }

    if (
      roleTypeId == codeRoleList.verifier ||
      roleTypeId == codeRoleList.verifier1 ||
      roleTypeId == codeRoleList.verifier2 ||
      roleTypeId == codeRoleList.approver
    ) {
      return runtimeModuleId === 'CLM'
        ? '/approver/claim/inbox'
        : '/approver/inbox';
    }

    if (roleTypeId == codeRoleList.unitAdmin) {
      return '/unit-admin/manage-unit-admin';
    }

    if (roleTypeId == codeRoleList.systemAdmin) {
      return '/system-admin/dashboard';
    }

    if (roleTypeId == codeRoleList.executor) {
      return '/executor/dashboard';
    }

    if (moduleUrl && moduleUrl !== '/') {
      return `${moduleUrl}/dashboard`;
    }

    return '/login';
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

  getApproverActionFormUrl(data: any, defaultStatus: string): string | null {
    const moduleUrl = this.getModuleName();
    if (!moduleUrl) {
      return null;
    }

    const claim = data?.yatClaimDTO || {};
    const claimId = claim?.claimId;
    const resolvedStatus =
      defaultStatus ||
      data?.claimState ||
      claim?.claimState ||
      data?.statusId ||
      claim?.statusId ||
      '';
    const subFormId =
      claim?.codeSubFormDTO?.subFormId || '';
    const formUrl = String(claim?.codeSubFormDTO?.formUrl || '').replace(/^\/+/, '');

    if (!claimId || !formUrl) {
      return null;
    }

    const queryParams = [`id=${encodeURIComponent(claimId)}`];
    if (subFormId) {
      queryParams.push(`subFormId=${encodeURIComponent(subFormId)}`);
    }
    if (resolvedStatus) {
      queryParams.push(`statusId=${encodeURIComponent(resolvedStatus)}`);
    }
    queryParams.push('actionable=1');

    return `${moduleUrl}/${formUrl}?${queryParams.join('&')}`;
  }

  getApproverPreviewUrl(data: any): string | null {
    const moduleUrl = this.getModuleName();
    if (!moduleUrl) {
      return null;
    }

    const claim = data?.yatClaimDTO || data || {};
    const claimId = claim?.claimId;
    const viewUrl = String(claim?.codeSubFormDTO?.viewUrl || data?.codeSubFormDTO?.viewUrl || '').replace(/^\/+/, '');

    if (!claimId || !viewUrl) {
      return null;
    }

    return `${moduleUrl}/${viewUrl}?id=${encodeURIComponent(claimId)}`;
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
  async resolveExistingFileUrl(url: any): Promise<string | null> {
    const normalizedUrl = this.normalizeFileUrl(url);
    if (!normalizedUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return null;
    }

    const exists = await this.checkFileExists(normalizedUrl);
    if (!exists) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return null;
    }

    return normalizedUrl;
  }

  async viewFile(url: any): Promise<boolean> {
    const normalizedUrl = this.normalizeFileUrl(url);
    if (!normalizedUrl) {
      this.$common.showMessage("File doesn't exist", 'danger');
      return false;
    }

    const viewerWindow = window.open('', '_blank');
    const exists = await this.checkFileExists(normalizedUrl);
    if (!exists) {
      this.$common.showMessage("File doesn't exist", 'danger');
      viewerWindow?.close();
      return false;
    }

    const viewerPath = this.buildFileViewerPath(normalizedUrl);
    if (viewerWindow) {
      viewerWindow.location.href = viewerPath;
    } else {
      window.open(viewerPath, '_blank');
    }
    return true;
  }

  private buildFileViewerPath(normalizedUrl: string): string {
    const modulePath = this.getViewFileModulePath();
    return this.route.serializeUrl(
      this.route.createUrlTree([modulePath, this.encodeFileViewerParam(normalizedUrl)])
    );
  }

  private encodeFileViewerParam(url: string): string {
    return btoa(url)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private getViewFileModulePath(): string {
    const moduleUrl = this.getModuleName();
    if (!moduleUrl) {
      return '/view-file';
    }

    const runtimePrefix = this.getRuntimeUrlPrefix();
    return `${runtimePrefix}${moduleUrl}/view-file`;
  }

  private getRuntimeUrlPrefix(): string {
    const path = String(window.location?.pathname || '').toLowerCase();
    if (path.startsWith('/claim/')) {
      return '/claim';
    }
    if (path.startsWith('/adv/')) {
      return '/adv';
    }

    const configuredBase = (environment.baseHref || '').trim().toLowerCase();
    if (configuredBase === '/claim/' || configuredBase === '/claim') {
      return '/claim';
    }
    return '/adv';
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

  private async checkFileExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
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
