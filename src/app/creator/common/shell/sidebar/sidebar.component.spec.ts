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

  const creatorUser = {
    userId: 'CREATOR-1',
    desigId: 'DESIG-1',
    roleTypeId: 'CR',
    unitId: 'UNIT-1',
    unitName: 'Creator Unit',
    formId: 'FORM-CR'
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
    authService.getUserDetails.and.returnValue(creatorUser);
    authService.isRuntimeAdv.and.returnValue(true);
    authService.isRuntimeClm.and.returnValue(false);
    claimService.getStatusCount.and.returnValue(
      of({
        status: true,
        object: {
          archiveCount: 9,
          draftCount: 2,
          inboxCount: 3,
          outboxCount: 4,
          approvedCount: 5,
          notApprovedCount: 6,
          passedCount: 7,
          notPassedCount: 8,
          newClaimCount: 10,
          inboxClaimCount: 11,
          outboxClaimCount: 12,
          draftClaimCount: 13,
          approvedClaimCount: 14,
          notApprovedClaimCount: 15,
          passedClaimCount: 16,
          notPassedClaimCount: 17,
          archiveClaimCount: 18,
          payObCount: 31,
          payApCount: 32,
          payNapCount: 33
        }
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

  it('loads creator status counts with creator user headers only', () => {
    component.ngOnInit();

    expect(commonService.showLoader).toHaveBeenCalled();
    expect(claimService.getStatusCount).toHaveBeenCalledOnceWith({
      headers: {
        unitId: 'UNIT-1',
        roleTypeId: 'CR',
        userId: 'CREATOR-1'
      }
    });
    expect(component.countObj.inboxCount).toBe(3);
    expect(component.countObj.outboxCount).toBe(4);
    expect(component.countObj.notApprovedCount).toBe(6);
    expect(component.countObj.archiveClaimCount).toBe(18);
    expect(component.countObj.payObCount).toBe(31);
    expect(component.countObj.payApCount).toBe(32);
    expect(component.countObj.payNapCount).toBe(33);
    expect(commonService.hideLoader).toHaveBeenCalled();
  });

  it('adds unit id and omits user id when the sidebar is used by a non-creator role', () => {
    authService.getUserDetails.and.returnValue({
      ...creatorUser,
      userId: 'APPROVER-1',
      roleTypeId: 'AP',
      unitId: 'UNIT-AP'
    });

    component.ngOnInit();

    expect(claimService.getStatusCount).toHaveBeenCalledOnceWith({
      headers: {
        userId: 'APPROVER-1',
        gxUnitId: 'UNIT-AP',
        roleTypeId: 'AP'
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

  it('renders creator ADV legacy sidebar labels with count badges', () => {
    authService.isRuntimeAdv.and.returnValue(true);
    authService.isRuntimeClm.and.returnValue(false);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('New');
    expect(text).toContain('Draft 2');
    expect(text).toContain('Inbox 3');
    expect(text).toContain('Outbox 4');
    expect(text).toContain('Approved 5');
    expect(text).toContain('Not Approved 6');
    expect(text).toContain('Passed 7');
    expect(text).toContain('Not Passed 8');
    expect(text).toContain('Archive 9');
    expect(text).toContain('Update Pay Details');
    expect(text).toContain('Outbox 31');
    expect(text).toContain('Approved 32');
    expect(text).toContain('Not Approved 33');
  });

  it('renders creator CLM legacy sidebar labels and hides ADV pay menu', () => {
    authService.isRuntimeAdv.and.returnValue(false);
    authService.isRuntimeClm.and.returnValue(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Movement Update');
    expect(text).toContain('New 10');
    expect(text).toContain('Inbox 11');
    expect(text).toContain('Outbox 12');
    expect(text).toContain('Draft 13');
    expect(text).toContain('Approved 14');
    expect(text).toContain('Not Approved 15');
    expect(text).toContain('Passed 16');
    expect(text).toContain('Not Passed 17');
    expect(text).toContain('Archive 18');
    expect(text).not.toContain('Update Pay Details');
  });

  it('toggles the local submenu flag', () => {
    expect(component.submenuShow).toBeFalse();

    component.showHideSubMenu();
    expect(component.submenuShow).toBeTrue();

    component.showHideSubMenu();
    expect(component.submenuShow).toBeFalse();
  });
});

