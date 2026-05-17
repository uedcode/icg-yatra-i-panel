import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { VerifyTotpModalComponent } from './verify-totp-modal.component';
import { CommonService } from 'src/app/service/common.service';
import { AuthService } from 'src/app/service/auth.service';
import { OtpService } from 'src/app/service/otp.service';

describe('VerifyTotpModalComponent', () => {
  let component: VerifyTotpModalComponent;
  let fixture: ComponentFixture<VerifyTotpModalComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let otpService: jasmine.SpyObj<OtpService>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    otpService = jasmine.createSpyObj<OtpService>('OtpService', ['verifyTOtp', 'sendOtp']);
    otpService.verifyTOtp.and.returnValue(of({ status: true }) as any);
    otpService.sendOtp.and.returnValue(of({ status: true, object: { otp: '123456' } }) as any);

    await TestBed.configureTestingModule({
      declarations: [VerifyTotpModalComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: AuthService, useValue: {} },
        { provide: OtpService, useValue: otpService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyTotpModalComponent);
    component = fixture.componentInstance;
    component.record = { userId: 'U-1', username: 'creator', password: 'secret' };
    (component as any).ngOtpInput = { setValue: jasmine.createSpy('setValue') } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger verifyOtp when OTP length reaches 6', () => {
    spyOn(component, 'verifyOtp');
    component.onOtpChange('123456');
    expect(component.verifyOtp).toHaveBeenCalledWith('123456');
  });

  it('should call verifyTOtp and close modal on successful verifyOtp', () => {
    spyOn(component.setRecordData, 'emit');
    spyOn(component, 'closeModal');
    component.verifyOtp('123456');
    expect(otpService.verifyTOtp).toHaveBeenCalled();
    expect(component.setRecordData.emit).toHaveBeenCalled();
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should clear OTP input and hide modal in closeModal', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });
    try {
      component.formObj = { a: 1 };
      component.closeModal();
      expect((component as any).ngOtpInput.setValue).toHaveBeenCalledWith('');
      expect(component.formObj).toEqual({});
      expect(modalSpy).toHaveBeenCalledWith('hide');
    } finally {
      (window as any).$ = old$;
    }
  });
});
