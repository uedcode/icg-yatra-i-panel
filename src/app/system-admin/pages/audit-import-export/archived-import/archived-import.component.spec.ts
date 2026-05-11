/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ArchivedImportComponent } from './archived-import.component';

describe('ArchivedImportComponent', () => {
  let component: ArchivedImportComponent;
  let fixture: ComponentFixture<ArchivedImportComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ArchivedImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedImportComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
