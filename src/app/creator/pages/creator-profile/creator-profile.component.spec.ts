/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CreatorProfileComponent } from './creator-profile.component';

describe('CreatorProfileComponent', () => {
  let component: CreatorProfileComponent;
  let fixture: ComponentFixture<CreatorProfileComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ CreatorProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

