/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ViewErrorModalComponent } from './view-error-modal.component';

describe('ViewErrorModalComponent', () => {
  let component: ViewErrorModalComponent;
  let fixture: ComponentFixture<ViewErrorModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ViewErrorModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewErrorModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
