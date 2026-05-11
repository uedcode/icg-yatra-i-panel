/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddDocumentsModalComponent } from './add-documents-modal.component';

describe('AddDocumentsModalComponent', () => {
  let component: AddDocumentsModalComponent;
  let fixture: ComponentFixture<AddDocumentsModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ AddDocumentsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDocumentsModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
