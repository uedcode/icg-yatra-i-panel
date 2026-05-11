/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UnitAdminRoleComponent } from './unit-admin-role.component';

describe('UnitAdminRoleComponent', () => {
  let component: UnitAdminRoleComponent;
  let fixture: ComponentFixture<UnitAdminRoleComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ UnitAdminRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAdminRoleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
