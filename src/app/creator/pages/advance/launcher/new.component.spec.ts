/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { NewComponent } from './new.component';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeSubFormService } from 'src/app/service/master/codeSubForm.service';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

describe('NewComponent', () => {
  let component: NewComponent;
  let fixture: ComponentFixture<NewComponent>;
  let router: jasmine.SpyObj<Router>;
  let claimService: jasmine.SpyObj<ClaimService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    claimService = jasmine.createSpyObj<ClaimService>('ClaimService', [
      'getLtcDoeDifference',
      'checkLtcAvailedHistory',
      'getLtcFamilyDetails',
      'initHomeTown',
      'saveHomeTown',
    ]);

    return TestBed.configureTestingModule({
      declarations: [ NewComponent ],
      imports: [FormsModule],
      providers: [
        { provide: Location, useValue: jasmine.createSpyObj<Location>('Location', ['back']) },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj<AuthService>('AuthService', [
            'getUserDetails',
            'getModuleName',
            'getRuntimeModuleId',
          ]),
        },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({ get: () => null }),
          },
        },
        {
          provide: CommonService,
          useValue: jasmine.createSpyObj<CommonService>('CommonService', [
            'showLoader',
            'hideLoader',
            'showMessage',
          ]),
        },
        {
          provide: CodeSubFormService,
          useValue: jasmine.createSpyObj<CodeSubFormService>('CodeSubFormService', ['get']),
        },
        { provide: ClaimService, useValue: claimService },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens legacy LTC family modal when availed history is missing', () => {
    component.userIdDetails = { userId: 'U-LTC' };
    claimService.getLtcDoeDifference.and.returnValue(of({ status: true, object: 2 }) as any);
    claimService.checkLtcAvailedHistory.and.returnValue(of({ status: true, object: 0 }) as any);
    claimService.getLtcFamilyDetails.and.returnValue(of({
      status: true,
      object: [{ memberName: 'V Natarajan', age: '-', relation: 'Self', occupation: '-' }],
    }) as any);
    claimService.initHomeTown.and.returnValue(of({ status: true, object: 'Sonipat' }) as any);

    component.actionPage({ subFormId: 'L', formUrl: 'form-ltc-advance' });

    expect(claimService.getLtcDoeDifference).toHaveBeenCalledWith({ headers: { userId: 'U-LTC' } });
    expect(claimService.checkLtcAvailedHistory).toHaveBeenCalledWith({ headers: { userId: 'U-LTC' } });
    expect(component.ltcFamilyDetails.length).toBe(1);
    expect(component.ltcHomeTown).toBe('Sonipat');
    expect(component.showLtcFamilyModal).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

