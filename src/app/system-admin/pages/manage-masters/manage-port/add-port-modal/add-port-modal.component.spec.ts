/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddPortModalComponent } from './add-port-modal.component';

describe('AddPortModalComponent', () => {
  let component: AddPortModalComponent;
  let fixture: ComponentFixture<AddPortModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ AddPortModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPortModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
