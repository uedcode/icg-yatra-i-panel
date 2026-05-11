/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonFteDetailComponent } from './common-fte-detail.component';

describe('CommonFteDetailComponent', () => {
  let component: CommonFteDetailComponent;
  let fixture: ComponentFixture<CommonFteDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonFteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonFteDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
