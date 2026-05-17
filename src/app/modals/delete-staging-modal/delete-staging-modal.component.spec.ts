import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DeleteStagingModalComponent } from './delete-staging-modal.component';

describe('DeleteStagingModalComponent', () => {
  let component: DeleteStagingModalComponent;
  let fixture: ComponentFixture<DeleteStagingModalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [DeleteStagingModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteStagingModalComponent);
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
