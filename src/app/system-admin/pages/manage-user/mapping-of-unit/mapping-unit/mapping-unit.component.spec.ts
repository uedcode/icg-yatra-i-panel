/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MappingUnitComponent } from './mapping-unit.component';

describe('MappingUnitComponent', () => {
  let component: MappingUnitComponent;
  let fixture: ComponentFixture<MappingUnitComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ MappingUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingUnitComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
