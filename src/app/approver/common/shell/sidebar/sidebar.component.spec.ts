import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

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

  const renderForRole = (roleTypeId: string, runtimeModule: 'ADV' | 'CLM' = 'ADV') => {
    authService.getUserDetails.and.returnValue({
      ...verifierUser,
      roleTypeId,
      userId: `${roleTypeId}-USER`
    });
    authService.isRuntimeAdv.and.returnValue(runtimeModule === 'ADV');
    authService.isRuntimeClm.and.returnValue(runtimeModule === 'CLM');
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'closeSidebar',
      'codeRoleType',
      'getUserDetails',
      'isRuntimeAdv',
      'isRuntimeClm'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'hideLoader',
      'showLoader'
    ]);
    claimService = jasmine.createSpyObj<ClaimService>('ClaimService', ['getStatusCount']);
    (claimService as any).statusCountRefresh$ = new Subject<void>();

    authService.codeRoleType.and.returnValue(codeRoleList);
    authService.getUserDetails.and.returnValue(verifierUser);
    authService.isRuntimeAdv.and.returnValue(true);
    authService.isRuntimeClm.and.returnValue(false);
    claimService.getStatusCount.and.returnValue(
      of({
        status: true,
        object: [{
          inboxCount: 11,
          outboxCount: 12,
          approvedCount: 13,
          notApprovedCount: 14,
          passedCount: 15,
          notPassedCount: 16,
          archiveCount: 17,
          inboxClaimCount: 21,
          outboxClaimCount: 22,
          approvedClaimCount: 23,
          notApprovedClaimCount: 24,
          passedClaimCount: 25,
          notPassedClaimCount: 26,
          archiveClaimCount: 27,
          payIbCount: 30,
          payObCount: 31,
          payApCount: 32,
          payNapCount: 33
        }]
      }) as any
    );

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      imports: [RouterTestingModule],
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
        userId: 'VERIFIER-1',
        roleTypeId: 'VE1',
        gxUnitId: 'UNIT-VE'
      }
    });
    expect(component.countObj.inboxCount).toBe(11);
    expect(component.countObj.outboxCount).toBe(12);
    expect(component.countObj.notApprovedCount).toBe(14);
    expect(component.countObj.archiveClaimCount).toBe(27);
    expect(component.countObj.payIbCount).toBe(30);
    expect(component.countObj.payObCount).toBe(31);
    expect(component.countObj.payApCount).toBe(32);
    expect(component.countObj.payNapCount).toBe(33);
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
        userId: 'CREATOR-2',
        unitId: 'UNIT-VE',
        roleTypeId: 'CR',
      }
    });
  });

  it('sends only designation header when unit and role are missing', () => {
    authService.getUserDetails.and.returnValue({
      ...verifierUser,
      unitId: null,
      roleTypeId: null
    } as any);

    component.ngOnInit();

    expect(claimService.getStatusCount).toHaveBeenCalledOnceWith({
      headers: {
        userId: 'VERIFIER-1'
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
    expect(component.countObj.inboxCount).toBeUndefined();
    expect(component.countObj.approvedCount).toBeUndefined();
  });

  it('does not overwrite count object when API returns status false', () => {
    component.countObj.inboxCount = 99;
    claimService.getStatusCount.and.returnValue(
      of({ status: false, object: { inboxCount: 1 } }) as any
    );

    component.getCount();

    expect(component.countObj.inboxCount).toBe(99);
    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('hides loader when getStatusCount throws synchronously', () => {
    spyOn(console, 'log');
    claimService.getStatusCount.and.callFake(() => {
      throw new Error('sync failure');
    });

    component.getCount();

    expect(commonService.hideLoader).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('shows ADV legacy queue and special menus for verifier1 role', () => {
    const text = renderForRole('VE1', 'ADV');

    expect(text).toContain('Inbox 11');
    expect(text).toContain('Outbox 12');
    expect(text).toContain('Approved 13');
    expect(text).toContain('Not Approved 14');
    expect(text).toContain('Passed 15');
    expect(text).toContain('Not Passed 16');
    expect(text).toContain('Archive');
    expect(text).toContain('Settings');
    expect(text).toContain('Update Pay Details');
    expect(text).toContain('Inbox 30');
    expect(text).toContain('Outbox 31');
    expect(text).toContain('Approved 32');
    expect(text).toContain('Not Approved 33');
    expect(text).not.toContain('Manual Draft');
    expect(text).not.toContain('Budget Allocation');
  });

  it('shows ADV main queues and pay menus but hides settings for verifier2 role', () => {
    const text = renderForRole('VE2', 'ADV');

    expect(text).toContain('Inbox 11');
    expect(text).toContain('Passed 15');
    expect(text).toContain('Not Passed 16');
    expect(text).toContain('Archive');
    expect(text).toContain('Update Pay Details');
    expect(text).not.toContain('Settings');
    expect(text).not.toContain('Manual Draft');
    expect(text).not.toContain('Budget Allocation');
  });

  it('shows ADV main queues and pay menus but hides verifier-only special menus for approver role', () => {
    const text = renderForRole('AP', 'ADV');

    expect(text).toContain('Inbox 11');
    expect(text).toContain('Not Approved 14');
    expect(text).toContain('Passed 15');
    expect(text).toContain('Not Passed 16');
    expect(text).toContain('Archive');
    expect(text).toContain('Update Pay Details');
    expect(text).not.toContain('Settings');
    expect(text).not.toContain('Manual Draft');
    expect(text).not.toContain('Budget Allocation');
  });

  it('shows CLM queues and settings for verifier2 role', () => {
    const text = renderForRole('VE2', 'CLM');

    expect(text).toContain('Inbox 21');
    expect(text).toContain('Outbox 22');
    expect(text).toContain('Approved 23');
    expect(text).toContain('Not Approved 24');
    expect(text).toContain('Passed 25');
    expect(text).toContain('Not Passed 26');
    expect(text).toContain('Archive 27');
    expect(text).toContain('Settings');
    expect(text).not.toContain('Update Pay Details');
  });

  it('shows CLM queues but hides settings for approver role', () => {
    const text = renderForRole('AP', 'CLM');

    expect(text).toContain('Inbox 21');
    expect(text).toContain('Outbox 22');
    expect(text).toContain('Approved 23');
    expect(text).toContain('Not Approved 24');
    expect(text).toContain('Passed 25');
    expect(text).toContain('Not Passed 26');
    expect(text).toContain('Archive 27');
    expect(text).not.toContain('Settings');
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

  it('opens the user manual modal', () => {
    const old$ = (window as any).$;
    const modalSpy = jasmine.createSpy('modal');
    (window as any).$ = () => ({ modal: modalSpy });

    try {
      component.openUserManualModal();
      expect(modalSpy).toHaveBeenCalledOnceWith('show');
    } finally {
      (window as any).$ = old$;
    }
  });

  it('binds sidebar slide click handler', () => {
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

