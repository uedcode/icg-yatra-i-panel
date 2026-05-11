/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddMappingUnitComponent } from './add-mapping-unit.component';

describe('AddMappingUnitComponent', () => {
  let component: AddMappingUnitComponent;
  let fixture: ComponentFixture<AddMappingUnitComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ AddMappingUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMappingUnitComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
