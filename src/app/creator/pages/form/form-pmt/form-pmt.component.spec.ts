/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormPmtDutyComponent } from './form-pmt.component';

describe('FormPmtDutyComponent', () => {
  let component: FormPmtDutyComponent;
  let fixture: ComponentFixture<FormPmtDutyComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ FormPmtDutyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPmtDutyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
