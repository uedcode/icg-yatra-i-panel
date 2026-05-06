/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormLtcComponent } from './form-ltc.component';

describe('FormLtcComponent', () => {
  let component: FormLtcComponent;
  let fixture: ComponentFixture<FormLtcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormLtcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormLtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
