import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ViewRemarkModalComponent } from './view-remark-modal.component';

describe('ViewRemarkModalComponent', () => {
  let component: ViewRemarkModalComponent;
  let fixture: ComponentFixture<ViewRemarkModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ViewRemarkModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRemarkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => (component as any).ngOnInit?.()).not.toThrow();
  });

  it('should render component template shell', () => {
    expect(fixture.nativeElement.innerHTML.trim().length).toBeGreaterThan(0);
  });
});
