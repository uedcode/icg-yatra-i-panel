/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { NewComponent } from './new.component';
import { CommonService } from 'src/app/service/core/common.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeSubFormApiService } from 'src/app/service/api/code/code-sub-form-api.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { HometownApiService } from 'src/app/service/api/claim/hometown-api.service';
import { LtcAvailedHistApiService } from 'src/app/service/api/claim/ltc-availed-hist-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

describe('NewComponent', () => {
  let component: NewComponent;
  let fixture: ComponentFixture<NewComponent>;
  let router: jasmine.SpyObj<Router>;
  let claimApiService: jasmine.SpyObj<ClaimApiService>;
  let hometownApiService: jasmine.SpyObj<HometownApiService>;
  let ltcAvailedHistApiService: jasmine.SpyObj<LtcAvailedHistApiService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    claimApiService = jasmine.createSpyObj<ClaimApiService>('ClaimApiService', []);
    hometownApiService = jasmine.createSpyObj<HometownApiService>('HometownApiService', [
      'init',
      'createOrUpdate',
    ]);
    ltcAvailedHistApiService = jasmine.createSpyObj<LtcAvailedHistApiService>('LtcAvailedHistApiService', [
      'getDoeDifference',
      'checkAvailedHistory',
      'getFamilyDetails',
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
          provide: CodeSubFormApiService,
          useValue: jasmine.createSpyObj<CodeSubFormApiService>('CodeSubFormApiService', ['get']),
        },
        { provide: ClaimApiService, useValue: claimApiService },
        { provide: HometownApiService, useValue: hometownApiService },
        { provide: LtcAvailedHistApiService, useValue: ltcAvailedHistApiService },
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
    ltcAvailedHistApiService.getDoeDifference.and.returnValue(of({ status: true, object: 2 }) as any);
    ltcAvailedHistApiService.checkAvailedHistory.and.returnValue(of({ status: true, object: 0 }) as any);
    ltcAvailedHistApiService.getFamilyDetails.and.returnValue(of({
      status: true,
      object: [{ memberName: 'V Natarajan', age: '-', relation: 'Self', occupation: '-' }],
    }) as any);
    hometownApiService.init.and.returnValue(of({ status: true, object: 'Sonipat' }) as any);

    component.actionPage({ subFormId: 'L', formUrl: 'form-ltc-advance' });

    expect(ltcAvailedHistApiService.getDoeDifference).toHaveBeenCalledWith({ headers: { userId: 'U-LTC' } });
    expect(ltcAvailedHistApiService.checkAvailedHistory).toHaveBeenCalledWith({ headers: { userId: 'U-LTC' } });
    expect(component.ltcFamilyDetails.length).toBe(1);
    expect(component.ltcHomeTown).toBe('Sonipat');
    expect(component.showLtcFamilyModal).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});



