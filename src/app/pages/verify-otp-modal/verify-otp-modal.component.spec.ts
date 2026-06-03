import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import * as crypto from 'crypto-js';

import { VerifyOtpModalComponent } from './verify-otp-modal.component';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { OtpService } from 'src/app/service/auth/otp.service';

describe('VerifyOtpModalComponent', () => {
  let component: VerifyOtpModalComponent;
  let fixture: ComponentFixture<VerifyOtpModalComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let otpService: jasmine.SpyObj<OtpService>;

  beforeEach(async () => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    otpService = jasmine.createSpyObj<OtpService>('OtpService', ['verifyOtp', 'sendOtp']);
    otpService.verifyOtp.and.returnValue(
      of({ status: true, object: { userId: 'encUser', otp: 'encOtp' } }) as any
    );
    otpService.sendOtp.and.returnValue(
      of({ status: true, object: [{ otp: 'encOtp' }] }) as any
    );

    await TestBed.configureTestingModule({
      declarations: [VerifyOtpModalComponent],
      providers: [
        { provide: CommonService, useValue: commonService },
        { provide: AuthService, useValue: {} },
        { provide: OtpService, useValue: otpService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyOtpModalComponent);
    component = fixture.componentInstance;
    component.record = { userId: 'U-1', name: 'L' };
    (component as any).ngOtpInput = { setValue: jasmine.createSpy('setValue') } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger verifyOtp when OTP length reaches 4', () => {
    spyOn(component, 'verifyOtp');
    component.onOtpChange('1234');
    expect(component.verifyOtp).toHaveBeenCalledWith('1234');
  });

  it('should clear captcha when captchaGenerate is called', () => {
    component.captcha = 'abc';
    component.captchaGenerate();
    expect(component.captcha).toBe('');
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

  it('should emit and close modal when OTP verification security checks pass', () => {
    spyOn(component.setRecordData, 'emit');
    spyOn(component, 'closeModal');
    spyOn(crypto.AES, 'decrypt').and.callFake((value: any, key: any) => {
      if (key === 'otpUserId') return { toString: () => 'U-1' } as any;
      if (key === 'otp') return { toString: () => '1234' } as any;
      return { toString: () => '' } as any;
    });

    component.verifyOtp('1234');

    expect(component.setRecordData.emit).toHaveBeenCalled();
    expect(component.closeModal).toHaveBeenCalled();
  });
});

