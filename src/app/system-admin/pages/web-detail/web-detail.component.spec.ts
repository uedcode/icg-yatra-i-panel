import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { WebDetailComponent } from './web-detail.component';

describe('WebDetailComponent', () => {
  let component: WebDetailComponent;
  let fixture: ComponentFixture<WebDetailComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [WebDetailComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render common web detail container', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-common-web-detail');
  });
});
