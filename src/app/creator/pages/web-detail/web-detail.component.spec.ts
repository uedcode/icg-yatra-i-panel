/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WebDetailComponent } from './web-detail.component';

describe('WebDetailComponent', () => {
  let component: WebDetailComponent;
  let fixture: ComponentFixture<WebDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ WebDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
