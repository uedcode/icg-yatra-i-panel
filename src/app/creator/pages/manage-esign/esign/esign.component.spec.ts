/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EsignComponent } from './esign.component';

describe('EsignComponent', () => {
  let component: EsignComponent;
  let fixture: ComponentFixture<EsignComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ EsignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EsignComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

