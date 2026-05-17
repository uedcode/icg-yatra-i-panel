import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UnitAdminRoleComponent } from './unit-admin-role.component';

describe('UnitAdminRoleComponent', () => {
  let component: UnitAdminRoleComponent;
  let fixture: ComponentFixture<UnitAdminRoleComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [UnitAdminRoleComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAdminRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render component template shell', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html.trim().length).toBeGreaterThan(0);
  });
});
