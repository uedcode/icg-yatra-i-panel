/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddShipModalComponent } from './add-ship-modal.component';

describe('AddShipModalComponent', () => {
  let component: AddShipModalComponent;
  let fixture: ComponentFixture<AddShipModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ AddShipModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddShipModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
