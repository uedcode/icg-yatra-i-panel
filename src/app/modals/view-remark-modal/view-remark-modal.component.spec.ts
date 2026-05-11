/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ViewRemarkModalComponent } from './view-remark-modal.component';

describe('ViewRemarkModalComponent', () => {
  let component: ViewRemarkModalComponent;
  let fixture: ComponentFixture<ViewRemarkModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ViewRemarkModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRemarkModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
