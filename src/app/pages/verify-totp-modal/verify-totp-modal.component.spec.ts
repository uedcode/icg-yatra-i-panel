/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VerifyTotpModalComponent } from './verify-totp-modal.component';

describe('VerifyTotpModalComponent', () => {
  let component: VerifyTotpModalComponent;
  let fixture: ComponentFixture<VerifyTotpModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ VerifyTotpModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyTotpModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
