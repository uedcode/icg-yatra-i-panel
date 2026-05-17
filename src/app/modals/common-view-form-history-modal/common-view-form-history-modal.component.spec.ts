import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonViewFormHistoryModalComponent } from './common-view-form-history-modal.component';

describe('CommonViewFormHistoryModalComponent', () => {
  let component: CommonViewFormHistoryModalComponent;
  let fixture: ComponentFixture<CommonViewFormHistoryModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [CommonViewFormHistoryModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonViewFormHistoryModalComponent);
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
