/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ManageSystemAdminComponent } from './manage-system-admin.component';

describe('ManageSystemAdminComponent', () => {
  let component: ManageSystemAdminComponent;
  let fixture: ComponentFixture<ManageSystemAdminComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ManageSystemAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSystemAdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
