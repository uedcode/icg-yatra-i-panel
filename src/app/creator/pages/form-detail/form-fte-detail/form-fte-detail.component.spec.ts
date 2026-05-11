/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormFteDetailComponent } from './form-fte-detail.component';

describe('FormFteDetailComponent', () => {
  let component: FormFteDetailComponent;
  let fixture: ComponentFixture<FormFteDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ FormFteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFteDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
