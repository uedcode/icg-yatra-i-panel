/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ShowMsgModalComponent } from './show-msg-modal.component';

describe('ShowMsgModalComponent', () => {
  let component: ShowMsgModalComponent;
  let fixture: ComponentFixture<ShowMsgModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ ShowMsgModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMsgModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
