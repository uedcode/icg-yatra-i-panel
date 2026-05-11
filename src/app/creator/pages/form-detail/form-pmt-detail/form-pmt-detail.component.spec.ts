/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormPmtDetailComponent } from './form-pmt-detail.component';

describe('FormPmtDetailComponent', () => {
  let component: FormPmtDetailComponent;
  let fixture: ComponentFixture<FormPmtDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ FormPmtDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPmtDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
