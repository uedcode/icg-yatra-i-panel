/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonUserManualModalComponent } from './common-user-manual-modal.component';

describe('CommonUserManualModalComponent', () => {
  let component: CommonUserManualModalComponent;
  let fixture: ComponentFixture<CommonUserManualModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonUserManualModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonUserManualModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

