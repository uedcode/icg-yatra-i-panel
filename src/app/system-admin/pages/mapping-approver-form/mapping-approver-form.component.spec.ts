/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MappingApproverFormComponent } from './mapping-approver-form.component';

describe('MappingApproverFormComponent', () => {
  let component: MappingApproverFormComponent;
  let fixture: ComponentFixture<MappingApproverFormComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ MappingApproverFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingApproverFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
