/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonManageFaqComponent } from './common-manage-faq.component';

describe('CommonManageFaqComponent', () => {
  let component: CommonManageFaqComponent;
  let fixture: ComponentFixture<CommonManageFaqComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonManageFaqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonManageFaqComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
