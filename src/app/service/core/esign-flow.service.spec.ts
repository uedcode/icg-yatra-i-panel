import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EsignApiService } from 'src/app/service/api/security/esign-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ESignFlowService } from './esign-flow.service';
import { environment } from 'src/environments/environment';

describe('ESignFlowService', () => {
  let service: ESignFlowService;
  let esignApi: jasmine.SpyObj<EsignApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    esignApi = jasmine.createSpyObj('EsignApiService', ['prepareForESign', 'performESign']);
    authService = jasmine.createSpyObj('AuthService', ['getUserDetails', 'getModuleName']);
    commonService = jasmine.createSpyObj('CommonService', ['showLoader', 'hideLoader', 'showMessage']);
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], {
      url: '/claim/approver/form-pmt-duty-claim?id=C_ID',
    });

    authService.getUserDetails.and.returnValue({
      roleTypeId: 'VE2',
      userId: 'U1',
      desigId: 'D1',
      financialYear: '2026',
      moduleId: 'CLM',
      unitId: 'UNIT',
      personName: 'Verifier',
    } as any);
    authService.getModuleName.and.returnValue('/claim/approver' as any);

    TestBed.configureTestingModule({
      providers: [
        ESignFlowService,
        { provide: EsignApiService, useValue: esignApi },
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(ESignFlowService);
  });

  it('builds the legacy eSign payload with defaults and optional budget fields', () => {
    const payload = service.buildRequest({
      id: 'C_ID',
      status: 'OB',
      formRemarks: 'Verified',
      redPercent: 50,
      redAmount: 1000,
      balanceAmount: 2000,
      billAmount: 3000,
    });

    expect(payload).toEqual(jasmine.objectContaining({
      claimId: 'C_ID',
      roleTypeId: 'VE2',
      desigId: 'D1',
      userId: 'U1',
      status: 'OB',
      remark: 'Verified',
      financialYear: '2026',
      moduleId: 'CLM',
      unitId: 'UNIT',
      formId: 'C_ID',
      redPercent: 50,
      redAmount: 1000,
      balanceAmt: 2000,
      billAmt: 3000,
    }));
  });

  it('identifies eSign forward only for eSign outbox by verifier2 or approver', () => {
    expect(service.isESignForward('ES', 'OB', 'VE2')).toBeTrue();
    expect(service.isESignForward('eSignAlt', 'OB', 'AP')).toBeTrue();
    expect(service.isESignForward('E_SIGN', 'OB', 'AP')).toBeTrue();
    expect(service.isESignForward('IS', 'OB', 'VE2')).toBeFalse();
    expect(service.isESignForward('ES', 'RT', 'VE2')).toBeFalse();
    expect(service.isESignForward('ES', 'OB', 'VE1')).toBeFalse();
  });

  it('prepares eSign and returns backend message and documents', (done) => {
    esignApi.prepareForESign.and.returnValue(of({
      status: true,
      message: 'Ready for eSign',
      object: [{ docName: 'Form PDF' }],
    }));

    service.start({ id: 'C_ID', status: 'OB' }).subscribe((prepared) => {
      expect(esignApi.prepareForESign).toHaveBeenCalledWith(jasmine.objectContaining({
        claimId: 'C_ID',
        status: 'OB',
      }));
      expect(prepared?.message).toBe('Ready for eSign');
      expect(prepared?.documents.length).toBe(1);
      expect(commonService.hideLoader).toHaveBeenCalled();
      done();
    });
  });

  it('shows backend prepare failure and does not return prepared state', (done) => {
    esignApi.prepareForESign.and.returnValue(of({
      status: false,
      message: 'Prepare failed',
    }));

    service.start({ id: 'C_ID' }).subscribe((prepared) => {
      expect(prepared).toBeNull();
      expect(commonService.showMessage).toHaveBeenCalledWith('Prepare failed', 'danger');
      done();
    });
  });

  it('shows generic prepare failure on API error', (done) => {
    esignApi.prepareForESign.and.returnValue(throwError(() => new Error('network')));

    service.start({ id: 'C_ID' }).subscribe((prepared) => {
      expect(prepared).toBeNull();
      expect(commonService.showMessage).toHaveBeenCalledWith('Unable to prepare eSign request.', 'danger');
      done();
    });
  });

  it('performs eSign, stores gateway context, and navigates to module eSign route', (done) => {
    esignApi.performESign.and.returnValue(of({
      status: true,
      object: 'https://esign.example/gateway',
    }));
    spyOn(localStorage, 'setItem');
    const docs = [{ docName: 'Form PDF' }];

    service.perform({ id: 'C_ID', status: 'OB' }, docs).subscribe((started) => {
      expect(started).toBeTrue();
      expect(esignApi.performESign).toHaveBeenCalledWith(jasmine.objectContaining({
        claimId: 'C_ID',
        eSignTransDocDTOs: docs,
        name: 'Verifier',
      }));
      expect(localStorage.setItem).toHaveBeenCalledWith(environment.esignConfig.gatewayStorageKey, 'https://esign.example/gateway');
      expect(localStorage.setItem).toHaveBeenCalledWith(environment.esignConfig.redirectStorageKey, '/claim/approver/form-pmt-duty-claim?id=C_ID');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/claim/approver/esign');
      done();
    });
  });

  it('shows backend perform failure and does not navigate', (done) => {
    esignApi.performESign.and.returnValue(of({
      status: false,
      message: 'Perform failed',
    }));

    service.perform({ id: 'C_ID' }, []).subscribe((started) => {
      expect(started).toBeFalse();
      expect(commonService.showMessage).toHaveBeenCalledWith('Perform failed', 'danger');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      done();
    });
  });

  it('shows eSign redirect feedback and clears handled params', () => {
    const route = {
      queryParamMap: of(convertToParamMap({ esignStatus: 'SC', txnId: 'TXN-1' })),
    } as ActivatedRoute;

    service.handleEsignFeedback(route);

    expect(commonService.showMessage).toHaveBeenCalledWith(
      'eSign completed successfully. Transaction ID: TXN-1',
      'success',
    );
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      relativeTo: route,
      queryParams: { esignStatus: null, txnId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));
  });
});
