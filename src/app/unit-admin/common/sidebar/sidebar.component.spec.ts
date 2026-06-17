import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SystemAdminService } from 'src/app/service/admin/systemAdmin.service';
import { of } from 'rxjs';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let systemAdmin: jasmine.SpyObj<SystemAdminService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'closeSidebar',
      'getUserDetails',
      'codeRoleType'
    ]);
    systemAdmin = jasmine.createSpyObj<SystemAdminService>('SystemAdminService', [
      'getUnitAdminRoles'
    ]);
    authService.getUserDetails.and.returnValue({
      formId: 'UNIT-ADMIN',
      unitName: 'HQ Unit',
      unitId: 'UNIT-1',
      gxUnitId: 'GX-1',
      roleTypeId: 'UN'
    } as any);
    authService.codeRoleType.and.returnValue({ unitAdmin: 'UN' } as any);
    systemAdmin.getUnitAdminRoles.and.returnValue(of({
      status: true,
      object: [{ roleId: 'ROLE-1' }, { roleId: 'ROLE-2' }]
    }) as any);

    await TestBed.configureTestingModule({
      declarations: [ SidebarComponent ],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: SystemAdminService, useValue: systemAdmin }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders unit admin legacy sidebar items and hides commented paylevel menu', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Manage Unit Admin');
    expect(text).toContain('Manage Role');
    expect(text).toContain('Archive');
    expect(text).toContain('Report TY Duty');
    expect(text).toContain('Update PMT Unit');
    expect(text).not.toContain('Manage Paylevel');
  });

  it('loads and renders legacy archive count badge', () => {
    fixture.detectChanges();

    expect(systemAdmin.getUnitAdminRoles).toHaveBeenCalledWith({
      headers: {
        unitId: 'GX-1',
        verAppIndicator: '1',
        isArchive: '1'
      }
    });
    expect(fixture.nativeElement.textContent).toContain('2');
  });
});
