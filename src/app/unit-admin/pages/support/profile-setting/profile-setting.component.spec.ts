import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ProfileSettingComponent } from './profile-setting.component';

describe('ProfileSettingComponent', () => {
  let component: ProfileSettingComponent;
  let fixture: ComponentFixture<ProfileSettingComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ProfileSettingComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render profile setting layout shell', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-header');
    expect(html).toContain('app-sidebar');
    expect(html).toContain('app-common-profile-setting');
  });
});

