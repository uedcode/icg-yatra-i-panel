/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonSwitchModuleComponent } from './common-switch-module.component';

describe('CommonSwitchModuleComponent', () => {
  let component: CommonSwitchModuleComponent;
  let fixture: ComponentFixture<CommonSwitchModuleComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonSwitchModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSwitchModuleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
