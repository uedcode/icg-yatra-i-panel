/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonManageDeviceModalComponent } from './common-manage-device-modal.component';

describe('CommonManageDeviceModalComponent', () => {
  let component: CommonManageDeviceModalComponent;
  let fixture: ComponentFixture<CommonManageDeviceModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonManageDeviceModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonManageDeviceModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
