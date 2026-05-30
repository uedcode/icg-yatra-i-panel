import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CommonProfileSettingComponent } from './common-profile-setting.component';
import { CommonService } from 'src/app/service/common.service';
import { AuthService } from 'src/app/service/auth.service';
import { TotpService } from 'src/app/service/totp.service';

describe('CommonProfileSettingComponent', () => {
  let component: CommonProfileSettingComponent;
  let fixture: ComponentFixture<CommonProfileSettingComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let authService: jasmine.SpyObj<AuthService>;
  let totpService: jasmine.SpyObj<TotpService>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'codeRoleType',
      'getUserDetails'
    ]);
    totpService = jasmine.createSpyObj<TotpService>('TotpService', [
      'checkTOtp',
      'disableTOtp'
    ]);

    authService.codeRoleType.and.returnValue({ creator: 'CR' } as any);
    authService.getUserDetails.and.returnValue({ userId: 'USR-1' } as any);
    totpService.checkTOtp.and.returnValue(of({ status: true, object: 'DA' }) as any);
    totpService.disableTOtp.and.returnValue(of({ status: true, message: 'Disabled' }) as any);

    await TestBed.configureTestingModule({
      declarations: [CommonProfileSettingComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: AuthService, useValue: authService },
        { provide: TotpService, useValue: totpService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonProfileSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user details and fetch TOTP status', () => {
    expect(authService.codeRoleType).toHaveBeenCalled();
    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(totpService.checkTOtp).toHaveBeenCalledWith({
      headers: { userId: 'USR-1' }
    });
  });

  it('should map DA response to Enable status text', () => {
    component.getDetail();

    expect(component.totpStatusText).toBe('Enable');
    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('should map AC response to Disable status text', () => {
    totpService.checkTOtp.and.returnValue(of({ status: true, object: 'AC' }) as any);

    component.getDetail();

    expect(component.totpStatusText).toBe('Disable');
  });

  it('should hide loader when getDetail API fails', () => {
    spyOn(console, 'log');
    totpService.checkTOtp.and.returnValue(throwError(() => ({ status: 500 })) as any);

    component.getDetail();

    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('should disable TOTP and update status on success', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });
    try {
      component.disableTOtp(null);
      expect(totpService.disableTOtp).toHaveBeenCalledWith({
        headers: { userId: 'USR-1' }
      });
      expect(commonService.showMessage).toHaveBeenCalledWith('Disabled');
      expect(component.totpStatusText).toBe('Enable');
      expect(modalSpy).toHaveBeenCalledWith('hide');
    } finally {
      (window as any).$ = old$;
    }
  });

  it('should route openProfileModal to enable modal when status is Enable', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    component.totpStatusText = 'Enable';
    (window as any).$ = () => ({ modal: modalSpy });

    try {
      component.openProfileModal();
      expect(component.hitApi).toBeTrue();
      expect(modalSpy).toHaveBeenCalledWith('show');
    } finally {
      (window as any).$ = old$;
    }
  });

  it('should route openProfileModal to disable API when status is Disable', () => {
    component.totpStatusText = 'Disable';
    spyOn(component, 'disableTOtp');

    component.openProfileModal();

    expect(component.disableTOtp).toHaveBeenCalledWith(null);
  });

  it('should open device modal', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });

    try {
      component.openDeviceModal();
      expect(modalSpy).toHaveBeenCalledWith('show');
    } finally {
      (window as any).$ = old$;
    }
  });
});

