/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ManageApproverComponent } from './manage-approver.component';

describe('ManageApproverComponent', () => {
  let component: ManageApproverComponent;
  let fixture: ComponentFixture<ManageApproverComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ManageApproverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageApproverComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
