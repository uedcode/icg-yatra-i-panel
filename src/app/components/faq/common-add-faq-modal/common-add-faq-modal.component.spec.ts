/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonAddFaqModalComponent } from './common-add-faq-modal.component';

describe('CommonAddFaqModalComponent', () => {
  let component: CommonAddFaqModalComponent;
  let fixture: ComponentFixture<CommonAddFaqModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonAddFaqModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonAddFaqModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

