/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormFteComponent } from './form-fte.component';

describe('FormFteComponent', () => {
  let component: FormFteComponent;
  let fixture: ComponentFixture<FormFteComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ FormFteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
