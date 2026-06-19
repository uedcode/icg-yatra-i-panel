/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonPmtDetailComponent } from './common-pmt-detail.component';

describe('CommonPmtDetailComponent', () => {
  let component: CommonPmtDetailComponent;
  let fixture: ComponentFixture<CommonPmtDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [ CommonPmtDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonPmtDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

