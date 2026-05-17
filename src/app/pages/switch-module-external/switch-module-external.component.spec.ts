import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SwitchModuleExternalComponent } from './switch-module-external.component';

describe('SwitchModuleExternalComponent', () => {
  let component: SwitchModuleExternalComponent;
  let fixture: ComponentFixture<SwitchModuleExternalComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [SwitchModuleExternalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchModuleExternalComponent);
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
