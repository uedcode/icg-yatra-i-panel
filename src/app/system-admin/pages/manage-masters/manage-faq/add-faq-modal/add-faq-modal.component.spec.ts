import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AddFaqModalComponent } from './add-faq-modal.component';

describe('AddFaqModalComponent', () => {
  let component: AddFaqModalComponent;
  let fixture: ComponentFixture<AddFaqModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [AddFaqModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFaqModalComponent);
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
