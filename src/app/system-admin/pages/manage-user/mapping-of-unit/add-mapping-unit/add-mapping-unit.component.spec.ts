import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AddMappingUnitComponent } from './add-mapping-unit.component';

describe('AddMappingUnitComponent', () => {
  let component: AddMappingUnitComponent;
  let fixture: ComponentFixture<AddMappingUnitComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [AddMappingUnitComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMappingUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render add-mapping-unit modal shell', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('id="unitMapping"');
    expect(html).toContain('Add Unit Mapping');
  });
});

