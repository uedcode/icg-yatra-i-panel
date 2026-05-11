/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChangeStatusStagingModalComponent } from './change-status-staging-modal.component';

describe('ChangeStatusStagingModalComponent', () => {
  let component: ChangeStatusStagingModalComponent;
  let fixture: ComponentFixture<ChangeStatusStagingModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ChangeStatusStagingModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeStatusStagingModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
