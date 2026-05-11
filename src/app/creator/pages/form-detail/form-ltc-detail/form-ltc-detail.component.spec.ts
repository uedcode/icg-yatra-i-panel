/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormLtcDetailComponent } from './form-ltc-detail.component';

describe('FormLtcDetailComponent', () => {
  let component: FormLtcDetailComponent;
  let fixture: ComponentFixture<FormLtcDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ FormLtcDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormLtcDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
