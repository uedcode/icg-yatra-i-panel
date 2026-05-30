import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { NewDeviceComponent } from './new-device.component';
import { CommonService } from 'src/app/service/common.service';
import { AuthService } from 'src/app/service/auth.service';
import { utilDeviceService } from 'src/app/service/utilDevice.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DeviceService } from 'src/app/service/acl/device.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NewDeviceComponent', () => {
  let component: NewDeviceComponent;
  let fixture: ComponentFixture<NewDeviceComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let authService: jasmine.SpyObj<AuthService>;
  let utilDevice: jasmine.SpyObj<utilDeviceService>;
  let detector: jasmine.SpyObj<DeviceDetectorService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getUserDetails']);
    utilDevice = jasmine.createSpyObj<utilDeviceService>('utilDeviceService', ['createOrUpdate']);
    detector = jasmine.createSpyObj<DeviceDetectorService>('DeviceDetectorService', ['getDeviceInfo']);
    deviceService = jasmine.createSpyObj<DeviceService>('DeviceService', ['generateBrowserId']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    authService.getUserDetails.and.returnValue({ userId: 'U-1' } as any);
    detector.getDeviceInfo.and.returnValue({ browser: 'Chrome' } as any);
    deviceService.generateBrowserId.and.returnValue('BROWSER-1');
    utilDevice.createOrUpdate.and.returnValue(of({ status: true }) as any);

    await TestBed.configureTestingModule({
      declarations: [NewDeviceComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: AuthService, useValue: authService },
        { provide: utilDeviceService, useValue: utilDevice },
        { provide: DeviceDetectorService, useValue: detector },
        { provide: DeviceService, useValue: deviceService },
        { provide: Router, useValue: router }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read user details on init', () => {
    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(component.userIdDetails).toEqual({ userId: 'U-1' } as any);
  });

  it('should submit detected device info and navigate on success', () => {
    component.deviceName = 'Office Laptop';
    component.getDeviceDetails();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(utilDevice.createOrUpdate).toHaveBeenCalledWith({
      deviceId: 'BROWSER-1',
      browserName: 'Chrome',
      userId: 'U-1',
      descr: 'Office Laptop'
    });
    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/switch-module']);
  });

  it('should not navigate when createOrUpdate returns status false', () => {
    utilDevice.createOrUpdate.and.returnValue(of({ status: false }) as any);
    component.deviceName = 'Guest Machine';

    component.getDeviceDetails();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should hide loader when createOrUpdate API fails', () => {
    spyOn(console, 'log');
    utilDevice.createOrUpdate.and.returnValue(throwError(() => ({ status: 500 })) as any);

    component.getDeviceDetails();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should hide loader when createOrUpdate throws synchronously', () => {
    spyOn(console, 'log');
    utilDevice.createOrUpdate.and.callFake(() => {
      throw new Error('sync createOrUpdate error');
    });

    component.getDeviceDetails();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });
});

