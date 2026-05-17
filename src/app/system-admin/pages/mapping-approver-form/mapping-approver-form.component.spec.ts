import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MappingApproverFormComponent } from './mapping-approver-form.component';

describe('MappingApproverFormComponent', () => {
  let component: MappingApproverFormComponent;
  let fixture: ComponentFixture<MappingApproverFormComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [MappingApproverFormComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingApproverFormComponent);
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
