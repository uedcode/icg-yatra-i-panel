/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SwitchModuleComponent } from './switch-module.component';

describe('SwitchModuleComponent', () => {
  let component: SwitchModuleComponent;
  let fixture: ComponentFixture<SwitchModuleComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ SwitchModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchModuleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
