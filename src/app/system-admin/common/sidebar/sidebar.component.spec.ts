import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let claimService: jasmine.SpyObj<ClaimService>;
  let statusCountRefresh$: Subject<void>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'closeSidebar',
      'getUserDetails',
      'codeRoleType'
    ]);
    claimService = jasmine.createSpyObj<ClaimService>('ClaimService', ['getStatusCount']);
    statusCountRefresh$ = new Subject<void>();
    (claimService as any).statusCountRefresh$ = statusCountRefresh$;
    claimService.getStatusCount.and.returnValue(of({
      status: true,
      object: [{ inbox: 3, exported: 2 }]
    }) as any);
    authService.getUserDetails.and.returnValue({
      formId: 'SYS-1',
      userId: 'SYS-1',
      unitName: 'HQ Unit',
      roleTypeId: 'SY'
    } as any);
    authService.codeRoleType.and.returnValue({ systemAdmin: 'SY' } as any);

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ClaimService, useValue: claimService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user details and role code list', () => {
    expect(authService.getUserDetails).toHaveBeenCalled();
    expect(authService.codeRoleType).toHaveBeenCalled();
    expect(component.userIdDetails.formId).toBe('SYS-1');
  });

  it('should refresh state counts when the shared count refresh event emits', () => {
    expect(claimService.getStatusCount).toHaveBeenCalledTimes(1);

    statusCountRefresh$.next();

    expect(claimService.getStatusCount).toHaveBeenCalledTimes(2);
    expect(component.stateCount).toEqual(jasmine.objectContaining({ inbox: 3, exported: 2 }));
  });

  it('should stop listening for count refresh events after destroy', () => {
    component.ngOnDestroy();

    statusCountRefresh$.next();

    expect(claimService.getStatusCount).toHaveBeenCalledTimes(1);
  });

  it('should render key system admin menu entries', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Dashboard');
    expect(text).toContain('Statistics');
    expect(text).toContain('Esign Report');
    expect(text).toContain('Import');
    expect(text).toContain('Export');
    expect(text).toContain('Archived');
    expect(text).toContain('Diary Claim');
    expect(text).toContain('Manage Unit Admin');
    expect(text).toContain('Settings');
    expect(text).toContain('Excel Import');
  });

  it('should open user manual modal', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });

    try {
      component.openUserManualModal();
      expect(modalSpy).toHaveBeenCalledWith('show');
    } finally {
      (window as any).$ = old$;
    }
  });

  it('should bind slide click handler in sidebarDropdown', () => {
    const old$ = (window as any).$;
    const onSpy = jasmine.createSpy('on');
    const findParentRemove = jasmine.createSpy('removeClass');
    const findParent = jasmine.createSpy('parent').and.returnValue({
      removeClass: findParentRemove
    });
    const findSpy = jasmine.createSpy('find').and.returnValue({ parent: findParent });

    (window as any).$ = (selector: any) => {
      if (selector === '.side-menu') {
        return { find: findSpy };
      }
      if (selector === "[data-toggle='slide']") {
        return { on: onSpy };
      }
      return { parent: () => ({ hasClass: () => false, toggleClass: () => undefined }) };
    };

    try {
      component.sidebarDropdown();
      expect(onSpy).toHaveBeenCalled();
      expect(onSpy.calls.mostRecent().args[0]).toBe('click');
      expect(typeof onSpy.calls.mostRecent().args[1]).toBe('function');
    } finally {
      (window as any).$ = old$;
    }
  });
});

