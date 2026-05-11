/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonEnableTOtpModalComponent } from './common-enable-t-otp-modal.component';

describe('CommonEnableTOtpModalComponent', () => {
  let component: CommonEnableTOtpModalComponent;
  let fixture: ComponentFixture<CommonEnableTOtpModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonEnableTOtpModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonEnableTOtpModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
