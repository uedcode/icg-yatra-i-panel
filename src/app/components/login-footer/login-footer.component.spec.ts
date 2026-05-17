import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFooterComponent } from './login-footer.component';
import { environment } from 'src/environments/environment';

describe('LoginFooterComponent', () => {
  let component: LoginFooterComponent;
  let fixture: ComponentFixture<LoginFooterComponent>;

  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [ LoginFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose build number from environment', () => {
    expect(component.buildNo).toBe(environment.appConfig.buildNo);
  });

  it('should render login footer managed-by text', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
    expect(text).toContain('Website Content Managed by IHQ MOD(N)/DNPF');
  });
});
