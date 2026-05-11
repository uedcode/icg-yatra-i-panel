/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonRedirectComponent } from './common-redirect.component';

describe('CommonRedirectComponent', () => {
  let component: CommonRedirectComponent;
  let fixture: ComponentFixture<CommonRedirectComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonRedirectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
