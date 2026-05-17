import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CommonManageDeviceModalComponent } from './common-manage-device-modal.component';
import { CommonService } from 'src/app/service/common.service';
import { DevicetService } from 'src/app/service/device.service';
import { AuthService } from 'src/app/service/auth.service';
import { environment } from 'src/environments/environment';

describe('CommonManageDeviceModalComponent', () => {
  let component: CommonManageDeviceModalComponent;
  let fixture: ComponentFixture<CommonManageDeviceModalComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let deviceService: jasmine.SpyObj<DevicetService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    deviceService = jasmine.createSpyObj<DevicetService>('DevicetService', [
      'get',
      'delete'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getUserDetails']);

    authService.getUserDetails.and.returnValue({ userId: 'U-1' } as any);
    deviceService.get.and.returnValue(
      of({
        status: true,
        object: [
          { id: 1, deviceId: 'DEVICE-1' },
          { id: 2, deviceId: 'DEVICE-2' }
        ]
      }) as any
    );
    deviceService.delete.and.returnValue(
      of({ status: true, message: 'Deleted' }) as any
    );

    await TestBed.configureTestingModule({
      declarations: [CommonManageDeviceModalComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: DevicetService, useValue: deviceService },
        { provide: AuthService, useValue: authService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonManageDeviceModalComponent);
    component = fixture.componentInstance;
    localStorage.setItem(environment.authConfig.storageKeys.deviceId, 'DEVICE-1');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(environment.authConfig.storageKeys.deviceId);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load device list on init and disable current device', () => {
    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(deviceService.get).toHaveBeenCalledWith({
      headers: { userId: 'U-1' }
    });
    expect(component.dataList.length).toBe(2);
    expect(component.dataList[0].isDisabled).toBeTrue();
    expect(component.dataList[1].isDisabled).toBeFalse();
  });

  it('should hide loader when get device list fails', () => {
    spyOn(console, 'log');
    deviceService.get.and.returnValue(throwError(() => ({ status: 500 })) as any);

    component.getDetail();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should delete device and remove it from list', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });
    component.dataList = [
      { id: 1, deviceId: 'DEVICE-1' },
      { id: 2, deviceId: 'DEVICE-2' }
    ];

    try {
      component.deleteList(1);

      expect(deviceService.delete).toHaveBeenCalledWith({
        headers: { ids: 1 }
      });
      expect(commonService.showMessage).toHaveBeenCalledWith('Deleted');
      expect(component.dataList).toEqual([{ id: 2, deviceId: 'DEVICE-2' }]);
      expect(modalSpy).toHaveBeenCalledWith('hide');
    } finally {
      (window as any).$ = old$;
    }
  });
});
