// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { CommonModule, DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';
import { of } from 'rxjs';
import { DirectiveModule } from './app/app-directive.module';
import { PipeModule } from './app/app-pipe.module';
import { AuthService } from './app/service/auth.service';
import { CommonService } from './app/service/common.service';

const noopJquery: any = () => noopJquery;
[
  'addClass',
  'find',
  'modal',
  'on',
  'parent',
  'removeClass',
  'toggleClass'
].forEach((method) => {
  noopJquery[method] = () => noopJquery;
});
noopJquery.hasClass = () => false;
(window as any).$ = noopJquery;
(window as any).jQuery = noopJquery;

const browserWindow = window as any;
const nativeSetInterval = browserWindow.setInterval.bind(window);
const nativeClearInterval = browserWindow.clearInterval.bind(window);
const activeIntervals: any[] = [];

browserWindow.setInterval = (...args: any[]) => {
  const intervalId = nativeSetInterval(...args);
  activeIntervals.push(intervalId);
  return intervalId;
};

afterEach(() => {
  while (activeIntervals.length) {
    nativeClearInterval(activeIntervals.pop());
  }
});

const customSelectOptions: INgxSelectOptions = {
  optionValueField: 'id',
  optionTextField: 'name',
  keepSelectedItems: false
};

// First, initialize the Angular testing environment.
const testBed = getTestBed();
const testBedAny = testBed as any;
const emptyParamMap = {
  keys: [],
  get: () => null,
  getAll: () => [],
  has: () => false
};

const activatedRouteStub = {
  snapshot: {
    data: {},
    params: {},
    queryParams: {},
    paramMap: emptyParamMap,
    queryParamMap: emptyParamMap
  },
  data: of({}),
  params: of({}),
  queryParams: of({}),
  paramMap: of(emptyParamMap),
  queryParamMap: of(emptyParamMap)
};

const routerStub = {
  createUrlTree: () => ({}),
  navigate: () => Promise.resolve(true),
  navigateByUrl: () => Promise.resolve(true),
  serializeUrl: () => ''
};

const commonServiceStub = {
  download: () => undefined,
  downloadAbsolute: () => undefined,
  hideLoader: () => undefined,
  parseResponse: (response: any) => response,
  showLoader: () => undefined,
  showMessage: () => undefined,
  uploadImages: () => undefined
};

const testUserDetails = {
  userId: 'test-user',
  roleId: 'R1',
  roleTypeId: 'CR',
  desigId: 'D1',
  unitId: 'U1',
  gxUnitId: 'GX1',
  formId: 'F1',
  groupTypeId: 'G1',
  personName: 'Test User',
  roleName: 'Creator',
  userPermission: {}
};

const authServiceStub = {
  closeSidebar: () => undefined,
  codeRoleType: () => ({
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
    ihqStaff: 'IHQAP'
  }),
  codeStatus: () => ({
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
    forward: 'FW'
  }),
  destroySession: () => undefined,
  formatEntryDate: () => '',
  formatOperation: () => '',
  getAccessToken: () => 'test-token',
  getApproverWorkflowDetailUrl: () => null,
  getDeviceFingerprint: () => 'test-device',
  getFormDetails: () => ({}),
  getFormEditUrl: () => null,
  getModuleName: () => '/creator',
  getParameter: () => '',
  getUserDetails: () => testUserDetails,
  isNullOrEmpty: (value: any) =>
    value === undefined || value === null || value === '' || value === 'null' || value === 'undefined',
  openLink: () => undefined,
  setRoleName: () => 'Creator',
  setStatusColor: () => '',
  setStatusColorRow: () => '',
  viewFile: () => undefined
};

const originalConfigureTestingModule =
  testBedAny.configureTestingModule.bind(testBed);

testBedAny.configureTestingModule = (moduleDef: any = {}) => {
  return originalConfigureTestingModule({
    ...moduleDef,
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      PipeModule,
      DirectiveModule,
      NgxPaginationModule,
      OrderModule,
      NgxSelectModule.forRoot(customSelectOptions),
      NgMultiSelectDropDownModule.forRoot(),
      AngularEditorModule,
      NgOtpInputModule,
      ...(moduleDef.imports || [])
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      DatePipe,
      { provide: ActivatedRoute, useValue: activatedRouteStub },
      { provide: Router, useValue: routerStub },
      { provide: AuthService, useValue: authServiceStub },
      { provide: CommonService, useValue: commonServiceStub },
      ...(moduleDef.providers || [])
    ],
    schemas: [...(moduleDef.schemas || []), NO_ERRORS_SCHEMA]
  });
};

testBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);
