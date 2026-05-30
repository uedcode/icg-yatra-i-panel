/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonEsignComponent } from './common-esign.component';

describe('CommonEsignComponent', () => {
  let component: CommonEsignComponent;
  let fixture: ComponentFixture<CommonEsignComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonEsignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonEsignComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

