import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SwitchModuleComponent } from './switch-module.component';

describe('SwitchModuleComponent', () => {
  let component: SwitchModuleComponent;
  let fixture: ComponentFixture<SwitchModuleComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [SwitchModuleComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render common switch module container', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-common-switch-module');
  });
});
