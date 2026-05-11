/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DeleteStagingModalComponent } from './delete-staging-modal.component';

describe('DeleteStagingModalComponent', () => {
  let component: DeleteStagingModalComponent;
  let fixture: ComponentFixture<DeleteStagingModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ DeleteStagingModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteStagingModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
