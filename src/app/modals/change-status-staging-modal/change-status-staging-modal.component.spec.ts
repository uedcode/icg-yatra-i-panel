import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ChangeStatusStagingModalComponent } from './change-status-staging-modal.component';

describe('ChangeStatusStagingModalComponent', () => {
  let component: ChangeStatusStagingModalComponent;
  let fixture: ComponentFixture<ChangeStatusStagingModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ChangeStatusStagingModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeStatusStagingModalComponent);
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
