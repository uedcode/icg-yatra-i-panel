import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ViewErrorModalComponent } from './view-error-modal.component';

describe('ViewErrorModalComponent', () => {
  let component: ViewErrorModalComponent;
  let fixture: ComponentFixture<ViewErrorModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ViewErrorModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewErrorModalComponent);
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
