/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddPortRateModalComponent } from './add-port-rate-modal.component';

describe('AddPortRateModalComponent', () => {
  let component: AddPortRateModalComponent;
  let fixture: ComponentFixture<AddPortRateModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ AddPortRateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPortRateModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
