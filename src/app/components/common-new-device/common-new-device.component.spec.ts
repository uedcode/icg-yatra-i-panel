/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonNewDeviceComponent } from './common-new-device.component';

describe('CommonNewDeviceComponent', () => {
  let component: CommonNewDeviceComponent;
  let fixture: ComponentFixture<CommonNewDeviceComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonNewDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonNewDeviceComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
