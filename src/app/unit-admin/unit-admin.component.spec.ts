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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render unit-admin shell text', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
    expect(text).toContain('unit-admin works!');
  });
});
