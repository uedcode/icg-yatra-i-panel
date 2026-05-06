/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormPmtComponent } from './form-pmt.component';

describe('FormPmtComponent', () => {
  let component: FormPmtComponent;
  let fixture: ComponentFixture<FormPmtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPmtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
