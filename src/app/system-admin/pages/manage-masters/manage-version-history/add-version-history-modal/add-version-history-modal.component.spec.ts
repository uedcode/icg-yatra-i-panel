/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddVersionHistoryModalComponent } from './add-version-history-modal.component';

describe('AddVersionHistoryModalComponent', () => {
  let component: AddVersionHistoryModalComponent;
  let fixture: ComponentFixture<AddVersionHistoryModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ AddVersionHistoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVersionHistoryModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
