import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NotPassedComponent } from './not-passed.component';

describe('NotPassedComponent', () => {
  let component: NotPassedComponent;
  let fixture: ComponentFixture<NotPassedComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [NotPassedComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotPassedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render request page shell', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-header');
    expect(html).toContain('app-sidebar');
    expect(html).toContain('app-footer');
  });
});
