/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PortRateComponent } from './port-rate.component';

describe('PortRateComponent', () => {
  let component: PortRateComponent;
  let fixture: ComponentFixture<PortRateComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ PortRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortRateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
