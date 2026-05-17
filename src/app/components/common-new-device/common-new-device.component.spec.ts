import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonNewDeviceComponent } from './common-new-device.component';

describe('CommonNewDeviceComponent', () => {
  let component: CommonNewDeviceComponent;
  let fixture: ComponentFixture<CommonNewDeviceComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [CommonNewDeviceComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonNewDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form object', () => {
    expect(component.formObj).toEqual({});
  });

  it('should allow submit without side effects', () => {
    expect(() => component.submit()).not.toThrow();
  });
});
