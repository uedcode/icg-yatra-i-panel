import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitAdminComponent } from './unit-admin.component';

describe('UnitAdminComponent', () => {
  let component: UnitAdminComponent;
  let fixture: ComponentFixture<UnitAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
