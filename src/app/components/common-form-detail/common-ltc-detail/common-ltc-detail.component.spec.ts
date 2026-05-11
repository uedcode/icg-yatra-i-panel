/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonLtcDetailComponent } from './common-ltc-detail.component';

describe('CommonLtcDetailComponent', () => {
  let component: CommonLtcDetailComponent;
  let fixture: ComponentFixture<CommonLtcDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [ CommonLtcDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonLtcDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
