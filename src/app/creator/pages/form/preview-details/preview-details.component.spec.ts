/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PreviewDetailsComponent } from './preview-details.component';

describe('PreviewDetailsComponent', () => {
  let component: PreviewDetailsComponent;
  let fixture: ComponentFixture<PreviewDetailsComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ PreviewDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
