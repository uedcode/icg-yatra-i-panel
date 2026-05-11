/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExportedComponent } from './exported.component';

describe('ExportedComponent', () => {
  let component: ExportedComponent;
  let fixture: ComponentFixture<ExportedComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ExportedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
