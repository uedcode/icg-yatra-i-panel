/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NotPassedComponent } from './not-passed.component';

describe('NotPassedComponent', () => {
  let component: NotPassedComponent;
  let fixture: ComponentFixture<NotPassedComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [NotPassedComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotPassedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
