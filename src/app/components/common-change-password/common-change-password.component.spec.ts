/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonChangePasswordComponent } from './common-change-password.component';

describe('CommonChangePasswordComponent', () => {
  let component: CommonChangePasswordComponent;
  let fixture: ComponentFixture<CommonChangePasswordComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonChangePasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonChangePasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
