/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormTydutyComponent } from './form-tyduty.component';

describe('FormTydutyComponent', () => {
  let component: FormTydutyComponent;
  let fixture: ComponentFixture<FormTydutyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTydutyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTydutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
