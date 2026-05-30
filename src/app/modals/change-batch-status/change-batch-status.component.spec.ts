import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ChangeBatchStatusComponent } from './change-batch-status.component';

describe('ChangeBatchStatusComponent', () => {
  let component: ChangeBatchStatusComponent;
  let fixture: ComponentFixture<ChangeBatchStatusComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ChangeBatchStatusComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeBatchStatusComponent);
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

