import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BatchImportModalComponent } from './batch-import-modal.component';

describe('BatchImportModalComponent', () => {
  let component: BatchImportModalComponent;
  let fixture: ComponentFixture<BatchImportModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [BatchImportModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchImportModalComponent);
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

