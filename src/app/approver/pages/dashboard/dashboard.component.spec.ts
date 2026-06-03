import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimService } from 'src/app/service/claim/claim.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let claimService: jasmine.SpyObj<ClaimService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserDetails',
      'codeRoleType',
      'closeSidebar'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader'
    ]);
    claimService = jasmine.createSpyObj<ClaimService>('ClaimService', ['getStatusCount']);
    authService.getUserDetails.and.returnValue({
      desigId: 'D-1',
      unitId: 'U-1',
      roleTypeId: 'VE1',
      userId: 'USR-1'
    } as any);
    authService.codeRoleType.and.returnValue({ creator: 'CR', verifier: 'VE1' } as any);
    claimService.getStatusCount.and.returnValue(of({ status: true, object: {} }) as any);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: ClaimService, useValue: claimService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit and load dashboard count setup', () => {
    component.ngOnInit();
    expect(commonService.showLoader).toHaveBeenCalled();
    expect(claimService.getStatusCount).toHaveBeenCalled();
  });
});

