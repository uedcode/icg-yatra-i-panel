/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonFaqComponent } from './common-faq.component';

describe('CommonFaqComponent', () => {
  let component: CommonFaqComponent;
  let fixture: ComponentFixture<CommonFaqComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonFaqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonFaqComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
