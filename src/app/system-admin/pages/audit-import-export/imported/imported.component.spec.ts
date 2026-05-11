/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ImportedComponent } from './imported.component';

describe('ImportedComponent', () => {
  let component: ImportedComponent;
  let fixture: ComponentFixture<ImportedComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ImportedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
