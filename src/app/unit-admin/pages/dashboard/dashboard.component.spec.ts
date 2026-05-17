import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserDetails',
      'codeRoleType',
      'getDashboardDetails',
      'closeSidebar'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader'
    ]);
    authService.getUserDetails.and.returnValue({} as any);
    authService.codeRoleType.and.returnValue({ creator: 'CR' } as any);
    authService.getDashboardDetails.and.returnValue(of({ status: true, object: {} }) as any);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService }
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

  it('should run ngOnInit and initialize dashboard flow', () => {
    component.ngOnInit();
    expect(commonService.showLoader).toHaveBeenCalled();
    expect(authService.getUserDetails).toHaveBeenCalled();
  });
});
