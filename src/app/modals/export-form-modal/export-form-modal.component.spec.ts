/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExportFormModalComponent } from './export-form-modal.component';

describe('ExportFormModalComponent', () => {
  let component: ExportFormModalComponent;
  let fixture: ComponentFixture<ExportFormModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ExportFormModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportFormModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
