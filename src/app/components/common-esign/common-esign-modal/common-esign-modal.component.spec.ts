/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonEsignModalComponent } from './common-esign-modal.component';

describe('CommonEsignModalComponent', () => {
  let component: CommonEsignModalComponent;
  let fixture: ComponentFixture<CommonEsignModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonEsignModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonEsignModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
