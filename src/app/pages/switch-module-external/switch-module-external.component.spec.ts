/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SwitchModuleExternalComponent } from './switch-module-external.component';

describe('SwitchModuleExternalComponent', () => {
  let component: SwitchModuleExternalComponent;
  let fixture: ComponentFixture<SwitchModuleExternalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ SwitchModuleExternalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchModuleExternalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
