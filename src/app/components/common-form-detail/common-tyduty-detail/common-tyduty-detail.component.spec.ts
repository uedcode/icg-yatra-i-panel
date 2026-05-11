/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonTydutyDetailComponent } from './common-tyduty-detail.component';

describe('CommonTydutyDetailComponent', () => {
  let component: CommonTydutyDetailComponent;
  let fixture: ComponentFixture<CommonTydutyDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonTydutyDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTydutyDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
