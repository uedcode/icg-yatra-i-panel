import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonEnableTOtpModalComponent } from './common-enable-t-otp-modal.component';

describe('CommonEnableTOtpModalComponent', () => {
  let component: CommonEnableTOtpModalComponent;
  let fixture: ComponentFixture<CommonEnableTOtpModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [CommonEnableTOtpModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonEnableTOtpModalComponent);
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
