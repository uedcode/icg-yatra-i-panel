import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ImportedComponent } from './imported.component';

describe('ImportedComponent', () => {
  let component: ImportedComponent;
  let fixture: ComponentFixture<ImportedComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ImportedComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render audit import-export shell', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-header');
    expect(html).toContain('app-sidebar');
    expect(html).toContain('app-footer');
  });
});
