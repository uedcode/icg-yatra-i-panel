/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChangeBatchStatusComponent } from './change-batch-status.component';

describe('ChangeBatchStatusComponent', () => {
  let component: ChangeBatchStatusComponent;
  let fixture: ComponentFixture<ChangeBatchStatusComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ChangeBatchStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeBatchStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
