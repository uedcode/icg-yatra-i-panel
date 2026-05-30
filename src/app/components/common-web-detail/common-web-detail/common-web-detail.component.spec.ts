/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonWebDetailComponent } from './common-web-detail.component';

describe('CommonWebDetailComponent', () => {
  let component: CommonWebDetailComponent;
  let fixture: ComponentFixture<CommonWebDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonWebDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonWebDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

