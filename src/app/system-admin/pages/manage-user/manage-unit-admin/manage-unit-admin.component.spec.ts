/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ManageUnitAdminComponent } from './manage-unit-admin.component';

describe('ManageUnitAdminComponent', () => {
  let component: ManageUnitAdminComponent;
  let fixture: ComponentFixture<ManageUnitAdminComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ManageUnitAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUnitAdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
