/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonViewFileComponent } from './common-view-file.component';

describe('CommonViewFileComponent', () => {
  let component: CommonViewFileComponent;
  let fixture: ComponentFixture<CommonViewFileComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CommonViewFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonViewFileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

