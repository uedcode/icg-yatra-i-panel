/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExcelImportModalComponent } from './excel-import-modal.component';

describe('ExcelImportModalComponent', () => {
  let component: ExcelImportModalComponent;
  let fixture: ComponentFixture<ExcelImportModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ExcelImportModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelImportModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
