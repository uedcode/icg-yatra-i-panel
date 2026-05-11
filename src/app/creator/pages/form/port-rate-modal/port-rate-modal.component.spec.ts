/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PortRateModalComponent } from './port-rate-modal.component';

describe('PortRateModalComponent', () => {
  let component: PortRateModalComponent;
  let fixture: ComponentFixture<PortRateModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ PortRateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortRateModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
