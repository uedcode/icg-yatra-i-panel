import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let claimService: jasmine.SpyObj<ClaimService>;

  const codeRoleList = {
    superAdmin: 'SAD',
    admin: 'AD',
    systemAdmin: 'SY',
    unitAdmin: 'UN',
    creator: 'CR',
    executor: 'EX',
    verifier: 'VE1',
    verifier1: 'VE1',
    verifier2: 'VE2',
    approver: 'AP',
    ihqStaff: 'IHQAP'
  };

  const verifierUser = {
    userId: 'VERIFIER-1',
    desigId: 'DESIG-VE1',
    roleTypeId: 'VE1',
    unitId: 'UNIT-VE',
    unitName: 'Verifier Unit',
    formId: 'FORM-VE'
  };

  const renderForRole = (roleTypeId: string) => {
    authService.getUserDetails.and.returnValue({
      ...verifierUser,
      roleTypeId,
      userId: `${roleTypeId}-USER`
    });
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'closeSidebar',
      'codeRoleType',
      'getUserDetails'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'hideLoader',
      'showLoader'
    ]);
    claimService = jasmine.createSpyObj<ClaimService>('ClaimService', ['getStatusCount']);

    authService.codeRoleType.and.returnValue(codeRoleList);
    authService.getUserDetails.and.returnValue(verifierUser);
    claimService.getStatusCount.and.returnValue(
      of({
        status: true,
        object: {
          inbox: 11,
          outbox: 12,
          approved: 13,
          rejected: 14,
          passed: 15,
          notPassed: 16
        }
      }) as any
    );

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: ClaimService, useValue: claimService }
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

  it('loads verifier status counts with unit and role headers', () => {
    component.ngOnInit();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(claimService.getStatusCount).toHaveBeenCalledOnceWith({
      headers: {
        desigId: 'DESIG-VE1',
        unitId: 'UNIT-VE',
        roleTypeId: 'VE1'
      }
    });
    expect(component.countObj).toEqual({
      inbox: 11,
      outbox: 12,
      approved: 13,
      rejected: 14,
      passed: 15,
      notPassed: 16
    });
    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('adds user id when the count request is made for a creator role', () => {
    authService.getUserDetails.and.returnValue({
      ...verifierUser,
      userId: 'CREATOR-2',
      roleTypeId: 'CR'
    });

    component.ngOnInit();

    expect(claimService.getStatusCount).toHaveBeenCalledOnceWith({
      headers: {
        desigId: 'DESIG-VE1',
        unitId: 'UNIT-VE',
        roleTypeId: 'CR',
        userId: 'CREATOR-2'
      }
    });
  });

  it('hides the loader when count loading fails', () => {
    spyOn(console, 'log');
    claimService.getStatusCount.and.returnValue(
      throwError(() => ({ status: 500 })) as any
    );

    component.ngOnInit();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(component.countObj).toEqual({});
  });

  it('shows verifier-only claim and admin workflow menus for verifier role', () => {
    const text = renderForRole('VE1');

    expect(text).toContain('Inbox 11');
    expect(text).toContain('Outbox 12');
    expect(text).toContain('Approved 13');
    expect(text).toContain('Rejected 14');
    expect(text).toContain('Passed 15');
    expect(text).toContain('Not Passed 16');
    expect(text).toContain('Claim Archive');
    expect(text).toContain('Pay Inbox');
    expect(text).toContain('Manual Draft');
    expect(text).toContain('Budget Allocation');
  });

  it('shows pay menus but hides verifier-only claim menus for verifier2 role', () => {
    const text = renderForRole('VE2');

    expect(text).toContain('Pay Inbox');
    expect(text).toContain('Pay Outbox');
    expect(text).toContain('Pay Approved');
    expect(text).toContain('Pay Not Approved');
    expect(text).not.toContain('Passed 15');
    expect(text).not.toContain('Not Passed 16');
    expect(text).not.toContain('Claim Archive');
    expect(text).not.toContain('Manual Draft');
    expect(text).not.toContain('Budget Allocation');
  });

  it('hides verifier and pay menus for approver role', () => {
    const text = renderForRole('AP');

    expect(text).toContain('Dashboard');
    expect(text).toContain('Inbox 11');
    expect(text).toContain('Rejected 14');
    expect(text).not.toContain('Passed 15');
    expect(text).not.toContain('Pay Inbox');
    expect(text).not.toContain('Manual Draft');
    expect(text).not.toContain('Budget Allocation');
  });

  it('toggles the local submenu flag', () => {
    expect(component.submenuShow).toBeFalse();

    component.showHideSubMenu();
    expect(component.submenuShow).toBeTrue();

    component.showHideSubMenu();
    expect(component.submenuShow).toBeFalse();
  });
});
